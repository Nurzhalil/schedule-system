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
  async getSchedule(filters: { groupId?: number; teacherId?: number; date?: string } = {}) {
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

  // Grades
  async getStudentGrades(studentId: number) {
    return this.request(`/grades/student/${studentId}`);
  }

  async getStudentGradesBySubject(studentId: number, subjectId: number) {
    return this.request(`/grades/student/${studentId}/subject/${subjectId}`);
  }

  async getStudentGradeAverages(studentId: number) {
    return this.request(`/grades/student/${studentId}/averages`);
  }

  async addGrade(grade: any) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  }

  // Data
  async getGroups() {
    return this.request('/data/groups');
  }

  async getTeachers() {
    return this.request('/data/teachers');
  }

  async getSubjects() {
    return this.request('/data/subjects');
  }

  async getRooms() {
    return this.request('/data/rooms');
  }

  async getStudentsByGroup(groupId: number) {
    return this.request(`/data/students/group/${groupId}`);
  }

  async getTeacherSubjects(teacherId: number) {
    return this.request(`/data/teacher/${teacherId}/subjects`);
  }
}

export const apiService = new ApiService();