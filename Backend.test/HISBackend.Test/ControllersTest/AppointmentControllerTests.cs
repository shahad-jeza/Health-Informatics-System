using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Controllers;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace HISBackend.Tests.Controllers
{
    /// <summary>
    /// Tests for AppointmentController functionality
    /// </summary>
    public class AppointmentControllerTests
    {
        private MyAppDbContext _context;
        private AppointmentController _controller;

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new AppointmentController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test data
        /// </summary>
        private void SeedDatabase()
        {
            var doctor = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Smith",
                Email = "alex.smith@gmail.com",
                Phone = "1234567890",
                Role = RoleType.Doctor,
                Specialty = SpecialtyType.General,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("hashedpassword")
            };

            var patient = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Raghad",
                LastName = "Alahmadi",
                Email = "raghad@gmail.com",
                Phone = "0987654321",
                Role = RoleType.Patient,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("hashedpassword")
            };

            _context.Users.AddRange(doctor, patient);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetAppointmentsByDoctor_ReturnsAppointments()
        {
            // Arrange
            InitializeDatabase();
            var doctor = _context.Users.First(u => u.Role == RoleType.Doctor);
            var patient = _context.Users.First(u => u.Role == RoleType.Patient);

            var appointments = new List<Appointment>
            {
                new Appointment { AppointmentId = Guid.NewGuid(), DoctorId = doctor.Id, PatientId = patient.Id, Date = DateTime.Now, Status = AppointmentStatus.Confirmed }
            };

            _context.Appointments.AddRange(appointments);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetAppointmentsByDoctor(doctor.UserId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedAppointments = Assert.IsType<List<AppointmentDto>>(okResult.Value);
            Assert.Single(returnedAppointments);
        }

        [Fact]
        public async Task GetAppointmentsByPatient_ReturnsAppointments()
        {
            // Arrange
            InitializeDatabase();
            var doctor = _context.Users.First(u => u.Role == RoleType.Doctor);
            var patient = _context.Users.First(u => u.Role == RoleType.Patient);

            var appointments = new List<Appointment>
            {
                new Appointment { AppointmentId = Guid.NewGuid(), DoctorId = doctor.Id, PatientId = patient.Id, Date = DateTime.Now, Status = AppointmentStatus.Confirmed }
            };

            _context.Appointments.AddRange(appointments);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetAppointmentsByPatient(patient.UserId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedAppointments = Assert.IsType<List<AppointmentDto>>(okResult.Value);
            Assert.Single(returnedAppointments);
        }

        [Fact]
        public async Task GetCreatedAppointments_ReturnsCreatedAppointments()
        {
            // Arrange
            InitializeDatabase();
            var doctor = _context.Users.First(u => u.Role == RoleType.Doctor);

            var appointments = new List<Appointment>
            {
                new Appointment { AppointmentId = Guid.NewGuid(), DoctorId = doctor.Id, Date = DateTime.Now, Status = AppointmentStatus.Created }
            };

            _context.Appointments.AddRange(appointments);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetCreatedAppointments();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedAppointments = Assert.IsType<List<AppointmentDto>>(okResult.Value);
            Assert.Single(returnedAppointments);
        }

        [Fact]
        public async Task CreateAppointment_ReturnsCreatedAppointment()
        {
            // Arrange
            InitializeDatabase();
            var doctor = _context.Users.First(u => u.Role == RoleType.Doctor);

            var createDto = new AppointmentCreateDto
            {
                DoctorUserId = doctor.UserId,
                Date = DateTime.Now
            };

            // Act
            var result = await _controller.CreateAppointment(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdAppointment = Assert.IsType<AppointmentDto>(createdAtActionResult.Value);
            Assert.Equal(createDto.DoctorUserId, createdAppointment.DoctorUserId);
            Assert.Equal(createDto.Date, createdAppointment.Date);
        }

        [Fact]
        public async Task UpdateAppointment_UpdatesAppointment()
        {
            // Arrange
            InitializeDatabase();
            var doctor = _context.Users.First(u => u.Role == RoleType.Doctor);
            var patient = _context.Users.First(u => u.Role == RoleType.Patient);

            var appointment = new Appointment
            {
                AppointmentId = Guid.NewGuid(),
                DoctorId = doctor.Id,
                Date = DateTime.Now,
                Status = AppointmentStatus.Created
            };

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            var updateDto = new AppointmentUpdateDto
            {
                PatientUserId = patient.UserId,
                Status = AppointmentStatus.Confirmed
            };

            // Act
            var result = await _controller.UpdateAppointment(appointment.AppointmentId, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedAppointment = await _context.Appointments.FindAsync(appointment.Id);
            Assert.Equal(AppointmentStatus.Confirmed, updatedAppointment.Status);
            Assert.Equal(patient.Id, updatedAppointment.PatientId);
        }
    }
}
