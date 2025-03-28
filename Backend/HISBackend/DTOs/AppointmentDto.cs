using HISBackend.Models;

namespace HISBackend.DTOs
{

    public class AppointmentDto
    {
        public int Id { get; set; }
        public Guid AppointmentId { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Created;
        public DateTime Date { get; set; }
    }
}