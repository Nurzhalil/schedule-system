import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ScheduleView as ScheduleViewType, Subject } from '../types';

const TeacherScheduleView: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleViewType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.teacherId) {
      fetchSchedule();
      fetchSubjects();
    }
  }, [user?.teacherId, selectedSubject]);

  const fetchSchedule = async () => {
    try {
      const filters: any = {};
      if (user?.teacherId) {
        filters.teacherId = user.teacherId;
      }
      if (selectedSubject) {
        filters.subjectId = selectedSubject;
      }

      const data = await apiService.getSchedule(filters);
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      if (user?.teacherId) {
        const data = await apiService.getTeacherSubjects(user.teacherId);
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const filteredSchedule = schedule.filter(entry => {
    if (viewMode === 'day') {
      return isSameDay(new Date(entry.date), selectedDate);
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    }
    return true;
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : 7;
    setSelectedDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getScheduleForDate = (date: Date) => {
    return filteredSchedule.filter(entry => isSameDay(new Date(entry.date), date));
  };

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Мое расписание</h2>
            <p className="text-gray-600 mt-1">Расписание занятий преподавателя</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все предметы</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                День
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Неделя
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[200px] text-center">
                <span className="font-medium text-gray-900">
                  {viewMode === 'day'
                    ? format(selectedDate, 'd MMMM yyyy', { locale: ru })
                    : `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'd MMM', { locale: ru })} - ${format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), 'd MMM yyyy', { locale: ru })}`
                  }
                </span>
              </div>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {viewMode === 'day' ? (
        <DayView schedule={filteredSchedule} date={selectedDate} />
      ) : (
        <WeekView 
          weekDays={getWeekDays()} 
          getScheduleForDate={getScheduleForDate}
        />
      )}

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
            <p className="text-gray-600">
              Всего занятий: <span className="font-semibold">{schedule.length}</span> • 
              Предметов: <span className="font-semibold">{subjects.length}</span> • 
              Групп: <span className="font-semibold">
                {Array.from(new Set(schedule.map(s => s.groupName))).length}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DayView: React.FC<{ schedule: ScheduleViewType[], date: Date }> = ({ schedule, date }) => {
  const daySchedule = schedule.filter(entry => isSameDay(new Date(entry.date), date));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {format(date, 'EEEE, d MMMM yyyy', { locale: ru })}
      </h3>
      
      {daySchedule.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>На этот день занятий не запланировано</p>
        </div>
      ) : (
        <div className="space-y-4">
          {daySchedule.map(entry => (
            <ScheduleCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

const WeekView: React.FC<{ 
  weekDays: Date[], 
  getScheduleForDate: (date: Date) => ScheduleViewType[]
}> = ({ weekDays, getScheduleForDate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {weekDays.map(day => {
        const daySchedule = getScheduleForDate(day);
        return (
          <div key={day.toISOString()} className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              <div className="text-sm text-gray-500">
                {format(day, 'EEEE', { locale: ru })}
              </div>
              <div className="text-lg">
                {format(day, 'd MMM', { locale: ru })}
              </div>
            </h3>
            
            {daySchedule.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Нет занятий
              </div>
            ) : (
              <div className="space-y-2">
                {daySchedule.map(entry => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="font-medium text-gray-900 mb-1">
                      {entry.subjectName}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {entry.timeStart} - {entry.timeEnd}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Ауд. {entry.roomName}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {entry.groupName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ScheduleCard: React.FC<{ entry: ScheduleViewType }> = ({ entry }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {entry.subjectName}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              {entry.timeStart} - {entry.timeEnd}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
              Аудитория {entry.roomName}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-indigo-500" />
              Группа {entry.groupName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherScheduleView;