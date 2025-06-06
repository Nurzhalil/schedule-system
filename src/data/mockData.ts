import { User, Group, Teacher, Subject, Room, ScheduleEntry } from '../types';

export const users: User[] = [
  { id: 1, name: 'Администратор Система', email: 'admin@university.ru', role: 'admin' },
  { id: 2, name: 'Иванов Алексей Петрович', email: 'ivanov@student.ru', role: 'student', groupId: 1 },
  { id: 3, name: 'Петрова Мария Сергеевна', email: 'petrova@student.ru', role: 'student', groupId: 1 },
  { id: 4, name: 'Сидоров Дмитрий Иванович', email: 'sidorov@student.ru', role: 'student', groupId: 2 },
  { id: 5, name: 'Козлова Анна Викторовна', email: 'kozlova@student.ru', role: 'student', groupId: 2 }
];

export const groups: Group[] = [
  { id: 1, name: 'ИС-21' },
  { id: 2, name: 'ИС-22' },
  { id: 3, name: 'ПИ-21' },
  { id: 4, name: 'ПИ-22' },
  { id: 5, name: 'КБ-21' }
];

export const teachers: Teacher[] = [
  { id: 1, name: 'Смирнов Владимир Александрович', email: 'smirnov@university.ru', phone: '+7 (495) 123-45-67', department: 'Кафедра математики' },
  { id: 2, name: 'Волкова Елена Николаевна', email: 'volkova@university.ru', phone: '+7 (495) 234-56-78', department: 'Кафедра информатики' },
  { id: 3, name: 'Морозов Андрей Викторович', email: 'morozov@university.ru', phone: '+7 (495) 345-67-89', department: 'Кафедра физики' },
  { id: 4, name: 'Лебедева Ольга Петровна', email: 'lebedeva@university.ru', phone: '+7 (495) 456-78-90', department: 'Кафедра иностранных языков' },
  { id: 5, name: 'Новиков Сергей Михайлович', email: 'novikov@university.ru', phone: '+7 (495) 567-89-01', department: 'Кафедра экономики' }
];

export const subjects: Subject[] = [
  { id: 1, name: 'Математический анализ', teacherId: 1 },
  { id: 2, name: 'Программирование', teacherId: 2 },
  { id: 3, name: 'Физика', teacherId: 3 },
  { id: 4, name: 'Английский язык', teacherId: 4 },
  { id: 5, name: 'Экономика', teacherId: 5 }
];

export const rooms: Room[] = [
  { id: 1, name: '101', capacity: 30 },
  { id: 2, name: '102', capacity: 25 },
  { id: 3, name: '201', capacity: 40 },
  { id: 4, name: '202', capacity: 35 },
  { id: 5, name: '301', capacity: 20 }
];

export const scheduleEntries: ScheduleEntry[] = [
  { id: 1, groupId: 1, subjectId: 1, teacherId: 1, roomId: 1, date: '2024-01-15', timeStart: '09:00', timeEnd: '10:30' },
  { id: 2, groupId: 1, subjectId: 2, teacherId: 2, roomId: 2, date: '2024-01-15', timeStart: '10:45', timeEnd: '12:15' },
  { id: 3, groupId: 1, subjectId: 3, teacherId: 3, roomId: 3, date: '2024-01-15', timeStart: '13:00', timeEnd: '14:30' },
  { id: 4, groupId: 2, subjectId: 4, teacherId: 4, roomId: 4, date: '2024-01-15', timeStart: '09:00', timeEnd: '10:30' },
  { id: 5, groupId: 2, subjectId: 5, teacherId: 5, roomId: 5, date: '2024-01-15', timeStart: '10:45', timeEnd: '12:15' },
  { id: 6, groupId: 1, subjectId: 4, teacherId: 4, roomId: 1, date: '2024-01-16', timeStart: '09:00', timeEnd: '10:30' },
  { id: 7, groupId: 1, subjectId: 1, teacherId: 1, roomId: 2, date: '2024-01-16', timeStart: '10:45', timeEnd: '12:15' },
  { id: 8, groupId: 2, subjectId: 2, teacherId: 2, roomId: 3, date: '2024-01-16', timeStart: '09:00', timeEnd: '10:30' },
  { id: 9, groupId: 2, subjectId: 3, teacherId: 3, roomId: 4, date: '2024-01-16', timeStart: '13:00', timeEnd: '14:30' },
  { id: 10, groupId: 1, subjectId: 5, teacherId: 5, roomId: 5, date: '2024-01-17', timeStart: '09:00', timeEnd: '10:30' }
];