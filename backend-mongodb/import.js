const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb://localhost:27017/portafolio_db';

// Lista de colecciones y sus archivos correspondientes
const importaciones = [
  { coleccion: 'cursos', archivo: 'portfolio_db.cursos' },
  { coleccion: 'Educacion', archivo: 'portfolio_db.Educacion' },
  { coleccion: 'proyectos', archivo: 'portfolio_db.proyectos' },
  { coleccion: 'hoja_de_vida', archivo: 'portfolio_db.hoja_de_vida' },
  { coleccion: 'informatica', archivo: 'portfolio_db.informatica' },
  { coleccion: 'telecomunicacion', archivo: 'portfolio_db.telecomunicacion' },
  { coleccion: 'categories', archivo: 'portfolio_db.categories' }
];

async function importarDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB para importar datos...');

    const db = mongoose.connection.db;

    for (const item of importaciones) {
      if (fs.existsSync(item.archivo)) {
        const contenido = fs.readFileSync(item.archivo, 'utf8');
        const datos = JSON.parse(contenido);

        if (Array.isArray(datos) && datos.length > 0) {
          // Limpia la colección anterior e inserta los datos reales
          await db.collection(item.coleccion).deleteMany({});
          await db.collection(item.coleccion).insertMany(datos);
          console.log(`¡Colección '${item.coleccion}' importada con éxito (${datos.length} documentos)!`);
        } else {
          console.log(`El archivo ${item.archivo} está vacío o no es un arreglo válido.`);
        }
      } else {
        console.log(`No se encontró el archivo: ${item.archivo}`);
      }
    }

    console.log('¡Importación completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la importación:', error);
    process.exit(1);
  }
}

importarDatos();