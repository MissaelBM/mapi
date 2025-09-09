const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

const port = process.env.PORT || 8080;


app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
  connection.release();
});


io.on('connection', socket => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});


const userRoutes = require('./src/routes/usuario');
const rolRoutes = require('./src/routes/rol');
const empresaRoutes = require('./src/routes/empresa');
const promocionRoutes = require('./src/routes/promocion');
const notificacionRoutes = require('./src/routes/notificacion');
const guardadoRoutes = require('./src/routes/guardado');
const categoriaRoutes = require('./src/routes/categoria');
const metododepagoRoutes = require('./src/routes/metododepago');
const permisoRoutes = require('./src/routes/permiso');
const clienteRoutes = require('./src/routes/cliente');
const moduloRoutes = require('./src/routes/modulo');
const movimientoRoutes = require('./src/routes/movimiento');
const tarjetaRoutes = require('./src/routes/tarjeta');
const listadecategoriaRoutes = require('./src/routes/listadecategoria');
const matrizRoutes = require('./src/routes/matriz');
const uploadRoutes = require('./src/routes/upload');
const favoritoRoutes = require('./src/routes/favorito');
const tesoroRoutes = require('./src/routes/tesoro');
const cliente_tesoroRoutes = require('./src/routes/cliente_tesoro');
const productoRoutes = require('./src/routes/producto');
const tipopromocionRoutes = require('./src/routes/tipopromocion');
const usuario_empresa = require('./src/routes/usuario_empresa');

app.use('/api', userRoutes(pool));
app.use('/api', rolRoutes(pool));
app.use('/api', empresaRoutes(pool));
app.use('/api', promocionRoutes(pool));
app.use('/api', notificacionRoutes(pool));
app.use('/api', guardadoRoutes(pool));
app.use('/api', categoriaRoutes(pool));
app.use('/api', metododepagoRoutes(pool));
app.use('/api', permisoRoutes(pool));
app.use('/api', clienteRoutes(pool));
app.use('/api', moduloRoutes(pool));
app.use('/api', movimientoRoutes(pool));
app.use('/api', tarjetaRoutes(pool));
app.use('/api', listadecategoriaRoutes(pool));
app.use('/api', matrizRoutes(pool));
app.use('/api', uploadRoutes(pool));
app.use('/api', favoritoRoutes(pool));
app.use('/api', tesoroRoutes(pool));
app.use('/api', cliente_tesoroRoutes(pool));
app.use('/api', productoRoutes(pool));
app.use('/api', tipopromocionRoutes(pool));
app.use('/api', usuario_empresa(pool));


server.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto: ${port}`);
  console.log('Server time:', new Date().toISOString());
});
