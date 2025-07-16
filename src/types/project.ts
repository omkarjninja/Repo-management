// types/project.ts
import { Timestamp } from 'firebase/firestore';

export interface ProjectFile {
  name: string;
  size: number;
  downloadURL: string;
  fileName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: ProjectFile | null;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface ProjectFormData {
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: File;
}

export interface ProjectData {
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: ProjectFile | null;
}