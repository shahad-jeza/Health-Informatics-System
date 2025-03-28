using Microsoft.EntityFrameworkCore;
using HISBackend.Models;

namespace HISBackend.Data
{
    public class MyAppDbContext : DbContext
    {
        // DbSet 
        public DbSet<User> Users { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<Note> Notes { get; set; }


        // Configure DB relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            // Enum conversion 
            modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

            modelBuilder.Entity<User>()
                .Property(u => u.Specialty)
                .HasConversion<string>();

            modelBuilder.Entity<Appointment>()
                .Property(a => a.Status)
                .HasConversion<string>();

            // ============================
            // User ↔ Appointment (One-to-Many)
            // ============================
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)   // Each appointment has one Patient
                .WithMany(u => u.Appointments) // A Patient can have multiple Appointments
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascading deletion

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor) // Each appointment has one Doctor
                .WithMany() // A Doctor can have multiple Appointments
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================
            // User (Patient) ↔ MedicalHistory (One-to-One)
            // ============================
            modelBuilder.Entity<MedicalHistory>()
                .HasOne(m => m.Patient) // A MedicalHistory is linked to one Patient
                .WithOne() // Each Patient has exactly one MedicalHistory
                .HasForeignKey<MedicalHistory>(m => m.PatientId)
                .OnDelete(DeleteBehavior.Cascade); // If Patient is deleted, remove MedicalHistory 

            // ============================
            // MedicalHistory ↔ Note (One-to-Many)
            // ============================
            modelBuilder.Entity<Note>()
                .HasOne(n => n.MedicalHistory) // A Note belongs to one MedicalHistory
                .WithMany(m => m.Notes) // A MedicalHistory can have multiple Notes
                .HasForeignKey(n => n.MedicalHistoryId)
                .OnDelete(DeleteBehavior.Cascade); // If MedicalHistory is deleted, remove Notes

            // ============================
            // Appointment ↔ Note (One-to-One)
            // ============================
            modelBuilder.Entity<Note>()
                .HasOne(n => n.Appointment) // A Note belongs to one Appointment
                .WithOne(a => a.Note) // Each Appointment has exactly one Note
                .HasForeignKey<Note>(n => n.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade); // If Appointment is deleted, remove its Note


        //     // Seed Users (Doctors & Patients)
        //     modelBuilder.Entity<User>().HasData(
        //  new User { Id = 1, UserId = Guid.NewGuid(), Email = "doctor1@gmail.com", PasswordHash = "hashedpassword1", FirstName = "John", LastName = "Doe", Role = RoleType.Doctor, Specialty = SpecialtyType.General },
        //  new User { Id = 2, UserId = Guid.NewGuid(), Email = "doctor2@gmail.com", PasswordHash = "hashedpassword2", FirstName = "Jane", LastName = "Smith", Role = RoleType.Doctor, Specialty = SpecialtyType.Dermatolgy },
        //  new User { Id = 3, UserId = Guid.NewGuid(), Email = "patient1@gmail.com", PasswordHash = "hashedpassword3", FirstName = "Alice", LastName = "Brown", Role = RoleType.Patient },
        //  new User { Id = 4, UserId = Guid.NewGuid(), Email = "patient2@gmail.com", PasswordHash = "hashedpassword4", FirstName = "Bob", LastName = "White", Role = RoleType.Patient },
        //  new User { Id = 5, UserId = Guid.NewGuid(), Email = "admin@gmail.com", PasswordHash = "hashedpassword5", FirstName = "Razan", LastName = "Alatawi", Role = RoleType.Admin }
        //   );

        //     // Seed Medical Histories
        //     modelBuilder.Entity<MedicalHistory>().HasData(
        //         new MedicalHistory { Id = 1, HistoryID = Guid.NewGuid(), Diagnosis = "Diabetes", Allergies = "Peanuts", Medicines = "Insulin", PatientId = 3 },
        //         new MedicalHistory { Id = 2, HistoryID = Guid.NewGuid(), Diagnosis = "Hypertension", Allergies = "None", Medicines = "Lisinopril", PatientId = 4 }
        //     );

        //     // Seed Appointments
        //     modelBuilder.Entity<Appointment>().HasData(
        //         new Appointment { Id = 1, AppointmentId = Guid.NewGuid(), Status = AppointmentStatus.Created, Date = new DateTime(2025, 4, 15, 10, 30, 0), PatientId = 3, DoctorId = 1 },
        //         new Appointment { Id = 2, AppointmentId = Guid.NewGuid(), Status = AppointmentStatus.Confirmed, Date = new DateTime(2025, 4, 20, 14, 0, 0), PatientId = 4, DoctorId = 2 }
        //     );

        //     // Seed Notes
        //     modelBuilder.Entity<Note>().HasData(
        //         new Note { Id = 1, NoteId = Guid.NewGuid(), NoteText = "Follow-up required in 2 weeks.", AppointmentId = 1, MedicalHistoryId = 1 },
        //         new Note { Id = 2, NoteId = Guid.NewGuid(), NoteText = "Prescribed new medication.", AppointmentId = 2, MedicalHistoryId = 2 }
        //     );
        }




    }

}