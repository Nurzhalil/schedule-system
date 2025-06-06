import React from 'react';
import { LogOut, Calendar, Users, BookOpen, User, Settings, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { id: 'dashboard', label: 'Панель управления', icon: Settings },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'groups', label: 'Группы', icon: Users },
    { id: 'teachers', label: 'Преподаватели', icon: User },
    { id: 'subjects', label: 'Предметы', icon: BookOpen }
  ];

  const studentNavItems = [
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'grades', label: 'Мои оценки', icon: GraduationCap }
  ];

  const teacherNavItems = [
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'my-groups', label: 'Мои группы', icon: Users },
    { id: 'grades-management', label: 'Управление оценками', icon: GraduationCap }
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'teacher':
        return teacherNavItems;
      case 'student':
      default:
        return studentNavItems;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Панель администратора';
      case 'teacher':
        return 'Панель преподавателя';
      case 'student':
      default:
        return 'Студенческий портал';
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Система управления расписанием
                </h1>
                <p className="text-sm text-gray-500">
                  {getRoleLabel()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                          currentView === item.id
                            ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;