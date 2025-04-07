import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { jsPDF } from 'jspdf';
import { loadSummary } from '../../store/summery/summary.actions';
import { Observable } from 'rxjs';
import { AdminSummaryDto } from '../../models/summary.model';
import { SummaryState } from '../../store/summery/summary.state';
import { CommonModule } from '@angular/common';
import { PdfExportService } from '../../services/pdf-export/pdf-export.service';

interface AppState {
  summary: SummaryState;
}

@Component({
  selector: 'app-doctor-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-summary.component.html',
  styleUrl: './doctor-summary.component.scss'
})

export class DoctorSummaryComponent implements OnInit {
  // Observable for doctor summary data from the store
  summary$: Observable<AdminSummaryDto | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  //Injects the NgRx Store to manage state and a PDF export service
  constructor(private store: Store<AppState>, private pdfService: PdfExportService) {
    this.summary$ = this.store.select(state => state.summary.summary);
    this.loading$ = this.store.select(state => state.summary.loading);
    this.error$ = this.store.select(state => state.summary.error);
  }

  //Dispatches the action to load the summary data when the component initializes

  ngOnInit(): void {
    this.store.dispatch(loadSummary());
  }

  //Exports the doctor summary data to a PDF file using the PdfExportService
  exportToPdf(summary: AdminSummaryDto | null): void {
    if (summary) {
      this.pdfService.generateDoctorSummaryPdf(summary);
    }
  }
}




