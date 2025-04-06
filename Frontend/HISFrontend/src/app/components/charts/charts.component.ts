import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AdminStatistics } from '../../models/statistics.model';
import { StatisticsService } from '../../services/staistics/statistics.service';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  // Holds the statistics data fetched from the API
  statistics: AdminStatistics | null = null;
  loading = true;
  error: string | null = null;

  /** Appointment Status Chart Configuration */
  public statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Appointment Status Distribution' }
    }
  };
  public statusChartType: ChartType = 'pie';
  public statusChartData: ChartData<'pie'> = {
    labels: [], // Status labels 
    datasets: [{
      data: [], //  counts for each status
      backgroundColor: ['#70C4F8', '#65B4E5', '#5399C5', '#70D0B1']
    }]
  };

  /** Most Popular Specialties Chart Configuration */
  public specialtiesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Most Popular Specialties' }
    },
    scales: { x: { beginAtZero: true } } // Ensures the x-axis starts at 0
  };
  public specialtiesChartType: ChartType = 'bar';
  public specialtiesChartData: ChartData<'bar'> = {
    labels: [], // Specialty names
    datasets: [{
      data: [], // to store number of doctors for each specialty
      label: 'Number of Doctors',
      backgroundColor: ['#70C4F8', '#5399C5', '#65B4E5', '#70D0B1']
    }]
  };

  constructor(
    private statisticsService: StatisticsService,
    @Inject(PLATFORM_ID) private platformId: Object // Detects if the app is running in a browser (ng2 charts requires a DOM)
  ) { }

  // runs when the component is initialized 
  ngOnInit(): void {
    // Load statistics only if running in a browser (prevents errors in SSR environments)
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatistics();
    }
  }

  // Fetches statistics data from the API and updates the charts

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.statisticsService.getStatistics().subscribe({
      next: (data) => {
        // Ensure the data is valid before processing
        if (!data || !data.appointmentStatusStats || !data.popularSpecialties) {
          this.error = 'Invalid data received';
          console.warn('Invalid data received:', data);
          this.loading = false;
          return;
        }

        this.statistics = data;
        this.updateCharts(data);
        this.loading = false;
      },
      error: (err) => {
        // log the error
        this.error = err?.message || 'Failed to load statistics';
        console.error('Error fetching statistics:', err);
        this.loading = false;
      }
    });
  }


  //Updates the chart data dynamically based on API response
  //The fetched statistics data

  updateCharts(data: AdminStatistics): void {
    // Update Appointment Status Chart
    this.statusChartData = {
      ...this.statusChartData,
      labels: data.appointmentStatusStats.map(s => s.status),
      datasets: [{
        ...this.statusChartData.datasets[0],
        data: data.appointmentStatusStats.map(s => s.count)
      }]
    };

    // Update  Popular Specialties Chart
    this.specialtiesChartData = {
      ...this.specialtiesChartData,
      labels: data.popularSpecialties.map(s => s.specialty),
      datasets: [{
        ...this.specialtiesChartData.datasets[0],
        data: data.popularSpecialties.map(s => s.doctorCount)
      }]
    };
  }
}
