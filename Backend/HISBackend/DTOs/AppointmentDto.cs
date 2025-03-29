using HISBackend.Models;

namespace HISBackend.DTOs
{

public class AppointmentDto
{
    public Guid AppointmentId { get; set; }
    public Guid DoctorUserId { get; set; }
    public Guid? PatientUserId { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime Date { get; set; }
    public string? DoctorName { get; set; }
}
}