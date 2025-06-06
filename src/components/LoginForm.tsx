import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Неверные учетные данные');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@university.ru', role: 'Администратор', description: 'Полный доступ к системе' },
    { email: 'ivanov@student.ru', role: 'Студент ИС-21', description: 'Просмотр расписания и оценок' },
    { email: 'sidorov@student.ru', role: 'Студент ИС-22', description: 'Просмотр расписания и оценок' },
    { email: 'smirnov.teacher@university.ru', role: 'Преподаватель', description: 'Просмотр расписания, выставление оценок' },
    { email: 'volkova.teacher@university.ru', role: 'Преподаватель', description: 'Просмотр расписания, выставление оценок' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Система управления расписанием
          </h2>
          <p className="text-gray-600">Войдите в свою учетную запись</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите ваш email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите пароль"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <LogIn className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Вход...' : 'Войти в систему'}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Демо-аккаунты</h3>
          <div className="space-y-3">
            {demoAccounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setEmail(account.email);
                  setPassword('password');
                }}
              >
                <div>
                  <p className="font-medium text-gray-900">{account.email}</p>
                  <p className="text-sm text-gray-600">{account.role}</p>
                  <p className="text-xs text-gray-500">{account.description}</p>
                </div>
                <div className="text-xs text-blue-600 font-medium">Нажмите для входа</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Пароль для всех демо-аккаунтов: <span className="font-mono bg-gray-100 px-2 py-1 rounded">password</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;