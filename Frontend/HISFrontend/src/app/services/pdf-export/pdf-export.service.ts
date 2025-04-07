import { Injectable } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { AdminSummaryDto } from '../../models/summary.model';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  generateDoctorSummaryPdf(summary: AdminSummaryDto): void {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add a title to the PDF document
    doc.text('Doctor Summary', 14, 15);

    // Transform the doctors' data into an array format suitable for autoTable
    const doctorsData = summary.doctors.map(doctor => [
      `${doctor.firstName} ${doctor.lastName}`, // Full name
      doctor.specialty,
      doctor.email,
      doctor.phone
    ]);

    // Generate a table with column headers and doctor details
    autoTable(doc, {
      head: [['Name', 'Specialty', 'Email', 'Phone']],
      body: doctorsData,
      startY: 20
    });

    // save the PDF 
    doc.save('doctors-summary.pdf');
  }
}