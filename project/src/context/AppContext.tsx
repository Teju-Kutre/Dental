import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Patient, Incident, FileAttachment } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncident: (id: string, incident: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  uploadFile: (incidentId: string, file: File) => Promise<void>;
  removeFile: (incidentId: string, fileId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: { id: string; patient: Partial<Patient> } }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: { id: string; incident: Partial<Incident> } }
  | { type: 'DELETE_INCIDENT'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  users: [
    { id: '1', role: 'Admin', email: 'admin@entnt.in', password: 'admin123' },
    { id: '2', role: 'Patient', email: 'john@entnt.in', password: 'patient123', patientId: 'p1' },
    { id: '3', role: 'Patient', email: 'jane@entnt.in', password: 'patient123', patientId: 'p2' }
  ],
  patients: [
    {
      id: 'p1',
      name: 'John Doe',
      dob: '1990-05-10',
      contact: '1234567890',
      email: 'john@entnt.in',
      healthInfo: 'No known allergies',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'p2',
      name: 'Jane Smith',
      dob: '1985-08-22',
      contact: '9876543210',
      email: 'jane@entnt.in',
      healthInfo: 'Allergic to latex',
      createdAt: '2024-02-20T14:30:00Z'
    }
  ],
  incidents: [
    {
      id: 'i1',
      patientId: 'p1',
      title: 'Routine Cleaning',
      description: 'Regular dental cleaning and checkup',
      comments: 'Good oral health, no issues found',
      appointmentDate: '2024-12-25T10:00:00Z',
      cost: 120,
      treatment: 'Professional cleaning and fluoride treatment',
      status: 'Completed',
      nextAppointmentDate: '2025-06-25T10:00:00Z',
      files: [],
      createdAt: '2024-12-20T09:00:00Z',
      updatedAt: '2024-12-25T11:00:00Z'
    },
    {
      id: 'i2',
      patientId: 'p2',
      title: 'Tooth Filling',
      description: 'Cavity filling on upper right molar',
      comments: 'Small cavity, routine filling procedure',
      appointmentDate: '2024-12-28T14:00:00Z',
      status: 'Scheduled',
      files: [],
      createdAt: '2024-12-22T16:00:00Z',
      updatedAt: '2024-12-22T16:00:00Z'
    },
    {
      id: 'i3',
      patientId: 'p1',
      title: 'Follow-up Consultation',
      description: 'Follow-up after root canal treatment',
      comments: 'Check healing progress',
      appointmentDate: '2025-01-15T09:00:00Z',
      status: 'Scheduled',
      files: [],
      createdAt: '2024-12-23T08:00:00Z',
      updatedAt: '2024-12-23T08:00:00Z'
    }
  ],
  currentUser: null,
  isAuthenticated: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload.patient } : p
        )
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
        incidents: state.incidents.filter(i => i.patientId !== action.payload)
      };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [...state.incidents, action.payload] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(i => 
          i.id === action.payload.id ? { ...i, ...action.payload.incident, updatedAt: new Date().toISOString() } : i
        )
      };
    case 'DELETE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload)
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: savedData });
    }
  }, []);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const login = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: 'p' + Date.now(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
  };

  const updatePatient = (id: string, patient: Partial<Patient>) => {
    dispatch({ type: 'UPDATE_PATIENT', payload: { id, patient } });
  };

  const deletePatient = (id: string) => {
    dispatch({ type: 'DELETE_PATIENT', payload: id });
  };

  const addIncident = (incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: 'i' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
  };

  const updateIncident = (id: string, incident: Partial<Incident>) => {
    dispatch({ type: 'UPDATE_INCIDENT', payload: { id, incident } });
  };

  const deleteIncident = (id: string) => {
    dispatch({ type: 'DELETE_INCIDENT', payload: id });
  };

  const uploadFile = async (incidentId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileAttachment = {
          id: 'f' + Date.now(),
          name: file.name,
          url: reader.result as string,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };

        const incident = state.incidents.find(i => i.id === incidentId);
        if (incident) {
          const updatedIncident = {
            ...incident,
            files: [...incident.files, newFile]
          };
          dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, incident: updatedIncident } });
          resolve();
        } else {
          reject(new Error('Incident not found'));
        }
      };
      reader.onerror = () => reject(new Error('File upload failed'));
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (incidentId: string, fileId: string) => {
    const incident = state.incidents.find(i => i.id === incidentId);
    if (incident) {
      const updatedIncident = {
        ...incident,
        files: incident.files.filter(f => f.id !== fileId)
      };
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, incident: updatedIncident } });
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      addPatient,
      updatePatient,
      deletePatient,
      addIncident,
      updateIncident,
      deleteIncident,
      uploadFile,
      removeFile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}