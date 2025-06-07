const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Schedule
  async getSchedule(filters: { groupId?: number; teacherId?: number; date?: string; subjectId?: number } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/schedule${query}`);
  }

  async addScheduleEntry(entry: any) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateScheduleEntry(id: number, entry: any) {
    return this.request(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteScheduleEntry(id: number) {
    return this.request(`/schedule/${id}`, {
      method: 'DELETE',
    });
  }

  // Grades
  async getStudentGrades(studentId: number) {
    return this.request(`/grades/student/${studentId}`);
  }

  async getStudentGradeAverages(studentId: number) {
    return this.request(`/grades/student/${studentId}/averages`);
  }

  async getTeacherGrades(teacherId: number) {
    return this.request(`/grades/teacher/${teacherId}`);
  }

  async addGrade(grade: any) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  }

  async updateGrade(id: number, grade: any) {
    return this.request(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grade),
    });
  }

  async deleteGrade(id: number) {
    return this.request(`/grades/${id}`, {
      method: 'DELETE',
    });
  }

  // Data
  async getGroups() {
    return this.request('/data/groups');
  }

  async addGroup(group: any) {
    return this.request('/data/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  }

  async updateGroup(id: number, group: any) {
    return this.request(`/data/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(group),
    });
  }

  async deleteGroup(id: number) {
    return this.request(`/data/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async getTeachers() {
    return this.request('/data/teachers');
  }

  async addTeacher(teacher: any) {
    return this.request('/data/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
  }

  async updateTeacher(id: number, teacher: any) {
    return this.request(`/data/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
  }

  async deleteTeacher(id: number) {
    return this.request(`/data/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async getSubjects() {
    return this.request('/data/subjects');
  }

  async addSubject(subject: any) {
    return this.request('/data/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  }

  async updateSubject(id: number, subject: any) {
    return this.request(`/data/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
  }

  async deleteSubject(id: number) {
    return this.request(`/data/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  async getRooms() {
    return this.request('/data/rooms');
  }

  async addRoom(room: any) {
    return this.request('/data/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  }

  async updateRoom(id: number, room: any) {
    return this.request(`/data/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
  }

  async deleteRoom(id: number) {
    return this.request(`/data/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentsByGroup(groupId: number) {
    return this.request(`/data/students/group/${groupId}`);
  }

  async getTeacherSubjects(teacherId: number) {
    return this.request(`/data/teacher/${teacherId}/subjects`);
  }
}

export const apiService = new ApiService();