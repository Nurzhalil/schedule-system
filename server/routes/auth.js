import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Find user with MySQL
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        groupId: user.group_id,
        teacherId: user.teacher_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, groupId, teacherId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with MySQL
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, group_id, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, groupId || null, teacherId || null]
    );

    res.status(201).json({ 
      message: 'Пользователь успешно создан',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}

export default router;