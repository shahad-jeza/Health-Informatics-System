using System.ComponentModel.DataAnnotations;

namespace HISBackend.Models
{

    public class User
    {

        [Key]
        public int Id { get; set; }

        public Guid UserId { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        public string PasswordHash { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        public string? Phone { get; set; }

        [Required]
        public RoleType Role { get; set; }

        public SpecialtyType? Specialty { get; set; } // Only applicable for doctors

        // Navigation property (One-to-One) one Patient can have one medical history 
        public MedicalHistory? MedicalHistory { get; set; }

        // Navigation property (One-to-Many) A user (Doctor/Patient/Admin) can have multiple appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }

    // Enums
    public enum RoleType
    {
        Patient,
        Doctor,
        Admin
    }

    public enum SpecialtyType
    {
        Dentisity,
        General,
        Dermatolgy,
        Neurology
    }


}