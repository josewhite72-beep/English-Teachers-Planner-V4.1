// Servicio para cargar datos estáticos (sin backend)
const API_BASE = import.meta.env.BASE_URL || '/';

class DataService {
  constructor() {
    this.cache = null;
  }

  async getMockData() {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch(`${API_BASE}data/mockData.json`);
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      this.cache = await response.json();
      return this.cache;
    } catch (error) {
      console.error('Error loading mock data:', error);
      return this.getFallbackData();
    }
  }

  getFallbackData() {
    return {
      lessons: [],
      students: [],
      resources: [],
      analytics: {
        totalStudents: 0,
        averageProgress: 0,
        completedLessons: 0,
        upcomingLessons: 0,
        attendanceRate: 0
      }
    };
  }

  async getLessons() {
    const data = await this.getMockData();
    const stored = localStorage.getItem('lessons');
    if (stored) {
      return JSON.parse(stored);
    }
    return data.lessons || [];
  }

  async getStudents() {
    const data = await this.getMockData();
    const stored = localStorage.getItem('students');
    if (stored) {
      return JSON.parse(stored);
    }
    return data.students || [];
  }

  async getResources() {
    const data = await this.getMockData();
    const stored = localStorage.getItem('resources');
    if (stored) {
      return JSON.parse(stored);
    }
    return data.resources || [];
  }

  async getAnalytics() {
    const data = await this.getMockData();
    return data.analytics || this.getFallbackData().analytics;
  }

  // CRUD para Lessons
  async saveLesson(lesson) {
    const lessons = await this.getLessons();
    const newLesson = { 
      ...lesson, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    lessons.push(newLesson);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    return newLesson;
  }

  async updateLesson(id, lesson) {
    const lessons = await this.getLessons();
    const index = lessons.findIndex(l => l.id === id);
    if (index !== -1) {
      lessons[index] = { 
        ...lessons[index], 
        ...lesson,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('lessons', JSON.stringify(lessons));
      return lessons[index];
    }
    return null;
  }

  async deleteLesson(id) {
    const lessons = await this.getLessons();
    const filtered = lessons.filter(l => l.id !== id);
    localStorage.setItem('lessons', JSON.stringify(filtered));
    return { success: true };
  }

  // CRUD para Students
  async saveStudent(student) {
    const students = await this.getStudents();
    const newStudent = { 
      ...student, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    return newStudent;
  }

  async updateStudent(id, student) {
    const students = await this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { 
        ...students[index], 
        ...student,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('students', JSON.stringify(students));
      return students[index];
    }
    return null;
  }

  async deleteStudent(id) {
    const students = await this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    localStorage.setItem('students', JSON.stringify(filtered));
    return { success: true };
  }

  // Resetear datos
  resetData() {
    localStorage.clear();
    this.cache = null;
  }
}

export default new DataService();
