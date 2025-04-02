using System.ComponentModel.DataAnnotations;

namespace HISBackend.DTOs
{
public class NoteCreateDto
{
    [Required]
    public Guid AppointmentId { get; set; }
    
    [Required]
    public string NoteText { get; set; }
    
    public Guid? MedicalHistoryId { get; set; }
}
}