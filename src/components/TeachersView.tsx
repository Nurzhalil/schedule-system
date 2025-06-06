import React, { useState } from 'react';
import { User, Plus, Edit, Trash2, Mail, Phone, Building } from 'lucide-react';
import { teachers, subjects } from '../data/mockData';

const TeachersView: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const getSubjectsForTeacher = (teacherId: number) => {
    return subjects.filter(subject => subject.teacherId === teacherId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление преподавателями</h2>
            <p className="text-gray-600">Добавление и редактирование информации о преподавателях</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить преподавателя
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить нового преподавателя</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ФИО преподавателя
              </label>
              <input
                type="text"
                placeholder="Иванов Иван Иванович"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="ivanov@university.ru"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                placeholder="+7 (495) 123-45-67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кафедра
              </label>
              <input
                type="text"
                placeholder="Кафедра информатики"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Добавить преподавателя
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

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map(teacher => {
          const teacherSubjects = getSubjectsForTeacher(teacher.id);
          return (
            <div key={teacher.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-emerald-100 rounded-full p-3 mr-4">
                    <User className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.department}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {teacher.email}
                </div>
                {teacher.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {teacher.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  {teacher.department}
                </div>
                
                {teacherSubjects.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Ведет предметы:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacherSubjects.map(subject => (
                        <span
                          key={subject.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <div className="flex items-center">
          <User className="h-8 w-8 text-emerald-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Общая статистика</h3>
            <p className="text-gray-600">
              Всего преподавателей: <span className="font-semibold">{teachers.length}</span> • 
              Активных предметов: <span className="font-semibold">{subjects.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersView;