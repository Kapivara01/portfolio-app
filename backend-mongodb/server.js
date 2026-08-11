const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB (Ajusta el nombre de tu base de datos si es necesario)
const MONGO_URI = 'mongodb://localhost:27017/portfolio_db'; // <--- Cambia 'tu_base_de_datos' por el nombre real de tu BD

mongoose.connect(MONGO_URI)
  .then(() => console.log('¡Conectado exitosamente a MongoDB!'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

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

// Endpoint genérico para insertar documentos en una colección
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