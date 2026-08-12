import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MongoService {
  // Si existe una URL de producción en environment se usa, de lo contrario usa localhost para desarrollo local
  private apiUrl = (environment as any).apiUrl || 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  getCollection(nombreColeccion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${nombreColeccion}`);
  }

  postCollection(nombreColeccion: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${nombreColeccion}`, data);
  }

  getHojaDeVida(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoja-de-vida`);
  }

  addHojaDeVida(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hoja-de-vida`, data);
  }

  updateHojaDeVida(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hoja-de-vida/${id}`, data);
  }

  getCursos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cursos`);
  }
}