import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Grade, GradeAverage } from '../types';

const GradesView: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [averages, setAverages] = useState<GradeAverage[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchGrades();
      fetchAverages();
    }
  }, [user?.id]);

  const fetchGrades = async () => {
    try {
      const data = await apiService.getStudentGrades(user!.id);
      setGrades(data);
    } catch (error) {
      setError('Ошибка загрузки оценок');
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAverages = async () => {
    try {
      const data = await apiService.getStudentGradeAverages(user!.id);
      setAverages(data);
    } catch (error) {
      console.error('Error fetching averages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 5) return 'text-green-600 bg-green-100';
    if (grade >= 4) return 'text-blue-600 bg-blue-100';
    if (grade >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeTypeLabel = (type: string) => {
    const types = {
      exam: 'Экзамен',
      test: 'Тест',
      homework: 'Домашнее задание',
      project: 'Проект',
      attendance: 'Посещаемость'
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredGrades = selectedSubject 
    ? grades.filter(grade => grade.subjectId === selectedSubject)
    : grades;

  const overallAverage = averages.length > 0 
    ? averages.reduce((sum, avg) => sum + avg.averageGrade, 0) / averages.length 
    : 0;

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Мои оценки</h2>
            <p className="text-gray-600">Просмотр успеваемости по всем предметам</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallAverage.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Общий средний балл</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{averages.length}</p>
              <p className="text-sm text-gray-600">Предметов</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
              <p className="text-sm text-gray-600">Всего оценок</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {grades.filter(g => g.grade >= 4).length}
              </p>
              <p className="text-sm text-gray-600">Хороших оценок</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((grades.filter(g => g.grade >= 4).length / grades.length) * 100) || 0}%
              </p>
              <p className="text-sm text-gray-600">Успеваемость</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Averages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Средние баллы по предметам</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {averages.map(average => (
            <div 
              key={average.subjectId} 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSubject === average.subjectId 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSubject(
                selectedSubject === average.subjectId ? null : average.subjectId
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{average.subjectName}</h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(average.averageGrade)}`}>
                  {average.averageGrade.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{average.teacherName}</p>
              <p className="text-xs text-gray-500 mt-1">
                Оценок: {average.totalGrades}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grades List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedSubject ? 'Оценки по выбранному предмету' : 'Все оценки'}
          </h3>
          {selectedSubject && (
            <button
              onClick={() => setSelectedSubject(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Показать все предметы
            </button>
          )}
        </div>

        {filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Оценок пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGrades.map(grade => (
              <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{grade.subjectName}</h4>
                      <p className="text-sm text-gray-600">{grade.teacherName}</p>
                    </div>
                  </div>
                  {grade.description && (
                    <p className="text-sm text-gray-600 mt-2 ml-16">{grade.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(grade.date).toLocaleDateString('ru-RU')}
                  </div>
                  <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    {getGradeTypeLabel(grade.gradeType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesView;