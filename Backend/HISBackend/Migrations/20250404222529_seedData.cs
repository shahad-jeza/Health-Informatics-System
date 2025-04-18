﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HISBackend.Migrations
{
    /// <inheritdoc />
    public partial class seedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AppointmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: true),
                    DoctorId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicalHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HistoryID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Diagnosis = table.Column<string>(type: "TEXT", nullable: true),
                    Allergies = table.Column<string>(type: "TEXT", nullable: true),
                    Medicines = table.Column<string>(type: "TEXT", nullable: true),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalHistories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NoteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NoteText = table.Column<string>(type: "TEXT", nullable: true),
                    AppointmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    MedicalHistoryId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_MedicalHistories_MedicalHistoryId",
                        column: x => x.MedicalHistoryId,
                        principalTable: "MedicalHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: true),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    Specialty = table.Column<string>(type: "TEXT", nullable: true),
                    MedicalHistoryId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_MedicalHistories_MedicalHistoryId",
                        column: x => x.MedicalHistoryId,
                        principalTable: "MedicalHistories",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "FirstName", "LastName", "MedicalHistoryId", "PasswordHash", "Phone", "Role", "Specialty", "UserId" },
                values: new object[,]
                {
                    { 1, "doctor1@gmail.com", "John", "Doe", null, "$2a$11$sCYEzy1GbvTU/r7N2.GSOezCKjwdqbPDVP.aGydVsfqWrY7YGIe56", null, "Doctor", "General", new Guid("11111111-1111-1111-1111-111111111111") },
                    { 2, "doctor2@gmail.com", "Jane", "Smith", null, "$2a$11$0oXRLt4lkiQa1UuO3kNeWucoWZcQTobSNyvOe8eM/YrbJq2M40gZ6", null, "Doctor", "Dermatolgy", new Guid("22222222-2222-2222-2222-222222222222") },
                    { 3, "patient1@gmail.com", "Alice", "Brown", null, "$2a$11$UvzWUMWnCNotNCUIpr0D4eZXFCyitPK5zM0D1dmY1zpOfsRx41a5y", null, "Patient", null, new Guid("33333333-3333-3333-3333-333333333333") },
                    { 4, "patient2@gmail.com", "Bob", "White", null, "$2a$11$bMFcNFc2ecmvx4js.ESYle.CfD/h0TP5Rkj67GnvjL3SYe2GWMwjC", null, "Patient", null, new Guid("44444444-4444-4444-4444-444444444444") },
                    { 5, "admin@gmail.com", "Razan", "Alatawi", null, "$2a$11$AGvI3U5b6kxDgRH5Y952NedIWMuBMknT.kMpg38yXwzkalITM0JrW", null, "Admin", null, new Guid("55555555-5555-5555-5555-555555555555") },
                    { 6, "cardio1@gmail.com", "Michael", "Johnson", null, "$2a$11$V8Blh3mxsi96H6.rl4pjT.du4mGkXRnGiiDTKl0Rs7njAQP8Z26ym", null, "Doctor", "Dentisity", new Guid("66666666-6666-6666-6666-666666666666") },
                    { 7, "cardio2@gmail.com", "Lisa", "Chen", null, "$2a$11$yyCV95KpctaynF63hkk6r.uLt9PeR2Phk..b03UlC69lJvwxc3GBC", null, "Doctor", "Dentisity", new Guid("77777777-7777-7777-7777-777777777777") },
                    { 8, "pedia1@gmail.com", "Emily", "Davis", null, "$2a$11$SuwmMY7Q4mTn0lJJfCS2veC7NC5i/r39oLTmbcfiisePy0ALg9XGG", null, "Doctor", "Neurology", new Guid("88888888-8888-8888-8888-888888888888") },
                    { 9, "pedia2@gmail.com", "James", "Wilson", null, "$2a$11$RMHMugTnrb1aJLwZsAaXk.e8ksoOK0Hv9daZVivLpbdv5mk93yJCy", null, "Doctor", "Dermatolgy", new Guid("99999999-9999-9999-9999-999999999999") },
                    { 10, "neuro1@gmail.com", "Sarah", "Williams", null, "$2a$11$FlZNuUcfPhOrlRcRTl0na.ChXfgeW0pFTzweoi1yY0obTQtEt3bOS", null, "Doctor", "Neurology", new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { 11, "ortho1@gmail.com", "Robert", "Brown", null, "$2a$11$gfUOO5AM0MbQhi616H9ehu0Y0iEYWK/oDk8/7nqFDyZtGKUuSCpUa", null, "Doctor", "Neurology", new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb") }
                });

            migrationBuilder.InsertData(
                table: "Appointments",
                columns: new[] { "Id", "AppointmentId", "Date", "DoctorId", "PatientId", "Status" },
                values: new object[,]
                {
                    { 1, new Guid("88888888-8888-8888-8888-888888888888"), new DateTime(2025, 4, 15, 10, 30, 0, 0, DateTimeKind.Unspecified), 1, 3, "Created" },
                    { 2, new Guid("99999999-9999-9999-9999-999999999999"), new DateTime(2025, 4, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), 2, 4, "Confirmed" }
                });

            migrationBuilder.InsertData(
                table: "MedicalHistories",
                columns: new[] { "Id", "Allergies", "Diagnosis", "HistoryID", "Medicines", "PatientId" },
                values: new object[,]
                {
                    { 1, "Peanuts", "Diabetes", new Guid("66666666-6666-6666-6666-666666666666"), "Insulin", 3 },
                    { 2, "None", "Hypertension", new Guid("77777777-7777-7777-7777-777777777777"), "Lisinopril", 4 }
                });

            migrationBuilder.InsertData(
                table: "Notes",
                columns: new[] { "Id", "AppointmentId", "MedicalHistoryId", "NoteId", "NoteText" },
                values: new object[,]
                {
                    { 1, 1, 1, new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Follow-up required in 2 weeks." },
                    { 2, 2, 2, new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Prescribed new medication." }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_PatientId",
                table: "MedicalHistories",
                column: "PatientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notes_AppointmentId",
                table: "Notes",
                column: "AppointmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notes_MedicalHistoryId",
                table: "Notes",
                column: "MedicalHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_MedicalHistoryId",
                table: "Users",
                column: "MedicalHistoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Users_DoctorId",
                table: "Appointments",
                column: "DoctorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Users_PatientId",
                table: "Appointments",
                column: "PatientId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_Users_PatientId",
                table: "MedicalHistories",
                column: "PatientId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_Users_PatientId",
                table: "MedicalHistories");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "MedicalHistories");
        }
    }
}
