using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        public DoctorController(MyAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all doctors with their details
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetAllDoctors()
        {
            var doctors = await _context.Users
                .Where(u => u.Role == RoleType.Doctor)
                .Select(u => new DoctorDto
                {
                    UserId = u.UserId,  // Using GUID
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Specialty = u.Specialty.ToString()
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(doctors);
        }


    }
}