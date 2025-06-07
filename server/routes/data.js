import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all groups
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await query('SELECT * FROM groups_table ORDER BY name');
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Ошибка получения групп' });
  }
});

// Get all teachers
router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const teachers = await query('SELECT * FROM teachers ORDER BY name');
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Ошибка получения преподавателей' });
  }
});

// Get all subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await query(`
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
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await query('SELECT * FROM rooms ORDER BY name');
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Ошибка получения аудиторий' });
  }
});

// Get all students
router.get('/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const students = await query(`
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

// Get students by group
router.get('/students/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const students = await query(`
      SELECT u.*, g.name as group_name 
      FROM users u 
      LEFT JOIN groups_table g ON u.group_id = g.id 
      WHERE u.role = 'student' AND u.group_id = ?
      ORDER BY u.name
    `, [groupId]);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students by group:', error);
    res.status(500).json({ error: 'Ошибка получения студентов группы' });
  }
});

// Get teacher subjects
router.get('/teacher/:teacherId/subjects', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const subjects = await query(`
      SELECT s.*, t.name as teacher_name 
      FROM subjects s 
      JOIN teachers t ON s.teacher_id = t.id 
      WHERE s.teacher_id = ?
      ORDER BY s.name
    `, [teacherId]);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ error: 'Ошибка получения предметов преподавателя' });
  }
});

// Admin only routes
// Create group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const result = await query(
      'INSERT INTO groups_table (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    res.status(201).json({ 
      message: 'Группа создана',
      groupId: result.insertId
    });

  } catch (error) {
    console.error('Error creating group:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Группа с таким названием уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка создания группы' });
    }
  }
});

// Update group
router.put('/groups/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const result = await query(
      'UPDATE groups_table SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    res.json({ message: 'Группа обновлена' });

  } catch (error) {
    console.error('Error updating group:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Группа с таким названием уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка обновления группы' });
    }
  }
});

// Delete group
router.delete('/groups/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const result = await query('DELETE FROM groups_table WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    res.json({ message: 'Группа удалена' });

  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Ошибка удаления группы' });
  }
});

// Create teacher
router.post('/teachers', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, email, phone, department } = req.body;
    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Имя, email и кафедра обязательны' });
    }

    const result = await query(
      'INSERT INTO teachers (name, email, phone, department) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, department]
    );

    res.status(201).json({ 
      message: 'Преподаватель создан',
      teacherId: result.insertId
    });

  } catch (error) {
    console.error('Error creating teacher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Преподаватель с таким email уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка создания преподавателя' });
    }
  }
});

// Update teacher
router.put('/teachers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { name, email, phone, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Имя, email и кафедра обязательны' });
    }

    const result = await query(
      'UPDATE teachers SET name = ?, email = ?, phone = ?, department = ? WHERE id = ?',
      [name, email, phone || null, department, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }

    res.json({ message: 'Преподаватель обновлен' });

  } catch (error) {
    console.error('Error updating teacher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Преподаватель с таким email уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка обновления преподавателя' });
    }
  }
});

// Delete teacher
router.delete('/teachers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const result = await query('DELETE FROM teachers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }

    res.json({ message: 'Преподаватель удален' });

  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Ошибка удаления преподавателя' });
  }
});

// Create subject
router.post('/subjects', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, teacherId, description } = req.body;
    if (!name || !teacherId) {
      return res.status(400).json({ error: 'Название предмета и преподаватель обязательны' });
    }

    const result = await query(
      'INSERT INTO subjects (name, teacher_id, description) VALUES (?, ?, ?)',
      [name, teacherId, description || null]
    );

    res.status(201).json({ 
      message: 'Предмет создан',
      subjectId: result.insertId
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Ошибка создания предмета' });
  }
});

// Update subject
router.put('/subjects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { name, teacherId, description } = req.body;

    if (!name || !teacherId) {
      return res.status(400).json({ error: 'Название предмета и преподаватель обязательны' });
    }

    const result = await query(
      'UPDATE subjects SET name = ?, teacher_id = ?, description = ? WHERE id = ?',
      [name, teacherId, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    res.json({ message: 'Предмет обновлен' });

  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Ошибка обновления предмета' });
  }
});

// Delete subject
router.delete('/subjects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const result = await query('DELETE FROM subjects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    res.json({ message: 'Предмет удален' });

  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Ошибка удаления предмета' });
  }
});

// Create room
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { name, capacity, description } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ error: 'Название аудитории и вместимость обязательны' });
    }

    const result = await query(
      'INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)',
      [name, capacity, description || null]
    );

    res.status(201).json({ 
      message: 'Аудитория создана',
      roomId: result.insertId
    });

  } catch (error) {
    console.error('Error creating room:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Аудитория с таким названием уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка создания аудитории' });
    }
  }
});

// Update room
router.put('/rooms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { name, capacity, description } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: 'Название аудитории и вместимость обязательны' });
    }

    const result = await query(
      'UPDATE rooms SET name = ?, capacity = ?, description = ? WHERE id = ?',
      [name, capacity, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Аудитория не найдена' });
    }

    res.json({ message: 'Аудитория обновлена' });

  } catch (error) {
    console.error('Error updating room:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Аудитория с таким названием уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка обновления аудитории' });
    }
  }
});

// Delete room
router.delete('/rooms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const result = await query('DELETE FROM rooms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Аудитория не найдена' });
    }

    res.json({ message: 'Аудитория удалена' });

  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Ошибка удаления аудитории' });
  }
});

export default router;