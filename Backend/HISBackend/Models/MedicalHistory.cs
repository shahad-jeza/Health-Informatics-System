using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HISBackend.Models
{


    public class MedicalHistory
    {

        [Key]
        public int Id { get; set; }

        public Guid HistoryID { get; set; }

        public string? Diagnosis { get; set; }
        public string? Allergies { get; set; }
        public string? Medicines { get; set; }

        // Foriegn key : Patient ( One-to-One ) A Patient have one Medical history
        public int PatientId { get; set; }
        public User Patient { get; set; }

        // Navigation property : (One-to-Many) on medical history can have many notes 
        public ICollection<Note> Notes { get; set; } = new List<Note>();

    }


}