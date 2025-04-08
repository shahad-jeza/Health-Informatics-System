using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using HISBackend.Controllers;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace HISBackend.Tests.Controllers
{
    /// <summary>
    /// Tests for authentication functionality
    /// </summary>
    public class AuthControllerTests
    {
        private MyAppDbContext _context;
        private AuthController _controller;
        private Mock<IConfiguration> _mockConfig;

        public AuthControllerTests()
        {
            // Mock the configuration for JWT settings
            _mockConfig = new Mock<IConfiguration>();
            var inMemorySettings = new Dictionary<string, string> {
                {"JwtSettings:Secret", "supersecretkey12345678901234567890"},
                {"JwtSettings:Issuer", "TestIssuer"},
                {"JwtSettings:Audience", "TestAudience"},
                {"JwtSettings:ExpirationMinutes", "60"}
            };

            _mockConfig.Setup(c => c.GetSection(It.IsAny<string>())).Returns((string key) =>
            {
                var mockSection = new Mock<IConfigurationSection>();
                mockSection.Setup(a => a[It.IsAny<string>()]).Returns((string k) => inMemorySettings[$"{key}:{k}"]);
                return mockSection.Object;
            });
        }

        /// <summary>
        /// Sets up a new in-memory database instance for testing
        /// </summary>
        private void InitializeDatabase()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new AuthController(_mockConfig.Object, _context);

            SeedDatabase();
        }

        /// <summary>
        /// Populates the database with test user
        /// </summary>
        private void SeedDatabase()
        {
            var user = new User
            {
                UserId = Guid.NewGuid(),
                FirstName = "Raghad",
                LastName = "Ahmed",
                Email = "raghad.ahmed@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = RoleType.Admin
            };

            _context.Users.Add(user);
            _context.SaveChanges();
        }

        /// <summary>
        /// Verifies login returns a token when valid credentials are provided
        /// </summary>
        [Fact]
        public async Task Login_ReturnsToken_WhenCredentialsAreValid()
        {
            // Arrange
            InitializeDatabase();
            var loginDto = new LoginDto
            {
                Email = "raghad.ahmed@gmail.com",
                Password = "password"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var token = Assert.IsType<string>(okResult.Value.GetType().GetProperty("token").GetValue(okResult.Value, null));
            Assert.NotNull(token);
        }

        /// <summary>
        /// Verifies login returns unauthorized when invalid credentials are provided
        /// </summary>
        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
        {
            // Arrange
            InitializeDatabase();
            var loginDto = new LoginDto
            {
                Email = "raghad.ahmed@gmail.com",
                Password = "wrongpassword"
            };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid email or password", unauthorizedResult.Value);
        }
    }
}
