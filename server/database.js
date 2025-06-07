import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'schedule_db',
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
    // 1. Groups table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS groups_table (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Teachers table
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

    // 3. Rooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        capacity INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Users table
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

    // 5. Subjects table
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

    // 6. Schedule table
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

    // 7. Grades table
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
      // Create admin user only
      const hashedPassword = await bcrypt.hash('password', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Administrator', 'admin@university.ru', hashedPassword, 'admin']);
      console.log('✅ Admin user created');
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