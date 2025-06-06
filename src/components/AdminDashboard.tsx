import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, BookOpen, User, MapPin, Calendar } from 'lucide-react';
import { groups, teachers, subjects, rooms, scheduleEntries } from '../data/mockData';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');

  const stats = [
    { label: 'Группы', value: groups.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Преподаватели', value: teachers.length, icon: User, color: 'bg-emerald-500' },
    { label: 'Предметы', value: subjects.length, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Аудитории', value: rooms.length, icon: MapPin, color: 'bg-orange-500' },
    { label: 'Занятий в неделю', value: scheduleEntries.length, icon: Calendar, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Панель управления</h2>
        <p className="text-gray-600">Управление учебным процессом и расписанием</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Обзор системы
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Управление данными
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? <OverviewTab /> : <ManageTab />}
        </div>
      </div>
    </div>
  );
};

const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Recent Activities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние изменения</h3>
        <div className="space-y-3">
          {[
            { action: 'Создано расписание', entity: 'ИС-21', time: '2 часа назад', type: 'schedule' },
            { action: 'Добавлен преподаватель', entity: 'Смирнов В.А.', time: '5 часов назад', type: 'teacher' },
            { action: 'Обновлена группа', entity: 'ПИ-22', time: '1 день назад', type: 'group' },
            { action: 'Добавлен предмет', entity: 'Математический анализ', time: '2 дня назад', type: 'subject' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.entity}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Загруженность аудиторий</h4>
          <div className="space-y-2">
            {rooms.slice(0, 3).map(room => (
              <div key={room.id} className="flex justify-between items-center">
                <span className="text-blue-800">Ауд. {room.name}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-blue-200 rounded-full h-2 mr-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                  <span className="text-sm text-blue-700">{Math.floor(Math.random() * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-emerald-900 mb-3">Нагрузка преподавателей</h4>
          <div className="space-y-2">
            {teachers.slice(0, 3).map(teacher => (
              <div key={teacher.id} className="flex justify-between items-center">
                <span className="text-emerald-800 text-sm">{teacher.name.split(' ').slice(0, 2).join(' ')}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-emerald-200 rounded-full h-2 mr-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                  </div>
                  <span className="text-sm text-emerald-700">{Math.floor(Math.random() * 20 + 5)} ч/нед</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageTab: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<'groups' | 'teachers' | 'subjects' | 'rooms'>('groups');

  const entities = {
    groups: { data: groups, label: 'Группы', icon: Users },
    teachers: { data: teachers, label: 'Преподаватели', icon: User },
    subjects: { data: subjects, label: 'Предметы', icon: BookOpen },
    rooms: { data: rooms, label: 'Аудитории', icon: MapPin }
  };

  return (
    <div className="space-y-6">
      {/* Entity Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(entities).map(([key, entity]) => {
          const Icon = entity.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedEntity(key as any)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedEntity === key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {entity.label}
            </button>
          );
        })}
      </div>

      {/* Entity Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Управление: {entities[selectedEntity].label}
          </h3>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                {selectedEntity === 'teachers' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кафедра
                    </th>
                  </>
                )}
                {selectedEntity === 'rooms' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Вместимость
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entities[selectedEntity].data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  {selectedEntity === 'teachers' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.department}
                      </td>
                    </>
                  )}
                  {selectedEntity === 'rooms' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.capacity} мест
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;