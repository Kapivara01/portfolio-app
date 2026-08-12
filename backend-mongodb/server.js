const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const MONGO_URI = 'mongodb://localhost:27017/portfolio_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('¡Conectado exitosamente a MongoDB!'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Endpoint específico para gestionar proyectos con sincronización automática
app.post('/api/proyectos', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { titulo, descripcion, status, categoria, foto } = req.body;

    // Estructura normalizada del proyecto
    const nuevoProyecto = {
      titulo,
      descripcion,
      status,
      categoria,
      foto,
      createdAt: new Date()
    };

    // 1. Guardar en la colección principal "proyectos"
    const resultProyectos = await db.collection('proyectos').insertOne(nuevoProyecto);

    // 2. Sincronizar automáticamente con su respectiva colección según la categoría
    if (categoria) {
      const catLower = categoria.toLowerCase().trim();
      if (catLower === 'informatica') {
        await db.collection('informatica').insertOne(nuevoProyecto);
      } else if (catLower === 'telecomunicacion' || catLower === 'telecomunicaciones') {
        await db.collection('telecomunicacion').insertOne(nuevoProyecto);
      }
    }

    res.status(201).json({ 
      message: 'Proyecto guardado y sincronizado con éxito', 
      result: resultProyectos 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar y sincronizar el proyecto', details: error.message });
  }
});

// Endpoint genérico para obtener documentos de cualquier colección existente
app.get('/api/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const db = mongoose.connection.db;
    const data = await db.collection(collectionName).find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos', details: error.message });
  }
});

// Endpoint genérico para insertar documentos en otras colecciones
app.post('/api/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const db = mongoose.connection.db;
    const result = await db.collection(collectionName).insertOne(req.body);
    res.status(201).json({ message: 'Documento insertado con éxito', result });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar el documento', details: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});