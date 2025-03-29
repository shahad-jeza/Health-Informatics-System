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
    public class NoteController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        public NoteController(MyAppDbContext context)
        {
            _context = context;
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
public async Task<ActionResult<NoteDto>> CreateNote([FromBody] NoteCreateDto createDto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    // Verify appointment exists
    var appointment = await _context.Appointments
        .Include(a => a.Patient)
        .FirstOrDefaultAsync(a => a.AppointmentId == createDto.AppointmentId);
    
    if (appointment == null)
    {
        return BadRequest("Appointment does not exist");
    }

    // MedicalHistory is required in your model
    if (!createDto.MedicalHistoryId.HasValue)
    {
        return BadRequest("MedicalHistoryId is required");
    }

    var medicalHistory = await _context.MedicalHistories
        .FirstOrDefaultAsync(mh => mh.HistoryID == createDto.MedicalHistoryId);
    
    if (medicalHistory == null)
    {
        return BadRequest("Medical history not found");
    }

    var note = new Note
    {
        NoteId = Guid.NewGuid(),
        AppointmentId = appointment.Id,
        MedicalHistoryId = medicalHistory.Id, // Now using the actual ID
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
    }
}