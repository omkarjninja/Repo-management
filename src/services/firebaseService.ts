import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  DocumentReference,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
  UploadResult
} from 'firebase/storage';

import { db, storage } from '../lib/firebase';
import { Project, ProjectData, ProjectFile } from '../types/project';

// Collection name
const PROJECTS_COLLECTION = 'projects';

export interface FileUploadResult {
  downloadURL: string;
  fileName: string;
}

// Upload file to Firebase Storage


// Delete file from Firebase Storage


// Add new project
export const addProject = async (projectData: ProjectData): Promise<string> => {
  try {
    const docRef: DocumentReference<DocumentData> = await addDoc(
      collection(db, PROJECTS_COLLECTION),
      {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

// Update project
export const updateProject = async (
  projectId: string,
  projectData: Partial<ProjectData>
): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Real-time listener for projects
export const subscribeToProjects = (callback: (projects: Project[]) => void): Unsubscribe => {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const projects: Project[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
    callback(projects);
  });
};