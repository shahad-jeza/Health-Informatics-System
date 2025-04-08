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
    public class PatientControllerTests
    {
        private MyAppDbContext _context;
        private PatientController _controller;

        public PatientControllerTests()
        {
        }

        /// <summary>
        /// Initializes the in-memory database and the controller.
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new PatientController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Seeds the in-memory database with test data.
        /// </summary>
        private void SeedDatabase()
        {
            var patient1 = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Smith",
                Email = "alex@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Patient,
                Phone = "123-456-7890"
            };

            var patient2 = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Raghad",
                LastName = "Ahmed",
                Email = "raghad@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Patient,
                Phone = "098-765-4321"
            };

            var doctor = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Alice",
                LastName = "Johnson",
                Email = "alice@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Doctor,
                Specialty = SpecialtyType.General
            };

            _context.Users.AddRange(patient1, patient2, doctor);
            _context.SaveChanges();
        }

        /// <summary>
        /// Tests the GetAllPatients method to ensure it returns all patients.
        /// </summary>
        [Fact]
        public async Task GetAllPatients_ReturnsAllPatients()
        {
            // Arrange
            InitializeDatabase();

            // Act
            var result = await _controller.GetAllPatients();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var patients = Assert.IsType<List<PatientDto>>(okResult.Value);
            Assert.Equal(2, patients.Count);
        }
    }
}
