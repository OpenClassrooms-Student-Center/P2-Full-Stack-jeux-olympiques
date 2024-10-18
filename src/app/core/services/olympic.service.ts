import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<any>(this.olympicUrl).pipe(
      tap((value) => {
        console.log('Data loaded from JSON:', value); // Vérification des données
        this.olympics$.next(value);
      }),
      catchError((error, caught) => {
        console.error(error);
        this.olympics$.next(null);
        return caught;
      })
    );
  }
  

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
