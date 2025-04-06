using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        public PatientController(MyAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all patients with their details
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor")] // Both Admin and Doctor can access
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetAllPatients()
        {
            var patients = await _context.Users
                .Where(u => u.Role == RoleType.Patient)
                .Select(u => new PatientDto
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Phone = u.Phone
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(patients);
        }
    }
}