export interface Draw {
  id: string;
  date: string; // YYYY-MM-DD
  slot: '12:00' | '14:00' | '17:00';
  drawNo: string;
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  digit5: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsPost {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}