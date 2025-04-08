using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
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
    /// Tests for the MedicalHistoryController functionality
    /// </summary>
    public class MedicalHistoryControllerTests
    {
        private MyAppDbContext _context;
        private MedicalHistoryController _controller;

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new MedicalHistoryController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test patient and medical history data
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

            _context.Users.Add(patient);
            _context.SaveChanges();

            var medicalHistory = new MedicalHistory
            {
                PatientId = patient.Id,
                HistoryID = Guid.NewGuid(),
                Diagnosis = "Diagnosis",
                Allergies = "Allergies",
                Medicines = "Medicines"
            };

            _context.MedicalHistories.Add(medicalHistory);
            _context.SaveChanges();
        }

        /// <summary>
        /// Verifies that GetMedicalHistory returns the medical history for a patient
        /// </summary>
        [Fact]
        public async Task GetMedicalHistory_ReturnsMedicalHistory()
        {
            // Arrange
            InitializeDatabase();
            var patient = _context.Users.First(u => u.Role == RoleType.Patient);

            // Act
            var result = await _controller.GetMedicalHistory(patient.UserId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var medicalHistory = Assert.IsType<MedicalHistoryDto>(okResult.Value);
            Assert.Equal("Diagnosis", medicalHistory.Diagnosis);
        }

        /// <summary>
        /// Verifies that GetMedicalHistory returns NotFound when no medical history exists
        /// </summary>
        [Fact]
        public async Task GetMedicalHistory_ReturnsNotFound_WhenMedicalHistoryDoesNotExist()
        {
            // Arrange
            InitializeDatabase();
            var nonExistentPatientId = Guid.NewGuid();

            // Act
            var result = await _controller.GetMedicalHistory(nonExistentPatientId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        /// <summary>
        /// Verifies that UpdateMedicalHistory updates an existing medical history
        /// </summary>
        [Fact]
        public async Task UpdateMedicalHistory_UpdatesMedicalHistory()
        {
            // Arrange
            InitializeDatabase();
            var patient = _context.Users.First(u => u.Role == RoleType.Patient);

            var updateDto = new MedicalHistoryUpdateDto
            {
                Diagnosis = "Updated Diagnosis",
                Allergies = "Updated Allergies",
                Medicines = "Updated Medicines"
            };

            // Act
            var result = await _controller.UpdateMedicalHistory(patient.UserId, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedMedicalHistory = await _context.MedicalHistories.FirstOrDefaultAsync(mh => mh.PatientId == patient.Id);
            Assert.Equal("Updated Diagnosis", updatedMedicalHistory.Diagnosis);
            Assert.Equal("Updated Allergies", updatedMedicalHistory.Allergies);
            Assert.Equal("Updated Medicines", updatedMedicalHistory.Medicines);
        }

        /// <summary>
        /// Verifies that UpdateMedicalHistory creates a new medical history when none exists
        /// </summary>
        [Fact]
        public async Task UpdateMedicalHistory_CreatesMedicalHistory_WhenItDoesNotExist()
        {
            // Arrange
            InitializeDatabase();
            var newPatient = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Smith",
                Email = "alex.smith@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Patient
            };

            _context.Users.Add(newPatient);
            _context.SaveChanges();

            var updateDto = new MedicalHistoryUpdateDto
            {
                Diagnosis = "New Diagnosis",
                Allergies = "New Allergies",
                Medicines = "New Medicines"
            };

            // Act
            var result = await _controller.UpdateMedicalHistory(newPatient.UserId, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var createdMedicalHistory = await _context.MedicalHistories.FirstOrDefaultAsync(mh => mh.PatientId == newPatient.Id);
            Assert.Equal("New Diagnosis", createdMedicalHistory.Diagnosis);
            Assert.Equal("New Allergies", createdMedicalHistory.Allergies);
            Assert.Equal("New Medicines", createdMedicalHistory.Medicines);
        }

        /// <summary>
        /// Verifies that UpdateMedicalHistory returns NotFound when patient doesn't exist
        /// </summary>
        [Fact]
        public async Task UpdateMedicalHistory_ReturnsNotFound_WhenPatientDoesNotExist()
        {
            // Arrange
            InitializeDatabase();
            var nonExistentPatientId = Guid.NewGuid();

            var updateDto = new MedicalHistoryUpdateDto
            {
                Diagnosis = "Diagnosis",
                Allergies = "Allergies",
                Medicines = "Medicines"
            };

            // Act
            var result = await _controller.UpdateMedicalHistory(nonExistentPatientId, updateDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Patient not found", notFoundResult.Value);
        }
    }
}
