import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Users, BookOpen, Calendar, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Subject, Grade } from '../types';

interface Student {
  id: number;
  name: string;
  email: string;
  groupName: string;
}

const GradesManagementView: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);

  // Form state
  const [newGrade, setNewGrade] = useState({
    studentId: '',
    grade: '',
    gradeType: 'test',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.teacherId) {
      fetchData();
    }
  }, [user?.teacherId]);

  useEffect(() => {
    if (selectedGroup) {
      fetchStudents();
    }
  }, [selectedGroup]);

  const fetchData = async () => {
    try {
      // Fetch teacher's subjects
      const subjectsData = await apiService.getTeacherSubjects(user!.teacherId!);
      setSubjects(subjectsData);

      // Fetch teacher's schedule to get groups
      const scheduleData = await apiService.getSchedule({ teacherId: user!.teacherId });
      
      // Get unique groups
      const uniqueGroups = Array.from(
        new Set(scheduleData.map(s => s.groupId))
      ).map(groupId => {
        const scheduleEntry = scheduleData.find(s => s.groupId === groupId);
        return {
          id: groupId,
          name: scheduleEntry?.groupName || ''
        };
      });

      setGroups(uniqueGroups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      if (selectedGroup) {
        const studentsData = await apiService.getStudentsByGroup(selectedGroup);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !newGrade.studentId || !newGrade.grade) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      await apiService.addGrade({
        studentId: parseInt(newGrade.studentId),
        subjectId: selectedSubject,
        teacherId: user!.teacherId!,
        grade: parseInt(newGrade.grade),
        gradeType: newGrade.gradeType,
        description: newGrade.description,
        date: newGrade.date
      });

      // Reset form
      setNewGrade({
        studentId: '',
        grade: '',
        gradeType: 'test',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      setShowAddForm(false);
      alert('Оценка успешно добавлена!');
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Ошибка при добавлении оценки');
    }
  };

  const gradeTypes = [
    { value: 'exam', label: 'Экзамен' },
    { value: 'test', label: 'Тест' },
    { value: 'homework', label: 'Домашнее задание' },
    { value: 'project', label: 'Проект' },
    { value: 'attendance', label: 'Посещаемость' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление оценками</h2>
            <p className="text-gray-600">Выставление и управление оценками студентов</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить оценку
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предмет
            </label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите предмет</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Группа
            </label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите группу</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Grade Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить оценку</h3>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предмет *
                </label>
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите предмет</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Студент *
                </label>
                <select
                  value={newGrade.studentId}
                  onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedGroup}
                >
                  <option value="">
                    {selectedGroup ? 'Выберите студента' : 'Сначала выберите группу'}
                  </option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка *
                </label>
                <select
                  value={newGrade.grade}
                  onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите оценку</option>
                  <option value="5">5 (Отлично)</option>
                  <option value="4">4 (Хорошо)</option>
                  <option value="3">3 (Удовлетворительно)</option>
                  <option value="2">2 (Неудовлетворительно)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип оценки
                </label>
                <select
                  value={newGrade.gradeType}
                  onChange={(e) => setNewGrade({ ...newGrade, gradeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {gradeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата
                </label>
                <input
                  type="date"
                  value={newGrade.date}
                  onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий
              </label>
              <textarea
                value={newGrade.description}
                onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Дополнительные комментарии к оценке..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить оценку
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              <p className="text-sm text-gray-600">Ваших предметов</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-emerald-100 rounded-lg p-3 mr-4">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
              <p className="text-sm text-gray-600">Групп</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-600">Студентов в выбранной группе</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      {selectedGroup && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Студенты группы {groups.find(g => g.id === selectedGroup)?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Инструкции</h3>
            <p className="text-gray-600">
              1. Выберите предмет и группу для просмотра студентов
              <br />
              2. Нажмите "Добавить оценку" для выставления новой оценки
              <br />
              3. Заполните все обязательные поля и сохраните оценку
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesManagementView;