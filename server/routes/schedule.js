import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get schedule with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { groupId, teacherId, date, subjectId } = req.query;
    
    let sql = `
      SELECT 
        s.*,
        sub.name as subject_name,
        t.name as teacher_name,
        r.name as room_name,
        g.name as group_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN rooms r ON s.room_id = r.id
      JOIN groups_table g ON s.group_id = g.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (groupId) {
      sql += ' AND s.group_id = ?';
      params.push(groupId);
    }
    
    if (teacherId) {
      sql += ' AND s.teacher_id = ?';
      params.push(teacherId);
    }
    
    if (date) {
      sql += ' AND s.date = ?';
      params.push(date);
    }
    
    if (subjectId) {
      sql += ' AND s.subject_id = ?';
      params.push(subjectId);
    }
    
    sql += ' ORDER BY s.date, s.time_start';
    
    const schedule = await query(sql, params);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Ошибка получения расписания' });
  }
});

// Get schedule for a specific group
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const schedule = await query(`
      SELECT 
        s.*,
        sub.name as subject_name,
        t.name as teacher_name,
        r.name as room_name,
        g.name as group_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN rooms r ON s.room_id = r.id
      JOIN groups_table g ON s.group_id = g.id
      WHERE s.group_id = ?
      ORDER BY s.date, s.time_start
    `, [groupId]);

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching group schedule:', error);
    res.status(500).json({ error: 'Ошибка получения расписания' });
  }
});

// Get schedule for a specific teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const schedule = await query(`
      SELECT 
        s.*,
        sub.name as subject_name,
        t.name as teacher_name,
        r.name as room_name,
        g.name as group_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN rooms r ON s.room_id = r.id
      JOIN groups_table g ON s.group_id = g.id
      WHERE s.teacher_id = ?
      ORDER BY s.date, s.time_start
    `, [teacherId]);

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ error: 'Ошибка получения расписания' });
  }
});

// Get all schedule (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const schedule = await query(`
      SELECT 
        s.*,
        sub.name as subject_name,
        t.name as teacher_name,
        r.name as room_name,
        g.name as group_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN rooms r ON s.room_id = r.id
      JOIN groups_table g ON s.group_id = g.id
      ORDER BY s.date, s.time_start
    `);

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching all schedule:', error);
    res.status(500).json({ error: 'Ошибка получения расписания' });
  }
});

// Create new schedule entry (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { groupId, subjectId, teacherId, roomId, date, timeStart, timeEnd } = req.body;

    if (!groupId || !subjectId || !teacherId || !roomId || !date || !timeStart || !timeEnd) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const result = await query(
      'INSERT INTO schedule (group_id, subject_id, teacher_id, room_id, date, time_start, time_end) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [groupId, subjectId, teacherId, roomId, date, timeStart, timeEnd]
    );

    res.status(201).json({ 
      message: 'Запись в расписании создана',
      scheduleId: result.insertId
    });

  } catch (error) {
    console.error('Error creating schedule entry:', error);
    res.status(500).json({ error: 'Ошибка создания записи в расписании' });
  }
});

// Update schedule entry (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { groupId, subjectId, teacherId, roomId, date, timeStart, timeEnd } = req.body;

    const result = await query(
      'UPDATE schedule SET group_id = ?, subject_id = ?, teacher_id = ?, room_id = ?, date = ?, time_start = ?, time_end = ? WHERE id = ?',
      [groupId, subjectId, teacherId, roomId, date, timeStart, timeEnd, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Запись в расписании не найдена' });
    }

    res.json({ message: 'Запись в расписании обновлена' });

  } catch (error) {
    console.error('Error updating schedule entry:', error);
    res.status(500).json({ error: 'Ошибка обновления записи в расписании' });
  }
});

// Delete schedule entry (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const result = await query('DELETE FROM schedule WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Запись в расписании не найдена' });
    }

    res.json({ message: 'Запись в расписании удалена' });

  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    res.status(500).json({ error: 'Ошибка удаления записи в расписании' });
  }
});

export default router;