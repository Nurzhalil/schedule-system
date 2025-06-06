import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, User } from 'lucide-react';
import { subjects, teachers } from '../data/mockData';

const SubjectsView: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Не назначен';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление предметами</h2>
            <p className="text-gray-600">Добавление и редактирование учебных дисциплин</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить предмет
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить новый предмет</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название предмета
              </label>
              <input
                type="text"
                placeholder="Математический анализ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Преподаватель
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Выберите преподавателя</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание (опционально)
              </label>
              <textarea
                rows={3}
                placeholder="Краткое описание курса..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Добавить предмет
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

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                <div className="bg-indigo-100 rounded-lg p-3 mr-3 flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate" title={subject.name}>
                    {subject.name}
                  </h3>
                </div>
              </div>
              <div className="flex space-x-1 flex-shrink-0 ml-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate" title={getTeacherName(subject.teacherId)}>
                    {getTeacherName(subject.teacherId)}
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <button className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Просмотреть расписание →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects by Department */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Предметы по кафедрам</h3>
        <div className="space-y-4">
          {Array.from(new Set(teachers.map(t => t.department))).map(department => {
            const departmentTeachers = teachers.filter(t => t.department === department);
            const departmentSubjects = subjects.filter(s => 
              departmentTeachers.some(t => t.id === s.teacherId)
            );
            
            return (
              <div key={department} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{department}</h4>
                <div className="flex flex-wrap gap-2">
                  {departmentSubjects.map(subject => (
                    <span
                      key={subject.id}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-indigo-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Общая статистика</h3>
            <p className="text-gray-600">
              Всего предметов: <span className="font-semibold">{subjects.length}</span> • 
              Кафедр: <span className="font-semibold">
                {Array.from(new Set(teachers.map(t => t.department))).length}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsView;