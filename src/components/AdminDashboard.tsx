import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, BookOpen, User, MapPin, Calendar, Save, X } from 'lucide-react';
import { apiService } from '../services/api';

interface EntityData {
  groups: any[];
  teachers: any[];
  subjects: any[];
  rooms: any[];
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');
  const [data, setData] = useState<EntityData>({
    groups: [],
    teachers: [],
    subjects: [],
    rooms: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groups, teachers, subjects, rooms] = await Promise.all([
        apiService.getGroups(),
        apiService.getTeachers(),
        apiService.getSubjects(),
        apiService.getRooms()
      ]);

      setData({ groups, teachers, subjects, rooms });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Группы', value: data.groups.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Преподаватели', value: data.teachers.length, icon: User, color: 'bg-emerald-500' },
    { label: 'Предметы', value: data.subjects.length, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Аудитории', value: data.rooms.length, icon: MapPin, color: 'bg-orange-500' }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Панель управления</h2>
        <p className="text-gray-600">Управление учебным процессом и расписанием</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          {activeTab === 'overview' ? (
            <OverviewTab data={data} />
          ) : (
            <ManageTab data={data} onDataChange={fetchData} />
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ data: EntityData }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Recent Activities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние изменения</h3>
        <div className="space-y-3">
          {[
            { action: 'Система запущена', entity: 'Администратор', time: 'Только что', type: 'system' },
            { action: 'База данных инициализирована', entity: 'MySQL', time: 'Только что', type: 'database' }
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
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Статистика групп</h4>
          <div className="space-y-2">
            {data.groups.slice(0, 3).map(group => (
              <div key={group.id} className="flex justify-between items-center">
                <span className="text-blue-800">{group.name}</span>
                <span className="text-sm text-blue-700">Активна</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-emerald-900 mb-3">Преподаватели по кафедрам</h4>
          <div className="space-y-2">
            {Array.from(new Set(data.teachers.map(t => t.department))).slice(0, 3).map(department => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-emerald-800 text-sm">{department}</span>
                <span className="text-sm text-emerald-700">
                  {data.teachers.filter(t => t.department === department).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageTab: React.FC<{ data: EntityData; onDataChange: () => void }> = ({ data, onDataChange }) => {
  const [selectedEntity, setSelectedEntity] = useState<'groups' | 'teachers' | 'subjects' | 'rooms'>('groups');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const entities = {
    groups: { data: data.groups, label: 'Группы', icon: Users },
    teachers: { data: data.teachers, label: 'Преподаватели', icon: User },
    subjects: { data: data.subjects, label: 'Предметы', icon: BookOpen },
    rooms: { data: data.rooms, label: 'Аудитории', icon: MapPin }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update
        switch (selectedEntity) {
          case 'groups':
            await apiService.updateGroup(editingItem.id, formData);
            break;
          case 'teachers':
            await apiService.updateTeacher(editingItem.id, formData);
            break;
          case 'subjects':
            await apiService.updateSubject(editingItem.id, formData);
            break;
          case 'rooms':
            await apiService.updateRoom(editingItem.id, formData);
            break;
        }
      } else {
        // Create
        switch (selectedEntity) {
          case 'groups':
            await apiService.addGroup(formData);
            break;
          case 'teachers':
            await apiService.addTeacher(formData);
            break;
          case 'subjects':
            await apiService.addSubject(formData);
            break;
          case 'rooms':
            await apiService.addRoom(formData);
            break;
        }
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({});
      onDataChange();
    } catch (error: any) {
      alert(error.message || 'Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
    
    try {
      switch (selectedEntity) {
        case 'groups':
          await apiService.deleteGroup(id);
          break;
        case 'teachers':
          await apiService.deleteTeacher(id);
          break;
        case 'subjects':
          await apiService.deleteSubject(id);
          break;
        case 'rooms':
          await apiService.deleteRoom(id);
          break;
      }
      
      onDataChange();
    } catch (error: any) {
      alert(error.message || 'Ошибка при удалении');
    }
  };

  const renderForm = () => {
    switch (selectedEntity) {
      case 'groups':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название группы</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        );
      
      case 'teachers':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Кафедра</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        );
      
      case 'subjects':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название предмета</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Преподаватель</label>
              <select
                value={formData.teacherId || formData.teacher_id || ''}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value, teacher_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Выберите преподавателя</option>
                {data.teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название аудитории</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Вместимость</label>
              <input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
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

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Редактировать' : 'Добавить'} {entities[selectedEntity].label.toLowerCase()}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {renderForm()}
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить
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

      {/* Entity Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Управление: {entities[selectedEntity].label}
          </h3>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
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
                {selectedEntity === 'subjects' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Преподаватель
                  </th>
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
                  {selectedEntity === 'subjects' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.teacher_name}
                    </td>
                  )}
                  {selectedEntity === 'rooms' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.capacity} мест
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
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