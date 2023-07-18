import { Component, OnDestroy, OnInit } from '@angular/core'; 
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { Olympic } from 'app/core/models/Olympic';
import { OlympicService } from 'app/core/services/olympic.service';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  
  public olympics$: Observable<Olympic[]> = of([]); 
  private subscriptions: Subscription[] = []; 
  public olympicsNumber!: number;
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, 
        position: 'bottom', 
        reverse: true,  
      },
    },
  }; 
  
  constructor(private olympicService: OlympicService, private router: Router) {} 
  
  
    detailCountry(event: any) {
      const { index } = event.active[0];
      let id = 1 + index;
      this.router.navigate([`detail/${id}`]);
  }


  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    const olympicCountries$ = this.olympics$.pipe(
      map((olympics: Olympic[]) => olympics.map((o: Olympic) => o.country))
    );

    const olympicMedalCount$ = this.olympics$.pipe(
      map((olympics: Olympic[]) =>
        olympics.map((o: Olympic) =>
          o.participations.reduce((accumulator, current) => accumulator + current.medalsCount, 0)
        )
      )
    );

    const subscription = combineLatest([
      olympicCountries$,
      olympicMedalCount$,
    ]).subscribe(([country, medalCounts]) => {

      this.olympicsNumber = country.length;

      this.pieChartData = {
        labels: country, 
        datasets: [
          {
            data: medalCounts, 
            backgroundColor: [
              'rgb(149, 96, 101)',
              'rgb(184, 203, 231)',
              'rgb(137, 161, 219)',
              'rgb(121, 61, 82)',
              'rgb(151, 128, 161)',
            ],
            hoverOffset : 10
          },
        ],
      };
    });
 
    this.subscriptions.push(subscription);
  }

  /* La méthode ngOnDestroy est utilisée pour effectuer des tâches de nettoyage avant que le composant soit détruit 
comme annuler des abonnements à des observables.
On utilise le unsubscribe afin de libérer de la mémoire et éviter la consommation inutle du processeur.
*/
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}