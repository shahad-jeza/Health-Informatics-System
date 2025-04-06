using Microsoft.EntityFrameworkCore;
using HISBackend.Models;

namespace HISBackend.Data
{
    public class MyAppDbContext : DbContext
    {
        public MyAppDbContext(DbContextOptions<MyAppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<Note> Notes { get; set; }


        // Configure DB relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Add unique constraint to email
            modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

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


            // Seed Users (Doctors & Patients)
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"), Email = "doctor1@gmail.com", PasswordHash = "$2a$11$sCYEzy1GbvTU/r7N2.GSOezCKjwdqbPDVP.aGydVsfqWrY7YGIe56", FirstName = "John", LastName = "Doe", Role = RoleType.Doctor, Specialty = SpecialtyType.General },
                new User { Id = 2, UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"), Email = "doctor2@gmail.com", PasswordHash = "$2a$11$0oXRLt4lkiQa1UuO3kNeWucoWZcQTobSNyvOe8eM/YrbJq2M40gZ6", FirstName = "Jane", LastName = "Smith", Role = RoleType.Doctor, Specialty = SpecialtyType.Dermatolgy },
                new User { Id = 3, UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"), Email = "patient1@gmail.com", PasswordHash = "$2a$11$UvzWUMWnCNotNCUIpr0D4eZXFCyitPK5zM0D1dmY1zpOfsRx41a5y", FirstName = "Alice", LastName = "Brown", Role = RoleType.Patient },
                new User { Id = 4, UserId = Guid.Parse("44444444-4444-4444-4444-444444444444"), Email = "patient2@gmail.com", PasswordHash = "$2a$11$bMFcNFc2ecmvx4js.ESYle.CfD/h0TP5Rkj67GnvjL3SYe2GWMwjC", FirstName = "Bob", LastName = "White", Role = RoleType.Patient },
                new User { Id = 5, UserId = Guid.Parse("55555555-5555-5555-5555-555555555555"), Email = "admin@gmail.com", PasswordHash = "$2a$11$AGvI3U5b6kxDgRH5Y952NedIWMuBMknT.kMpg38yXwzkalITM0JrW", FirstName = "Razan", LastName = "Alatawi", Role = RoleType.Admin },
                new User { Id = 6, UserId = Guid.Parse("66666666-6666-6666-6666-666666666666"), Email = "cardio1@gmail.com", PasswordHash = "$2a$11$V8Blh3mxsi96H6.rl4pjT.du4mGkXRnGiiDTKl0Rs7njAQP8Z26ym", FirstName = "Michael", LastName = "Johnson", Role = RoleType.Doctor, Specialty = SpecialtyType.Dentisity },
                new User { Id = 7, UserId = Guid.Parse("77777777-7777-7777-7777-777777777777"), Email = "cardio2@gmail.com", PasswordHash = "$2a$11$yyCV95KpctaynF63hkk6r.uLt9PeR2Phk..b03UlC69lJvwxc3GBC", FirstName = "Lisa", LastName = "Chen", Role = RoleType.Doctor, Specialty = SpecialtyType.Dentisity },
                new User { Id = 8, UserId = Guid.Parse("88888888-8888-8888-8888-888888888888"), Email = "pedia1@gmail.com", PasswordHash = "$2a$11$SuwmMY7Q4mTn0lJJfCS2veC7NC5i/r39oLTmbcfiisePy0ALg9XGG", FirstName = "Emily", LastName = "Davis", Role = RoleType.Doctor, Specialty = SpecialtyType.Neurology },
                new User { Id = 9, UserId = Guid.Parse("99999999-9999-9999-9999-999999999999"), Email = "pedia2@gmail.com", PasswordHash = "$2a$11$RMHMugTnrb1aJLwZsAaXk.e8ksoOK0Hv9daZVivLpbdv5mk93yJCy", FirstName = "James", LastName = "Wilson", Role = RoleType.Doctor, Specialty = SpecialtyType.Dermatolgy },
                new User { Id = 10, UserId = Guid.Parse("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"), Email = "neuro1@gmail.com", PasswordHash = "$2a$11$FlZNuUcfPhOrlRcRTl0na.ChXfgeW0pFTzweoi1yY0obTQtEt3bOS", FirstName = "Sarah", LastName = "Williams", Role = RoleType.Doctor, Specialty = SpecialtyType.Neurology },
                new User { Id = 11, UserId = Guid.Parse("BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB"), Email = "ortho1@gmail.com", PasswordHash = "$2a$11$gfUOO5AM0MbQhi616H9ehu0Y0iEYWK/oDk8/7nqFDyZtGKUuSCpUa", FirstName = "Robert", LastName = "Brown", Role = RoleType.Doctor, Specialty = SpecialtyType.Neurology }
            );


            // Seed Medical Histories
            modelBuilder.Entity<MedicalHistory>().HasData(
                new MedicalHistory { Id = 1, HistoryID = Guid.Parse("66666666-6666-6666-6666-666666666666"), Diagnosis = "Diabetes", Allergies = "Peanuts", Medicines = "Insulin", PatientId = 3 },
                new MedicalHistory { Id = 2, HistoryID = Guid.Parse("77777777-7777-7777-7777-777777777777"), Diagnosis = "Hypertension", Allergies = "None", Medicines = "Lisinopril", PatientId = 4 }
            );

            // Seed Appointments
            modelBuilder.Entity<Appointment>().HasData(
                new Appointment { Id = 1, AppointmentId = Guid.Parse("88888888-8888-8888-8888-888888888888"), Status = AppointmentStatus.Created, Date = new DateTime(2025, 4, 15, 10, 30, 0), PatientId = 3, DoctorId = 1 },
                new Appointment { Id = 2, AppointmentId = Guid.Parse("99999999-9999-9999-9999-999999999999"), Status = AppointmentStatus.Confirmed, Date = new DateTime(2025, 4, 20, 14, 0, 0), PatientId = 4, DoctorId = 2 }
            );

            // Seed Notes
            modelBuilder.Entity<Note>().HasData(
                new Note { Id = 1, NoteId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), NoteText = "Follow-up required in 2 weeks.", AppointmentId = 1, MedicalHistoryId = 1 },
                new Note { Id = 2, NoteId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), NoteText = "Prescribed new medication.", AppointmentId = 2, MedicalHistoryId = 2 }
            );
        }
    }
}