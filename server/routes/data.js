import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all groups
router.get('/groups', authenticateToken, (req, res) => {
  try {
    const groups = query('SELECT * FROM groups_table ORDER BY name');
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Ошибка получения групп' });
  }
});

// Get all teachers
router.get('/teachers', authenticateToken, (req, res) => {
  try {
    const teachers = query('SELECT * FROM teachers ORDER BY name');
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Ошибка получения преподавателей' });
  }
});

// Get all subjects
router.get('/subjects', authenticateToken, (req, res) => {
  try {
    const subjects = query(`
      SELECT s.*, t.name as teacher_name 
      FROM subjects s 
      JOIN teachers t ON s.teacher_id = t.id 
      ORDER BY s.name
    `);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Ошибка получения предметов' });
  }
});

// Get all rooms
router.get('/rooms', authenticateToken, (req, res) => {
  try {
    const rooms = query('SELECT * FROM rooms ORDER BY name');
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Ошибка получения аудиторий' });
  }
});

// Get all students
router.get('/students', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const students = query(`
      SELECT u.*, g.name as group_name 
      FROM users u 
      LEFT JOIN groups_table g ON u.group_id = g.id 
      WHERE u.role = 'student' 
      ORDER BY u.name
    `);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Ошибка получения студентов' });
  }
});

// Admin only routes
// Create group
router.post('/groups', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const result = query(
      'INSERT INTO groups_table (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    res.status(201).json({ 
      message: 'Группа создана',
      groupId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Ошибка создания группы' });
  }
});

// Create teacher
router.post('/teachers', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, email, phone, department } = req.body;
    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Имя, email и кафедра обязательны' });
    }

    const result = query(
      'INSERT INTO teachers (name, email, phone, department) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, department]
    );

    res.status(201).json({ 
      message: 'Преподаватель создан',
      teacherId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Ошибка создания преподавателя' });
  }
});

// Create subject
router.post('/subjects', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, teacherId, description } = req.body;
    if (!name || !teacherId) {
      return res.status(400).json({ error: 'Название предмета и преподаватель обязательны' });
    }

    const result = query(
      'INSERT INTO subjects (name, teacher_id, description) VALUES (?, ?, ?)',
      [name, teacherId, description || null]
    );

    res.status(201).json({ 
      message: 'Предмет создан',
      subjectId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Ошибка создания предмета' });
  }
});

// Create room
router.post('/rooms', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, capacity, description } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ error: 'Название аудитории и вместимость обязательны' });
    }

    const result = query(
      'INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)',
      [name, capacity, description || null]
    );

    res.status(201).json({ 
      message: 'Аудитория создана',
      roomId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Ошибка создания аудитории' });
  }
});

export default router;