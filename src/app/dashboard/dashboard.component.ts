import { Component, OnInit } from '@angular/core';
import { OlympicService } from '../core/services/olympic.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartConfiguration, ChartData, Tooltip, LegendItem } from 'chart.js';
import { Participation } from '../core/models/Participation';
import { Olympic } from '../core/models/Olympic';
import { Router } from '@angular/router';
import { TooltipItem } from 'chart.js';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio:false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'pie'>) => {
            const countryIndex = tooltipItem.dataIndex;
            const totalMedals =
              this.barChartData.datasets[0].data[countryIndex];
            const countryLabel = this.barChartLabels[countryIndex];
            return `Country: ${countryLabel}: ${totalMedals} medals`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top', // Позиция легенды
        labels: {
          usePointStyle: true, // Использовать стиль точки
          pointStyle: 'line', // Можно изменить на 'circle', 'rect', 'triangle' и другие
          padding: 20, // Отступы
        }
      }
    }
  };

  public barChartType: ChartType = 'pie';
  public barChartLegend = true;
  public barChartLabels: string[] = [];
  public barChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [],
  };
  public countryIds: number[] = [];
  public totalGames: number = 0;
  public errorMessage: string | null = null;
  public loading: boolean = true;

  private subscription: Subscription = new Subscription();

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympicService.loadInitialData().subscribe({
      next: (data: Olympic[]) => {
        this.processData(data);
        this.totalGames = this.olympicService.getTotalGames();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading data';
        console.error('Error loading data', error);
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
  }

  private processData(data: Olympic[]): void {
    this.barChartLabels = data.map((item) => item.country);
    this.barChartData.datasets = [
      {
        data: data.map((item) =>
          item.participations.reduce(
            (sum: number, p: Participation) => sum + p.medalsCount,
            0
          )
        ),
        label: 'Medals count',
      },
    ];
    this.countryIds = data.map((item) => item.id);
    console.log('Country Ids:', this.countryIds);
  }

  onCountryClick(event: any): void {
    const activePoints = event.active;
    console.log('Active points:', activePoints);
    if (activePoints.length > 0) {
      const countryIndex = activePoints[0].index;

      // Index valid?
      if (countryIndex >= 0 && countryIndex < this.countryIds.length) {
        const countryId = this.countryIds[countryIndex];
        if (countryId !== undefined) {
          this.router.navigate(['detail', countryId]);
        } else {
          console.error('Country ID is undefined for index:', countryIndex);
        }
      } else {
        console.error('Invalid country index:', countryIndex);
      }
    } else {
      console.warn('No active points found');
    }
  }
}
