import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MongoService {
  // Se usa la URL de producción o el localhost por defecto
  private apiUrl = (environment as any).apiUrl || 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // --- Métodos Genéricos ---
  getCollection(nombreColeccion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${nombreColeccion}`);
  }

  postCollection(nombreColeccion: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${nombreColeccion}`, data);
  }

  putCollection(nombreColeccion: string, id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${nombreColeccion}/${id}`, data);
  }

  deleteCollectionItem(nombreColeccion: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${nombreColeccion}/${id}`);
  }

  // --- Hoja de Vida ---
  getHojaDeVida(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoja-de-vida`);
  }

  addHojaDeVida(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hoja-de-vida`, data);
  }

  updateHojaDeVida(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hoja-de-vida/${id}`, data);
  }

  // --- Cursos ---
  getCursos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cursos`);
  }

  // --- Educación (Sincronizado directamente con la colección y rutas genéricas) ---
  getEducacion(): Observable<any> {
    return this.getCollection('Educacion'); // Si tu backend usa minúscula, cámbialo a 'educacion'
  }

  addEducacion(data: any): Observable<any> {
    return this.postCollection('Educacion', data);
  }

  updateEducacion(id: string, data: any): Observable<any> {
    return this.putCollection('Educacion', id, data);
  }

  deleteEducacion(id: string): Observable<any> {
    return this.deleteCollectionItem('Educacion', id);
  }
}