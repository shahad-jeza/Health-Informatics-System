﻿// <auto-generated />
using System;
using HISBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace HISBackend.Migrations
{
    [DbContext(typeof(MyAppDbContext))]
    [Migration("20250329002706_SeedData")]
    partial class SeedData
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.3");

            modelBuilder.Entity("HISBackend.Models.Appointment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<Guid>("AppointmentId")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("Date")
                        .HasColumnType("TEXT");

                    b.Property<int>("DoctorId")
                        .HasColumnType("INTEGER");

                    b.Property<int?>("PatientId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("DoctorId");

                    b.HasIndex("PatientId");

                    b.ToTable("Appointments");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            AppointmentId = new Guid("88888888-8888-8888-8888-888888888888"),
                            Date = new DateTime(2025, 4, 15, 10, 30, 0, 0, DateTimeKind.Unspecified),
                            DoctorId = 1,
                            PatientId = 3,
                            Status = "Created"
                        },
                        new
                        {
                            Id = 2,
                            AppointmentId = new Guid("99999999-9999-9999-9999-999999999999"),
                            Date = new DateTime(2025, 4, 20, 14, 0, 0, 0, DateTimeKind.Unspecified),
                            DoctorId = 2,
                            PatientId = 4,
                            Status = "Confirmed"
                        });
                });

            modelBuilder.Entity("HISBackend.Models.MedicalHistory", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Allergies")
                        .HasColumnType("TEXT");

                    b.Property<string>("Diagnosis")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("HistoryID")
                        .HasColumnType("TEXT");

                    b.Property<string>("Medicines")
                        .HasColumnType("TEXT");

                    b.Property<int>("PatientId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("PatientId")
                        .IsUnique();

                    b.ToTable("MedicalHistories");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Allergies = "Peanuts",
                            Diagnosis = "Diabetes",
                            HistoryID = new Guid("66666666-6666-6666-6666-666666666666"),
                            Medicines = "Insulin",
                            PatientId = 3
                        },
                        new
                        {
                            Id = 2,
                            Allergies = "None",
                            Diagnosis = "Hypertension",
                            HistoryID = new Guid("77777777-7777-7777-7777-777777777777"),
                            Medicines = "Lisinopril",
                            PatientId = 4
                        });
                });

            modelBuilder.Entity("HISBackend.Models.Note", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("AppointmentId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("MedicalHistoryId")
                        .HasColumnType("INTEGER");

                    b.Property<Guid>("NoteId")
                        .HasColumnType("TEXT");

                    b.Property<string>("NoteText")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("AppointmentId")
                        .IsUnique();

                    b.HasIndex("MedicalHistoryId");

                    b.ToTable("Notes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            AppointmentId = 1,
                            MedicalHistoryId = 1,
                            NoteId = new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                            NoteText = "Follow-up required in 2 weeks."
                        },
                        new
                        {
                            Id = 2,
                            AppointmentId = 2,
                            MedicalHistoryId = 2,
                            NoteId = new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                            NoteText = "Prescribed new medication."
                        });
                });

            modelBuilder.Entity("HISBackend.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int?>("MedicalHistoryId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Phone")
                        .HasColumnType("TEXT");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Specialty")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("MedicalHistoryId");

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Email = "doctor1@gmail.com",
                            FirstName = "John",
                            LastName = "Doe",
                            PasswordHash = "hashedpassword1",
                            Role = "Doctor",
                            Specialty = "General",
                            UserId = new Guid("11111111-1111-1111-1111-111111111111")
                        },
                        new
                        {
                            Id = 2,
                            Email = "doctor2@gmail.com",
                            FirstName = "Jane",
                            LastName = "Smith",
                            PasswordHash = "hashedpassword2",
                            Role = "Doctor",
                            Specialty = "Dermatolgy",
                            UserId = new Guid("22222222-2222-2222-2222-222222222222")
                        },
                        new
                        {
                            Id = 3,
                            Email = "patient1@gmail.com",
                            FirstName = "Alice",
                            LastName = "Brown",
                            PasswordHash = "hashedpassword3",
                            Role = "Patient",
                            UserId = new Guid("33333333-3333-3333-3333-333333333333")
                        },
                        new
                        {
                            Id = 4,
                            Email = "patient2@gmail.com",
                            FirstName = "Bob",
                            LastName = "White",
                            PasswordHash = "hashedpassword4",
                            Role = "Patient",
                            UserId = new Guid("44444444-4444-4444-4444-444444444444")
                        },
                        new
                        {
                            Id = 5,
                            Email = "admin@gmail.com",
                            FirstName = "Razan",
                            LastName = "Alatawi",
                            PasswordHash = "hashedpassword5",
                            Role = "Admin",
                            UserId = new Guid("55555555-5555-5555-5555-555555555555")
                        });
                });

            modelBuilder.Entity("HISBackend.Models.Appointment", b =>
                {
                    b.HasOne("HISBackend.Models.User", "Doctor")
                        .WithMany()
                        .HasForeignKey("DoctorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("HISBackend.Models.User", "Patient")
                        .WithMany("Appointments")
                        .HasForeignKey("PatientId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("Doctor");

                    b.Navigation("Patient");
                });

            modelBuilder.Entity("HISBackend.Models.MedicalHistory", b =>
                {
                    b.HasOne("HISBackend.Models.User", "Patient")
                        .WithOne()
                        .HasForeignKey("HISBackend.Models.MedicalHistory", "PatientId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Patient");
                });

            modelBuilder.Entity("HISBackend.Models.Note", b =>
                {
                    b.HasOne("HISBackend.Models.Appointment", "Appointment")
                        .WithOne("Note")
                        .HasForeignKey("HISBackend.Models.Note", "AppointmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("HISBackend.Models.MedicalHistory", "MedicalHistory")
                        .WithMany("Notes")
                        .HasForeignKey("MedicalHistoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Appointment");

                    b.Navigation("MedicalHistory");
                });

            modelBuilder.Entity("HISBackend.Models.User", b =>
                {
                    b.HasOne("HISBackend.Models.MedicalHistory", "MedicalHistory")
                        .WithMany()
                        .HasForeignKey("MedicalHistoryId");

                    b.Navigation("MedicalHistory");
                });

            modelBuilder.Entity("HISBackend.Models.Appointment", b =>
                {
                    b.Navigation("Note");
                });

            modelBuilder.Entity("HISBackend.Models.MedicalHistory", b =>
                {
                    b.Navigation("Notes");
                });

            modelBuilder.Entity("HISBackend.Models.User", b =>
                {
                    b.Navigation("Appointments");
                });
#pragma warning restore 612, 618
        }
    }
}
