require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('¡Conectado exitosamente a MongoDB!');
    console.log('-> Base de datos activa en Mongoose:', mongoose.connection.name);
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Endpoint de Login con depuración detallada
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n--- INTENTO DE ACCESO RECIBIDO ---');
    console.log('Email enviado desde Angular:', JSON.stringify(email));
    console.log('Password enviado desde Angular:', JSON.stringify(password));

    const db = mongoose.connection.db;
    
    // Verificamos primero si el correo existe solo por email
    const adminEmailCheck = await db.collection('admins').findOne({ email: email ? email.trim() : '' });
    console.log('¿Correo encontrado en la colección "admins"?:', adminEmailCheck ? 'SÍ' : 'NO');
    if (adminEmailCheck) {
      console.log('Password registrado en la BD:', JSON.stringify(adminEmailCheck.password));
    }

    // Búsqueda completa exacta
    const admin = await db.collection('admins').findOne({ 
      email: email ? email.trim() : '', 
      password: password 
    });

    if (!admin) {
      console.log('-> Resultado: Credenciales NO coinciden o usuario no existe.');
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    console.log('-> Resultado: ¡AUTENTICACIÓN EXITOSA!');
    res.json({ success: true, message: 'Autenticación exitosa' });
  } catch (error) {
    console.error('Error crítico en el login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de Proyectos
app.post('/api/proyectos', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { titulo, descripcion, status, categoria, foto } = req.body;
    const nuevoProyecto = { titulo, descripcion, status, categoria, foto, createdAt: new Date() };

    const resultProyectos = await db.collection('proyectos').insertOne(nuevoProyecto);

    if (categoria) {
      const catLower = categoria.toLowerCase().trim();
      if (catLower === 'informatica') {
        await db.collection('informatica').insertOne(nuevoProyecto);
      } else if (catLower === 'telecomunicacion' || catLower === 'telecomunicaciones') {
        await db.collection('telecomunicacion').insertOne(nuevoProyecto);
      }
    }

    res.status(201).json({ message: 'Proyecto guardado y sincronizado con éxito', result: resultProyectos });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar y sincronizar el proyecto', details: error.message });
  }
});

// Endpoints genéricos
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

app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const id = req.params.id;
    const db = mongoose.connection.db;
    let queryId = id;
    try {
      queryId = new mongoose.Types.ObjectId(id);
    } catch (e) {}

    const result = await db.collection(collectionName).deleteOne({ _id: queryId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Documento no encontrado en la colección' });
    }
    res.json({ message: 'Documento eliminado con éxito', result });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el documento', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});