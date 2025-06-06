import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Subject, ScheduleView, Grade } from '../types';

interface GroupInfo {
  id: number;
  name: string;
  students: any[];
}

const TeacherGroupsView: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleView[]>([]);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.teacherId) {
      fetchData();
    }
  }, [user?.teacherId]);

  const fetchData = async () => {
    try {
      // Fetch teacher's subjects
      const subjectsData = await apiService.getTeacherSubjects(user!.teacherId!);
      setSubjects(subjectsData);

      // Fetch teacher's schedule
      const scheduleData = await apiService.getSchedule({ teacherId: user!.teacherId });
      setSchedule(scheduleData);

      // Get unique groups from schedule
      const uniqueGroups = Array.from(
        new Set(scheduleData.map(s => s.groupId))
      ).map(groupId => {
        const scheduleEntry = scheduleData.find(s => s.groupId === groupId);
        return {
          id: groupId,
          name: scheduleEntry?.groupName || '',
          students: []
        };
      });

      // Fetch students for each group
      const groupsWithStudents = await Promise.all(
        uniqueGroups.map(async (group) => {
          try {
            const students = await apiService.getStudentsByGroup(group.id);
            return { ...group, students };
          } catch (error) {
            console.error(`Error fetching students for group ${group.id}:`, error);
            return group;
          }
        })
      );

      setGroups(groupsWithStudents);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsForGroup = (groupId: number) => {
    const groupSchedule = schedule.filter(s => s.groupId === groupId);
    const subjectIds = Array.from(new Set(groupSchedule.map(s => s.subjectId)));
    return subjects.filter(subject => subjectIds.includes(subject.id));
  };

  const getScheduleForGroup = (groupId: number) => {
    return schedule.filter(s => s.groupId === groupId);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Мои группы</h2>
            <p className="text-gray-600">Группы, в которых вы ведете занятия</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
              <div className="text-sm text-gray-500">Групп</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{subjects.length}</div>
              <div className="text-sm text-gray-500">Предметов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map(group => {
          const groupSubjects = getSubjectsForGroup(group.id);
          const groupSchedule = getScheduleForGroup(group.id);
          
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.students.length} студентов</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  {selectedGroup === group.id ? 'Скрыть' : 'Подробнее'}
                </button>
              </div>

              {/* Group Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{groupSubjects.length}</p>
                      <p className="text-sm text-gray-600">Предметов</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{groupSchedule.length}</p>
                      <p className="text-sm text-gray-600">Занятий</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects taught in this group */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ваши предметы в группе:</h4>
                <div className="flex flex-wrap gap-2">
                  {groupSubjects.map(subject => (
                    <span
                      key={subject.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded view */}
              {selectedGroup === group.id && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Студенты группы:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {group.students.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{student.name}</span>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Быстрые действия</h3>
              <p className="text-gray-600">Управление группами и оценками</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Добавить оценку
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Сводка по предметам</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const subjectGroups = groups.filter(group => 
              getSubjectsForGroup(group.id).some(s => s.id === subject.id)
            );
            
            return (
              <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{subject.name}</h4>
                <div className="text-sm text-gray-600">
                  <p>Групп: {subjectGroups.length}</p>
                  <p>Студентов: {subjectGroups.reduce((sum, group) => sum + group.students.length, 0)}</p>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {subjectGroups.map(group => (
                      <span
                        key={group.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {group.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherGroupsView;