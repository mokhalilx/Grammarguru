export enum UserRole {
  STUDENT = 'Student',
  TEACHER = 'Teacher',
}

export interface UserProfile {
  role: UserRole;
  age: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 or URL
  audio?: string; // Base64 audio data
}

export enum ImageSize {
  _1K = '1K',
  _2K = '2K',
  _4K = '4K',
}

export interface ImageSettings {
  size: ImageSize;
}
