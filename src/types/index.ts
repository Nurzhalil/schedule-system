export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  groupId?: number;
  teacherId?: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
}

export interface Subject {
  id: number;
  name: string;
  teacherId: number;
  teacherName?: string;
  description?: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  description?: string;
}

export interface ScheduleEntry {
  id: number;
  groupId: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export interface ScheduleView extends ScheduleEntry {
  groupName: string;
  subjectName: string;
  teacherName: string;
  roomName: string;
}

export interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  teacherId: number;
  grade: number;
  gradeType: 'exam' | 'test' | 'homework' | 'project' | 'attendance';
  description?: string;
  date: string;
  subjectName?: string;
  teacherName?: string;
}

export interface GradeAverage {
  subjectId: number;
  subjectName: string;
  teacherName: string;
  averageGrade: number;
  totalGrades: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}