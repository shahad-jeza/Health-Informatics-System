using System.ComponentModel.DataAnnotations;

namespace HISBackend.Models
{
    public class Appointment
    {

        [Key]
        public int Id { get; set; }

        public Guid AppointmentId { get; set; }

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Created; // Default state

        public DateTime Date { get; set; }

        //Forign keys: Patient (one-to-many) 
        public int? PatientId { get; set; }
        public User? Patient { get; set; }

        //Forign keys: Doctor (one-to-many) 
        [Required]
        public int DoctorId { get; set; }
        public User Doctor { get; set; }


        // Navigation property (One-to-One) each appointment have exactly one note
        public Note? Note { get; set; }

    }

    // Enum
    public enum AppointmentStatus
    {
        Created, // Defult state when admin creates a new appoinment 
        Confirmed,
        Cancelled
    }

}