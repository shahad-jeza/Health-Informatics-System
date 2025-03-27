namespace HISBackend.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public Guid NoteId { get; set; }
        public string? NoteText { get; set; }
    }
}