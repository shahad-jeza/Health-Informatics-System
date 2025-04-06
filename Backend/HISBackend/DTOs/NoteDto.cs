namespace HISBackend.DTOs
{
    public class NoteDto
    {
        public Guid NoteId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? MedicalHistoryId { get; set; }
        public string NoteText { get; set; }
    }
}