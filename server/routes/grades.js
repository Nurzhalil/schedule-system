import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get grades for a specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user can access these grades
    if (req.user.role === 'student' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const grades = await query(`
      SELECT 
        g.*,
        s.name as subject_name,
        t.name as teacher_name,
        u.name as student_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN teachers t ON g.teacher_id = t.id
      JOIN users u ON g.student_id = u.id
      WHERE g.student_id = ?
      ORDER BY g.date DESC
    `, [studentId]);

    res.json(grades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ error: 'Ошибка получения оценок' });
  }
});

// Get grade averages for a student
router.get('/student/:studentId/averages', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user can access these grades
    if (req.user.role === 'student' && req.user.userId !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const averages = await query(`
      SELECT 
        s.id as subject_id,
        s.name as subject_name,
        t.name as teacher_name,
        AVG(g.grade) as average_grade,
        COUNT(g.id) as total_grades
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN teachers t ON g.teacher_id = t.id
      WHERE g.student_id = ?
      GROUP BY s.id, s.name, t.name
      ORDER BY s.name
    `, [studentId]);

    res.json(averages);
  } catch (error) {
    console.error('Error fetching student averages:', error);
    res.status(500).json({ error: 'Ошибка получения средних оценок' });
  }
});

// Get grades for a specific teacher's subjects
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Check if user can access these grades
    if (req.user.role === 'teacher' && req.user.teacherId !== parseInt(teacherId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const grades = await query(`
      SELECT 
        g.*,
        s.name as subject_name,
        t.name as teacher_name,
        u.name as student_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN teachers t ON g.teacher_id = t.id
      JOIN users u ON g.student_id = u.id
      WHERE g.teacher_id = ?
      ORDER BY g.date DESC
    `, [teacherId]);

    res.json(grades);
  } catch (error) {
    console.error('Error fetching teacher grades:', error);
    res.status(500).json({ error: 'Ошибка получения оценок' });
  }
});

// Get all grades (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const grades = await query(`
      SELECT 
        g.*,
        s.name as subject_name,
        t.name as teacher_name,
        u.name as student_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN teachers t ON g.teacher_id = t.id
      JOIN users u ON g.student_id = u.id
      ORDER BY g.date DESC
    `);

    res.json(grades);
  } catch (error) {
    console.error('Error fetching all grades:', error);
    res.status(500).json({ error: 'Ошибка получения оценок' });
  }
});

// Create new grade (teacher and admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { studentId, subjectId, teacherId, grade, gradeType, description, date } = req.body;

    if (!studentId || !subjectId || !teacherId || !grade || !gradeType || !date) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    // Check if teacher can add grades for this subject
    if (req.user.role === 'teacher' && req.user.teacherId !== parseInt(teacherId)) {
      return res.status(403).json({ error: 'Вы можете добавлять оценки только по своим предметам' });
    }

    const result = await query(
      'INSERT INTO grades (student_id, subject_id, teacher_id, grade, grade_type, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, subjectId, teacherId, grade, gradeType, description || null, date]
    );

    res.status(201).json({ 
      message: 'Оценка добавлена',
      gradeId: result.insertId
    });

  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Ошибка добавления оценки' });
  }
});

// Update grade (teacher and admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { grade, gradeType, description, date } = req.body;

    // Check if teacher can update this grade
    if (req.user.role === 'teacher') {
      const existingGrade = await query('SELECT teacher_id FROM grades WHERE id = ?', [id]);
      if (!existingGrade.length || existingGrade[0].teacher_id !== req.user.teacherId) {
        return res.status(403).json({ error: 'Вы можете изменять только свои оценки' });
      }
    }

    const result = await query(
      'UPDATE grades SET grade = ?, grade_type = ?, description = ?, date = ? WHERE id = ?',
      [grade, gradeType, description || null, date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Оценка не найдена' });
    }

    res.json({ message: 'Оценка обновлена' });

  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ error: 'Ошибка обновления оценки' });
  }
});

// Delete grade (teacher and admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    // Check if teacher can delete this grade
    if (req.user.role === 'teacher') {
      const existingGrade = await query('SELECT teacher_id FROM grades WHERE id = ?', [id]);
      if (!existingGrade.length || existingGrade[0].teacher_id !== req.user.teacherId) {
        return res.status(403).json({ error: 'Вы можете удалять только свои оценки' });
      }
    }

    const result = await query('DELETE FROM grades WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Оценка не найдена' });
    }

    res.json({ message: 'Оценка удалена' });

  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ error: 'Ошибка удаления оценки' });
  }
});

export default router;