import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, User } from 'lucide-react';
import { groups, users } from '../data/mockData';

const GroupsView: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const getStudentCount = (groupId: number) => {
    return users.filter(user => user.groupId === groupId && user.role === 'student').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление группами</h2>
            <p className="text-gray-600">Создание и редактирование учебных групп</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить группу
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить новую группу</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название группы
              </label>
              <input
                type="text"
                placeholder="Например: ИС-23"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание (опционально)
              </label>
              <input
                type="text"
                placeholder="Информационные системы, 2023 год"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Создать группу
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

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3 mr-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
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
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Студентов</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {getStudentCount(group.id)}
                </span>
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

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Общая статистика</h3>
            <p className="text-gray-600">
              Всего групп: <span className="font-semibold">{groups.length}</span> • 
              Всего студентов: <span className="font-semibold">
                {users.filter(u => u.role === 'student').length}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsView;