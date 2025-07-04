export interface User {
  id: string;
  email: string;
  password: string;
  role: 'Admin' | 'Patient';
  patientId?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  email: string;
  healthInfo: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Incident {
  id: string;
  patientId: string;
  title: string;
  description: string;
  comments: string;
  appointmentDate: string;
  cost?: number;
  treatment?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  nextAppointmentDate?: string;
  files: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  users: User[];
  patients: Patient[];
  incidents: Incident[];
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  patientName: string;
  status: string;
}