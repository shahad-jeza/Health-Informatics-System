namespace HISBackend.DTOs
{
    public class AdminStatisticsDto
    {
        public int TotalDoctors { get; set; }
        public int TotalPatients { get; set; }
        public int TodayAppointments { get; set; }
        public int WeeklyAppointments { get; set; }
        public List<StatusStatDto> AppointmentStatusStats { get; set; }
        public List<SpecialtyStatDto> PopularSpecialties { get; set; }
    }
}