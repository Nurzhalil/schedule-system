import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
export async function initializeDatabase() {
  try {
    console.log('✅ Database connection established');
    await createTables();
    await insertInitialData();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  const connection = await pool.getConnection();
  try {
    // 1. Groups table (создается первой, так как на нее ссылаются другие)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS groups_table (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Teachers table (создается второй, так как на нее ссылаются другие)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Rooms table (независимая таблица)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        capacity INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Users table (зависит от groups и teachers)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student', 'teacher') NOT NULL,
        group_id INT NULL,
        teacher_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE SET NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
      )
    `);

    // 5. Subjects table (зависит от teachers)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        teacher_id INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
      )
    `);

    // 6. Schedule table (зависит от всех кроме grades)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        group_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        room_id INT NOT NULL,
        date DATE NOT NULL,
        time_start TIME NOT NULL,
        time_end TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);

    // 7. Grades table (создается последней, так как зависит от users, subjects и teachers)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        grade INT NOT NULL CHECK (grade >= 1 AND grade <= 5),
        grade_type ENUM('exam', 'test', 'homework', 'project', 'attendance') NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function insertInitialData() {
  const connection = await pool.getConnection();
  try {
    // Check if admin exists
    const [existingAdmin] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@university.ru']);
    
    if (!existingAdmin || existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('password', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Administrator', 'admin@university.ru', hashedPassword, 'admin']);
      console.log('✅ Admin user created');
    }

    // Check if groups exist
    const [existingGroups] = await connection.query('SELECT COUNT(*) as count FROM groups_table');
    if (existingGroups[0].count === 0) {
      // Insert groups
      const groups = [
        ['ИС-21', 'Информационные системы, 2021 год'],
        ['ИС-22', 'Информационные системы, 2022 год'],
        ['ПИ-21', 'Программная инженерия, 2021 год'],
        ['ПИ-22', 'Программная инженерия, 2022 год'],
        ['КБ-21', 'Кибербезопасность, 2021 год']
      ];

      for (const [name, description] of groups) {
        await connection.query('INSERT INTO groups_table (name, description) VALUES (?, ?)', [name, description]);
      }
      console.log('✅ Groups created');
    }

    // Check if teachers exist
    const [existingTeachers] = await connection.query('SELECT COUNT(*) as count FROM teachers');
    if (existingTeachers[0].count === 0) {
      // Insert teachers
      const teachers = [
        ['Смирнов В.А.', 'smirnov@university.ru', '+7 (495) 123-45-67', 'Кафедра математики'],
        ['Волкова Е.Н.', 'volkova@university.ru', '+7 (495) 234-56-78', 'Кафедра информатики'],
        ['Морозов А.В.', 'morozov@university.ru', '+7 (495) 345-67-89', 'Кафедра физики'],
        ['Лебедева О.П.', 'lebedeva@university.ru', '+7 (495) 456-78-90', 'Кафедра иностранных языков'],
        ['Новиков С.М.', 'novikov@university.ru', '+7 (495) 567-89-01', 'Кафедра экономики']
      ];

      for (const [name, email, phone, department] of teachers) {
        await connection.query(
          'INSERT INTO teachers (name, email, phone, department) VALUES (?, ?, ?, ?)',
          [name, email, phone, department]
        );
      }
      console.log('✅ Teachers created');
    }

    console.log('✅ Initial data checked/inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting initial data:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper functions for database operations
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function get(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
}

export { pool as db };