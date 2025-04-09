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
    /// Tests for the DoctorController functionality
    /// </summary>
    public class DoctorControllerTests
    {
        private MyAppDbContext _context;
        private DoctorController _controller;

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new DoctorController(_context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test doctor data
        /// </summary>
        private void SeedDatabase()
        {
            var doctors = new List<User>
            {
                new User {
                    UserId = Guid.NewGuid(),
                    FirstName = "Alex",
                    LastName = "Smith",
                    Email = "alex.smith@gmail.com",
                    Phone = "1234567890",
                    Role = RoleType.Doctor,
                    Specialty = SpecialtyType.General,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("hashedpassword")
                }
            };

            _context.Users.AddRange(doctors);
            _context.SaveChanges();
        }

        /// <summary>
        /// Verifies GetAllDoctors returns the list of doctor users
        /// </summary>
        [Fact]
        public async Task GetAllDoctors_ReturnsDoctors()
        {
            // Arrange
            InitializeDatabase();

            // Act
            var result = await _controller.GetAllDoctors();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var doctors = Assert.IsType<List<DoctorDto>>(okResult.Value);
            Assert.Single(doctors);
            Assert.Equal("Alex", doctors[0].FirstName);
            Assert.Equal("Smith", doctors[0].LastName);
        }
    }
}
