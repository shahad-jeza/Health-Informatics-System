using System.ComponentModel.DataAnnotations;

namespace HISBackend.Models
{

    public class Note
    {

        [Key]
        public int Id { get; set; }

        public Guid NoteId { get; set; }

        public string? NoteText { get; set; }

        // Forigen Key: Appointment ( One-to-One ) each note belong to one appointment
        public Appointment Appointment { get; set; }
        public int AppointmentId { get; set; }

        // Forigen Key: Medical history (One-to-Many) each note beloong to one medical history 
        public MedicalHistory MedicalHistory { get; set; }
        public int MedicalHistoryId { get; set; }
    }


}