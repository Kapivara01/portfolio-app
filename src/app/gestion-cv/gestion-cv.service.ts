import { Injectable } from '@angular/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Injectable({ providedIn: 'root' })
export class GestionCvService {

private async getBase64(url: string): Promise<string> {
try {
const response = await fetch(url);
const blob = await response.blob();
return new Promise((resolve) => {
const reader = new FileReader();
reader.onloadend = () => resolve(reader.result as string);
reader.readAsDataURL(blob);
});
} catch { return ''; }
}

async generarPdfProfesional(datos: any) {
const foto = await this.getBase64('assets/images/profile.jpg');
const logoUneti = await this.getBase64('assets/images/uneti-logo.jpg');

}
}