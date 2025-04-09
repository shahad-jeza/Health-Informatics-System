using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Bugsnag;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly MyAppDbContext _context;
        private readonly IClient _bugsnag;


        public AppointmentController(MyAppDbContext context, IClient bugsnag)
        {
            _context = context;
            _bugsnag = bugsnag;
        }

        // GET: api/appointment/doctor/{doctorUserId}
        [HttpGet("doctor/{doctorUserId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByDoctor(Guid doctorUserId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.Doctor.UserId == doctorUserId)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    DoctorUserId = a.Doctor.UserId,
                    PatientUserId = a.Patient != null ? a.Patient.UserId : (Guid?)null,
                    Status = a.Status,
                    Date = a.Date,
                    DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}"
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointment/patient/{patientUserId}
        [HttpGet("patient/{patientUserId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByPatient(Guid patientUserId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.Patient != null && a.Patient.UserId == patientUserId)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    DoctorUserId = a.Doctor.UserId,
                    PatientUserId = patientUserId,
                    Status = a.Status,
                    Date = a.Date,
                    DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}"
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointment/created
        [HttpGet("created")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetCreatedAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Where(a => a.Status == AppointmentStatus.Created)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    DoctorUserId = a.Doctor.UserId,
                    PatientUserId = a.Patient != null ? a.Patient.UserId : (Guid?)null,
                    Status = a.Status,
                    Date = a.Date,
                    DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}"
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // POST: api/appointment
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] AppointmentCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find doctor by UserId (GUID)
            var doctor = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == createDto.DoctorUserId && u.Role == RoleType.Doctor);

            if (doctor == null)
            {
                return BadRequest("Doctor does not exist");
            }

            var appointment = new Appointment
            {
                AppointmentId = Guid.NewGuid(),
                DoctorId = doctor.Id, // Internal ID
                Date = createDto.Date,
                Status = AppointmentStatus.Created,
                PatientId = null
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCreatedAppointments),
                new AppointmentDto
                {
                    AppointmentId = appointment.AppointmentId,
                    DoctorUserId = doctor.UserId,
                    Status = appointment.Status,
                    Date = appointment.Date
                });
        }

        // PUT: api/appointment/{appointmentId}
        [HttpPut("{appointmentId}")]
        public async Task<IActionResult> UpdateAppointment(Guid appointmentId, [FromBody] AppointmentUpdateDto updateDto)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);
                // If appointment does not exist, log the event 

                if (appointment == null)
                {
                    _bugsnag.Notify(new Exception("Appointment not found"), report => {
                        report.Event.Severity = Severity.Info;
                        report.Event.Metadata.Add("AppointmentId", appointmentId.ToString());
                    });
                    return NotFound();
                }

                switch (updateDto.Status)
                {
                    case AppointmentStatus.Confirmed when updateDto.PatientUserId.HasValue:
                        var patient = await _context.Users
                            .FirstOrDefaultAsync(u => u.UserId == updateDto.PatientUserId && u.Role == RoleType.Patient);

                        if (patient == null)
                        {
                            _bugsnag.Notify(new Exception("Patient not found"), report => {
                                report.Event.Severity = Severity.Warning;
                                report.Event.Metadata.Add("PatientUserId", updateDto.PatientUserId.ToString());
                            });
                            return BadRequest("Patient not found");
                        }

                        appointment.PatientId = patient.Id;
                        appointment.Status = AppointmentStatus.Confirmed;
                        break;

                    case AppointmentStatus.Cancelled:
                        appointment.Status = AppointmentStatus.Cancelled;
                        appointment.PatientId = null;
                        break;
                    // Any unsupported update case triggers a warning
                    default:
                        _bugsnag.Notify(new Exception("Invalid status update"), report => {
                            report.Event.Severity = Severity.Warning;
                            report.Event.Metadata.Add("Status", updateDto.Status.ToString());
                        });
                        return BadRequest("Invalid update operation");
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                // Log unexpected exceptions and provide relevant metadata

                _bugsnag.Notify(ex, report => {
                    report.Event.Metadata.Add("Endpoint", "Appointment/Update");
                });
                return StatusCode(500, "Failed to update appointment");
            }
        }
    }
}