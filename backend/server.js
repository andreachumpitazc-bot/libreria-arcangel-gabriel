const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Habilitar CORS para recibir peticiones desde GitHub Pages
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_123';

// Configuración de conexión a la base de datos (TiDB Cloud en producción / Local en desarrollo)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'libreria_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000,
    ssl: process.env.DB_HOST ? { rejectUnauthorized: true } : false
});

// --- AUTENTICACIÓN (LOGIN Y REGISTRO) ---
app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, rol || 'operador']
        );
        res.json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(400).json({ error: 'El correo ya está registrado o hubo un error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const usuario = rows[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token, usuario: { nombre: usuario.nombre, rol: usuario.rol } });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno en el servidor backend al autenticar' });
    }
});

// --- API REST: PRODUCTOS (CRUD) ---
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
});

app.post('/api/productos', async (req, res) => {
    const { categoria, nombre, detalle, precio, stock } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (categoria, nombre, detalle, precio, stock) VALUES (?, ?, ?, ?, ?)',
            [categoria, nombre, detalle, precio, stock]
        );
        res.json({ id: result.insertId, message: 'Producto guardado' });
    } catch (err) {
        console.error('Error al guardar producto:', err);
        res.status(500).json({ error: 'Error al insertar producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria, nombre, detalle, precio, stock } = req.body;
    try {
        await db.query(
            'UPDATE productos SET categoria=?, nombre=?, detalle=?, precio=?, stock=? WHERE id=?',
            [categoria, nombre, detalle, precio, stock, id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM productos WHERE id=?', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// --- API REST: SOLICITUDES DE CONTACTO ---
app.get('/api/solicitudes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM solicitudes ORDER BY fecha DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener solicitudes:', err);
        res.status(500).json({ error: 'Error al consultar solicitudes' });
    }
});

app.post('/api/solicitudes', async (req, res) => {
    const { nombre, telefono, email, mensaje } = req.body;
    try {
        await db.query(
            'INSERT INTO solicitudes (nombre, telefono, email, mensaje) VALUES (?, ?, ?, ?)',
            [nombre, telefono, email || 'No especificado', mensaje]
        );
        res.json({ message: 'Solicitud enviada exitosamente' });
    } catch (err) {
        console.error('Error al guardar solicitud:', err);
        res.status(500).json({ error: 'Error al guardar la solicitud' });
    }
});

app.listen(PORT, () => console.log(`Backend corriendo en el puerto ${PORT}`));
