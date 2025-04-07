using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HISBackend.Data;
using HISBackend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AuthController : ControllerBase
    {

        private readonly IConfiguration _config;
        private MyAppDbContext _context;

        public AuthController(IConfiguration config, MyAppDbContext context)
        {
            _config = config;
            _context = context;
        }

        // Login endpoint 
        // api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !VerifyPassword(model.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password");
            }

            // Generate Token 
            var token = GenerateJwtToken(user.Email, user.Role.ToString(), user.UserId.ToString());
            return Ok(new { token });

        }


        // VerifyPassword method 
        private bool VerifyPassword(string password, string storedHash)
        {
            //verify hashed passwords
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }


        // Generate token method 
        private string GenerateJwtToken(string email, string role, string userId)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]);

            var claims = new List<Claim>()
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("Uuid", userId)
            };

            var key = new SymmetricSecurityKey(secretKey);
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);


            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationMinutes"])),
                signingCredentials: credentials
    );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }


}