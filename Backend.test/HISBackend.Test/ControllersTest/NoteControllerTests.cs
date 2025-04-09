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
    /// Tests for the NoteController functionality
    /// </summary>
    public class NoteControllerTests
    {
        private MyAppDbContext _context;
        private NoteController _controller;

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new NoteController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test data for notes, patients, and appointments
        /// </summary>
        private void SeedDatabase()
        {
            var patient = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Raghad",
                LastName = "Ahmed",
                Email = "raghad.ahmed@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Patient
            };

            var doctor = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Smith",
                Email = "alex.smith@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Doctor,
                Specialty = SpecialtyType.General
            };

            var appointment = new Appointment
            {
                AppointmentId = Guid.NewGuid(),
                DoctorId = doctor.Id,
                PatientId = patient.Id,
                Date = DateTime.Now,
                Status = AppointmentStatus.Confirmed,
                Patient = patient
            };

            var medicalHistory = new MedicalHistory
            {
                PatientId = patient.Id,
                HistoryID = Guid.NewGuid(),
                Diagnosis = "Diagnosis",
                Allergies = "Allergies",
                Medicines = "Medicines"
            };

            var note = new Note
            {
                NoteId = Guid.NewGuid(),
                AppointmentId = appointment.Id,
                MedicalHistoryId = medicalHistory.Id,
                NoteText = "Note text"
            };

            _context.Users.AddRange(patient, doctor);
            _context.Appointments.Add(appointment);
            _context.MedicalHistories.Add(medicalHistory);
            _context.Notes.Add(note);
            _context.SaveChanges();
        }

        /// <summary>
        /// Verifies that GetNotesByPatient returns notes for a specific patient
        /// </summary>
        [Fact]
        public async Task GetNotesByPatient_ReturnsNotes()
        {
            // Arrange
            InitializeDatabase();
            var patient = _context.Users.Include(u => u.Appointments).First(u => u.Role == RoleType.Patient);
            var appointment = _context.Appointments.Include(a => a.Patient).First(a => a.PatientId == patient.Id);

            // Ensure the medical history exists
            var medicalHistory = _context.MedicalHistories.Include(mh => mh.Patient).FirstOrDefault(mh => mh.PatientId == patient.Id);
            if (medicalHistory == null)
            {
                medicalHistory = new MedicalHistory { PatientId = patient.Id, Patient = patient };
                _context.MedicalHistories.Add(medicalHistory);
                _context.SaveChanges();
            }

            var note = new Note
            {
                NoteId = Guid.NewGuid(),
                AppointmentId = appointment.Id,
                MedicalHistoryId = medicalHistory.Id,
                NoteText = "Note text"
            };
            _context.Notes.Add(note);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetNotesByPatient(patient.UserId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var notes = Assert.IsType<List<NoteDto>>(okResult.Value);
            Assert.Single(notes);
        }

        /// <summary>
        /// Verifies that CreateNote successfully creates a new note
        /// </summary>
        [Fact]
        public async Task CreateNote_ReturnsCreatedNote()
        {
            // Arrange
            InitializeDatabase();
            var appointment = _context.Appointments.Include(a => a.Patient).First();
            var medicalHistory = _context.MedicalHistories.First();

            var createDto = new NoteCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                MedicalHistoryId = medicalHistory.HistoryID,
                NoteText = "New note text"
            };

            // Act
            var result = await _controller.CreateNote(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdNote = Assert.IsType<NoteDto>(createdAtActionResult.Value);
            Assert.Equal(createDto.NoteText, createdNote.NoteText);
        }

        /// <summary>
        /// Verifies that CreateNote returns BadRequest when appointment doesn't exist
        /// </summary>
        [Fact]
        public async Task CreateNote_ReturnsBadRequest_WhenAppointmentDoesNotExist()
        {
            // Arrange
            InitializeDatabase();
            var createDto = new NoteCreateDto
            {
                AppointmentId = Guid.NewGuid(),
                MedicalHistoryId = Guid.NewGuid(),
                NoteText = "New note text"
            };

            // Act
            var result = await _controller.CreateNote(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Appointment does not exist", badRequestResult.Value);
        }

        /// <summary>
        /// Verifies that CreateNote returns BadRequest when medical history ID is missing
        /// </summary>
        [Fact]
        public async Task CreateNote_ReturnsBadRequest_WhenMedicalHistoryIdIsNotProvided()
        {
            // Arrange
            InitializeDatabase();
            var appointment = _context.Appointments.First();

            var createDto = new NoteCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                NoteText = "New note text"
            };

            // Act
            var result = await _controller.CreateNote(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("MedicalHistoryId is required", badRequestResult.Value);
        }

        /// <summary>
        /// Verifies that CreateNote returns BadRequest when medical history doesn't exist
        /// </summary>
        [Fact]
        public async Task CreateNote_ReturnsBadRequest_WhenMedicalHistoryDoesNotExist()
        {
            // Arrange
            InitializeDatabase();
            var appointment = _context.Appointments.First();

            var createDto = new NoteCreateDto
            {
                AppointmentId = appointment.AppointmentId,
                MedicalHistoryId = Guid.NewGuid(),
                NoteText = "New note text"
            };

            // Act
            var result = await _controller.CreateNote(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Medical history not found", badRequestResult.Value);
        }
    }
}
