using HISBackend.Models;


namespace HISBackend.DTOs
{
public class AppointmentUpdateDto
{
    public Guid? PatientUserId { get; set; }
    public AppointmentStatus Status { get; set; }
}
}
