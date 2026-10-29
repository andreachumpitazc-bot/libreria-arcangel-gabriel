const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'secreto_super_seguro_123';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'libreria_db'
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
        res.status(400).json({ error: 'El correo ya está registrado' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
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
});

// --- API REST: PRODUCTOS (CRUD) ---
app.get('/api/productos', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(rows);
});

app.post('/api/productos', async (req, res) => {
    const { categoria, nombre, detalle, precio, stock } = req.body;
    const [result] = await db.query(
        'INSERT INTO productos (categoria, nombre, detalle, precio, stock) VALUES (?, ?, ?, ?, ?)',
        [categoria, nombre, detalle, precio, stock]
    );
    res.json({ id: result.insertId, message: 'Producto guardado' });
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { categoria, nombre, detalle, precio, stock } = req.body;
    await db.query(
        'UPDATE productos SET categoria=?, nombre=?, detalle=?, precio=?, stock=? WHERE id=?',
        [categoria, nombre, detalle, precio, stock, id]
    );
    res.json({ message: 'Producto actualizado' });
});

app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM productos WHERE id=?', [id]);
    res.json({ message: 'Producto eliminado' });
});

// --- API REST: SOLICITUDES DE CONTACTO ---
app.get('/api/solicitudes', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM solicitudes ORDER BY fecha DESC');
    res.json(rows);
});

app.post('/api/solicitudes', async (req, res) => {
    const { nombre, telefono, email, mensaje } = req.body;
    await db.query(
        'INSERT INTO solicitudes (nombre, telefono, email, mensaje) VALUES (?, ?, ?, ?)',
        [nombre, telefono, email || 'No especificado', mensaje]
    );
    res.json({ message: 'Solicitud enviada exitosamente' });
});

app.listen(3000, () => console.log('Backend corriendo en http://localhost:3000'));
