using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HISBackend.Data;
using HISBackend.DTOs;
using HISBackend.Models;
using System;
using System.Threading.Tasks;

namespace HISBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        public MedicalHistoryController(MyAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves medical history for a specific patient
        /// </summary>
        /// <param name="patientUserId">GUID of the patient (User.UserId)</param>
        [HttpGet("{patientUserId}")]
        public async Task<ActionResult<MedicalHistoryDto>> GetMedicalHistory(Guid patientUserId)
        {
            var medicalHistory = await _context.MedicalHistories
                .Include(mh => mh.Patient)
                .Where(mh => mh.Patient.UserId == patientUserId) // Match GUID to UserId
                .Select(mh => new MedicalHistoryDto
                {
                    Id = mh.Id,
                    HistoryID = mh.HistoryID,
                    Diagnosis = mh.Diagnosis,
                    Allergies = mh.Allergies,
                    Medicines = mh.Medicines
                })
                .FirstOrDefaultAsync();

            if (medicalHistory == null)
            {
                return NotFound();
            }

            return Ok(medicalHistory);
        }

        /// <summary>
        /// Updates or creates medical history for a patient
        /// </summary>
        /// <param name="patientUserId">GUID of the patient (User.UserId)</param>
        [HttpPut("{patientUserId}")]
        public async Task<IActionResult> UpdateMedicalHistory(Guid patientUserId, [FromBody] MedicalHistoryUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // First find the patient's internal ID
            var patientId = await _context.Users
                .Where(u => u.UserId == patientUserId)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            if (patientId == 0)
            {
                return NotFound("Patient not found");
            }

            var medicalHistory = await _context.MedicalHistories
                .FirstOrDefaultAsync(mh => mh.PatientId == patientId); // Use internal ID here

            if (medicalHistory == null)
            {
                medicalHistory = new MedicalHistory
                {
                    PatientId = patientId, // Internal ID
                    HistoryID = Guid.NewGuid(),
                    Diagnosis = updateDto.Diagnosis,
                    Allergies = updateDto.Allergies,
                    Medicines = updateDto.Medicines
                };
                _context.MedicalHistories.Add(medicalHistory);
            }
            else
            {
                medicalHistory.Diagnosis = updateDto.Diagnosis ?? medicalHistory.Diagnosis;
                medicalHistory.Allergies = updateDto.Allergies ?? medicalHistory.Allergies;
                medicalHistory.Medicines = updateDto.Medicines ?? medicalHistory.Medicines;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MedicalHistoryExists(patientId))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        private bool MedicalHistoryExists(int patientId)
        {
            return _context.MedicalHistories.Any(mh => mh.PatientId == patientId);
        }
    }
}