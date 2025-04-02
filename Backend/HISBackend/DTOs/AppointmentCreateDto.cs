using System.ComponentModel.DataAnnotations;

namespace HISBackend.DTOs
{
public class AppointmentCreateDto
{
    [Required]
    public Guid DoctorUserId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
}
}