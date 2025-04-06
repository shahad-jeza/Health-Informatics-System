namespace HISBackend.DTOs
{
    public class AdminSummaryDto
    {
        public List<DoctorDto> Doctors { get; set; }
        public List<PatientDto> Patients { get; set; }
    }
}