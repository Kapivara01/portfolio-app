import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongoService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // --- MÉTODO GENÉRICO PARA OBTENER COLECCIONES (Usado en Home y Profile) ---
  getCollection(nombreColeccion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${nombreColeccion}`);
  }

  // --- MÉTODOS PARA HOJA DE VIDA (Sincronización con MongoDB) ---

  getHojaDeVida(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoja-de-vida`);
  }

  addHojaDeVida(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hoja-de-vida`, data);
  }

  updateHojaDeVida(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hoja-de-vida/${id}`, data);
  }

  // --- MÉTODOS PARA LA COLECCIÓN CURSOS ---
  getCursos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cursos`);
  }
}