namespace HISBackend.DTOs
{
    public class MedicalHistoryDto
    {

        public int Id { get; set; }
        public Guid HistoryID { get; set; }
        public string? Diagnosis { get; set; }
        public string? Allergies { get; set; }
        public string? Medicines { get; set; }
    }
}