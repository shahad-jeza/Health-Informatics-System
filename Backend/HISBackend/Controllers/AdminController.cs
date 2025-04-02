using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        public AdminController(MyAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets summary of all doctors and patients
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<AdminSummaryDto>> GetSummary()
        {
            var summary = new AdminSummaryDto
            {
                Doctors = await _context.Users
                    .Where(u => u.Role == RoleType.Doctor)
                    .Select(u => new DoctorDto  // Changed to DoctorDto
                    {
                        UserId = u.UserId,  // Using GUID
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        Phone = u.Phone,
                        Specialty = u.Specialty.ToString()
                    })
                    .AsNoTracking()
                    .ToListAsync(),
                
                Patients = await _context.Users
                    .Where(u => u.Role == RoleType.Patient)
                    .Select(u => new PatientDto  // Changed to PatientDto
                    {
                        UserId = u.UserId,  // Using GUID
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        Phone = u.Phone
                    })
                    .AsNoTracking()
                    .ToListAsync()
            };

            return Ok(summary);
        }

        /// <summary>
        /// Gets system statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<AdminStatisticsDto>> GetStatistics()
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            var statistics = new AdminStatisticsDto
            {
                TotalDoctors = await _context.Users
                    .CountAsync(u => u.Role == RoleType.Doctor),
                
                TotalPatients = await _context.Users
                    .CountAsync(u => u.Role == RoleType.Patient),
                
                TodayAppointments = await _context.Appointments
                    .CountAsync(a => a.Date.Date == today),
                
                WeeklyAppointments = await _context.Appointments
                    .CountAsync(a => a.Date >= startOfWeek && a.Date < endOfWeek),
                
                AppointmentStatusStats = await _context.Appointments
                    .GroupBy(a => a.Status)
                    .Select(g => new StatusStatDto
                    {
                        Status = g.Key.ToString(),
                        Count = g.Count()
                    })
                    .ToListAsync(),
                
                PopularSpecialties = await _context.Users
                    .Where(u => u.Role == RoleType.Doctor && u.Specialty != null)
                    .GroupBy(u => u.Specialty)
                    .Select(g => new SpecialtyStatDto
                    {
                        Specialty = g.Key.ToString(),
                        DoctorCount = g.Count()
                    })
                    .OrderByDescending(s => s.DoctorCount)
                    .Take(5)
                    .ToListAsync()
            };

            return Ok(statistics);
        }
    }
}