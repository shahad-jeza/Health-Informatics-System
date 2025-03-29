namespace HISBackend.DTOs
{
    public class AppointmentDetailDto : AppointmentDto
    {
        public string DoctorName { get; set; }
        public string DoctorSpecialty { get; set; }
        public string PatientName { get; set; }
    }
}