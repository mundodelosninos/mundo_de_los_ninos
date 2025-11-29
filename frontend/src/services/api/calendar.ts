import axios from 'axios';
import { CalendarEvent, EventType, EventStatus } from '@/types/calendar';
import { API_CONFIG } from '@/config/api';

const api = axios.create({
  baseURL: API_CONFIG.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface CreateEventDTO {
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  location?: string;
  groupIds?: string[];
  studentIds?: string[];
  attendeeIds?: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  type?: EventType;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  groupIds?: string[];
  studentIds?: string[];
  attendeeIds?: string[];
}

export interface EventParticipantDTO {
  participantId: string;
  participantType: 'user' | 'student' | 'group';
}

export const calendarApi = {
  async createEvent(eventData: CreateEventDTO) {
    const response = await api.post<CalendarEvent>('/calendar/events', eventData);
    return response.data;
  },

  async getEvents(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<CalendarEvent[]>(`/calendar/events?${params.toString()}`);
    return response.data;
  },

  async getEventById(id: string) {
    const response = await api.get<CalendarEvent>(`/calendar/events/${id}`);
    return response.data;
  },

  async updateEvent(id: string, eventData: UpdateEventDTO) {
    const response = await api.patch<CalendarEvent>(`/calendar/events/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id: string) {
    await api.delete(`/calendar/events/${id}`);
  },

  async addParticipant(eventId: string, participant: EventParticipantDTO) {
    await api.post(`/calendar/events/${eventId}/participants`, participant);
  },

  async removeParticipant(
    eventId: string,
    participantId: string,
    participantType: 'user' | 'student' | 'group'
  ) {
    await api.delete(`/calendar/events/${eventId}/participants/${participantId}/${participantType}`);
  },

  async updateParticipantStatus(
    eventId: string,
    participantId: string,
    status: 'invited' | 'accepted' | 'declined'
  ) {
    await api.patch(`/calendar/events/${eventId}/participants/${participantId}/status`, { status });
  },
};
