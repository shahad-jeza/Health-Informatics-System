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
    /// Tests for AdminController functionality
    /// </summary>
    public class AdminControllerTests
    {
        private MyAppDbContext _context;
        private AdminController _controller;

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            // Create unique in-memory database for test isolation
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new AdminController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test data
        /// </summary>
        private void SeedDatabase()
        {
            // Add test doctor
            var doctors = new List<User>
            {
                new User { 
                    UserId = Guid.NewGuid(), 
                    FirstName = "Raghad", 
                    LastName = "Alahmadi", 
                    Email = "Raghad@gmail.com", 
                    Phone = "1234567890", 
                    Role = RoleType.Doctor, 
                    Specialty = SpecialtyType.General, 
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("doctor123") 
                }
            };

            // Add test patient
            var patients = new List<User>
            {
                new User { 
                    UserId = Guid.NewGuid(), 
                    FirstName = "Alex", 
                    LastName = "Jan", 
                    Email = "jan@gmail.com", 
                    Phone = "0987654321", 
                    Role = RoleType.Patient, 
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("patient123")  
                }
            };

            _context.Users.AddRange(doctors);
            _context.Users.AddRange(patients);
            _context.SaveChanges();
        }

        /// <summary>
        /// Verifies GetSummary returns correct doctor and patient lists
        /// </summary>
        [Fact]
        public async Task GetSummary_ReturnsSummary()
        {
            // Arrange
            InitializeDatabase();

            // Act
            var result = await _controller.GetSummary();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var summary = Assert.IsType<AdminSummaryDto>(okResult.Value);
            Assert.Single(summary.Doctors);
            Assert.Single(summary.Patients);
        }

        /// <summary>
        /// Verifies GetStatistics returns accurate system metrics
        /// </summary>
        [Fact]
        public async Task GetStatistics_ReturnsStatistics()
        {
            // Arrange
            InitializeDatabase();

            // Set up test appointments
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            var appointments = new List<Appointment>
            {
                new Appointment { Date = today, Status = AppointmentStatus.Confirmed, DoctorId = 1, PatientId = 2 },
                new Appointment { Date = startOfWeek.AddDays(1), Status = AppointmentStatus.Cancelled, DoctorId = 1, PatientId = 2 }
            };

            _context.Appointments.AddRange(appointments);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetStatistics();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var statistics = Assert.IsType<AdminStatisticsDto>(okResult.Value);
            Assert.Equal(1, statistics.TotalDoctors);
            Assert.Equal(1, statistics.TotalPatients);
            Assert.Equal(1, statistics.TodayAppointments);
            Assert.Equal(2, statistics.WeeklyAppointments);
            Assert.Equal(2, statistics.AppointmentStatusStats.Count);
            Assert.Single(statistics.PopularSpecialties);
        }
    }
}
