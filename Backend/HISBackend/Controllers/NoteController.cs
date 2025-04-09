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
    public class NoteController : ControllerBase
    {
        private readonly MyAppDbContext _context;
        private readonly IClient _bugsnag;


        public NoteController(MyAppDbContext context, IClient bugsnag)
        {
            _context = context;
            _bugsnag = bugsnag;
        }


        /// <summary>
        /// Gets all notes for a specific patient (by patient UserId GUID)
        /// </summary>
        [HttpGet("patient/{patientUserId}")]
        public async Task<ActionResult<IEnumerable<NoteDto>>> GetNotesByPatient(Guid patientUserId)
        {
            var notes = await _context.Notes
                .Include(n => n.Appointment)
                    .ThenInclude(a => a.Patient)
                .Include(n => n.MedicalHistory)
                .Where(n => n.Appointment.Patient.UserId == patientUserId)
                .Select(n => new NoteDto
                {
                    NoteId = n.NoteId,
                    AppointmentId = n.Appointment.AppointmentId,
                    MedicalHistoryId = n.MedicalHistory != null ? n.MedicalHistory.HistoryID : (Guid?)null,
                    NoteText = n.NoteText
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(notes);
        }

        /// <summary>
        /// Creates a new note for an appointment
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<NoteDto>> CreateNote([FromBody] NoteCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _bugsnag.Notify(new Exception("Invalid note data"), report => {
                        report.Event.Severity = Severity.Warning;
                    });
                    return BadRequest(ModelState);
                }

                // Verify appointment exists and check for existing note
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Note) // Include the Note navigation property
                 
                    .FirstOrDefaultAsync(a => a.AppointmentId == createDto.AppointmentId);

                // If the appointment doesn't exist, return an error


                if (appointment == null)
                {
                    _bugsnag.Notify(new Exception("Appointment not found"), report => {
                        report.Event.Severity = Severity.Info;
                        report.Event.Metadata.Add("AppointmentId", createDto.AppointmentId.ToString());
                    });
                    return BadRequest("Appointment does not exist");
                }

                // Check if appointment already has a note
                if (appointment.Note != null)
                {
                    _bugsnag.Notify(new Exception("Appointment already has a note"), report => {
                        report.Event.Severity = Severity.Warning;
                        report.Event.Metadata.Add("AppointmentId", createDto.AppointmentId.ToString());
                        report.Event.Metadata.Add("ExistingNoteId", appointment.Note.NoteId.ToString());
                    });
                    return BadRequest("Appointment already has a note");
                }

                if (!createDto.MedicalHistoryId.HasValue)
                {
                    _bugsnag.Notify(new Exception("MedicalHistoryId missing"), report => {
                        report.Event.Severity = Severity.Warning;
                    });
                    return BadRequest("MedicalHistoryId is required");
                }

                var medicalHistory = await _context.MedicalHistories
                    .FirstOrDefaultAsync(mh => mh.HistoryID == createDto.MedicalHistoryId);

                if (medicalHistory == null)
                {
                    _bugsnag.Notify(new Exception("Medical history not found"), report => {
                        report.Event.Severity = Severity.Info;
                        report.Event.Metadata.Add("MedicalHistoryId", createDto.MedicalHistoryId.ToString());
                    });
                    return BadRequest("Medical history not found");
                }

                var note = new Note
                {
                    NoteId = Guid.NewGuid(),
                    AppointmentId = appointment.Id,
                    MedicalHistoryId = medicalHistory.Id,
                    NoteText = createDto.NoteText
                };

                _context.Notes.Add(note);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetNotesByPatient),
                    new { patientUserId = appointment.Patient.UserId },
                    new NoteDto
                    {
                        NoteId = note.NoteId,
                        AppointmentId = appointment.AppointmentId,
                        MedicalHistoryId = medicalHistory.HistoryID,
                        NoteText = note.NoteText
                    });
            }
            catch (Exception ex)
            {
                // Log any unexpected exceptions and include relevant metadata
                _bugsnag.Notify(ex, report => {
                    report.Event.Metadata.Add("Endpoint", "Notes/CreateNote");
                });
                return StatusCode(500, "Failed to create note");
            }
        }
    }
}