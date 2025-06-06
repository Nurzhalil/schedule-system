import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import ScheduleView from './components/ScheduleView';
import AdminDashboard from './components/AdminDashboard';
import GroupsView from './components/GroupsView';
import TeachersView from './components/TeachersView';
import SubjectsView from './components/SubjectsView';
import GradesView from './components/GradesView';
import TeacherScheduleView from './components/TeacherScheduleView';
import TeacherGroupsView from './components/TeacherGroupsView';
import GradesManagementView from './components/GradesManagementView';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('');

  useEffect(() => {
    if (user) {
      // Set default view based on user role
      switch (user.role) {
        case 'admin':
          setCurrentView('dashboard');
          break;
        case 'teacher':
          setCurrentView('schedule');
          break;
        case 'student':
        default:
          setCurrentView('schedule');
          break;
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      // Admin views
      case 'dashboard':
        return <AdminDashboard />;
      case 'groups':
        return <GroupsView />;
      case 'teachers':
        return <TeachersView />;
      case 'subjects':
        return <SubjectsView />;
      
      // Student views
      case 'grades':
        return <GradesView />;
      
      // Teacher views
      case 'my-groups':
        return <TeacherGroupsView />;
      case 'grades-management':
        return <GradesManagementView />;
      
      // Common views
      case 'schedule':
        return user?.role === 'teacher' ? <TeacherScheduleView /> : <ScheduleView />;
      
      default:
        return user?.role === 'teacher' ? <TeacherScheduleView /> : <ScheduleView />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;