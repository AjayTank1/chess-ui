import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  saveGame(data: any): Observable<any> {
    return this.http.post("http://localhost:6060/game", data);
  }
}
