import { useState, useCallback } from 'react';
import { Project, ProjectFormData } from '../types/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Smart Home Automation System',
      description: 'IoT-based home automation system with voice control and mobile app integration for controlling lights, temperature, and security systems.',
      studentName: 'Alex Johnson',
      department: 'Computer Science',
      guide: 'Dr. Sarah Johnson',
      domain: 'Internet of Things',
      passoutYear: '2024',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Machine Learning for Healthcare',
      description: 'Predictive analytics system for early disease detection using machine learning algorithms and patient data analysis.',
      studentName: 'Maria Garcia',
      department: 'Biomedical Engineering',
      guide: 'Prof. Michael Chen',
      domain: 'Artificial Intelligence',
      passoutYear: '2025',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Sustainable Energy Management',
      description: 'Smart grid system for optimizing renewable energy distribution and consumption in urban environments.',
      studentName: 'David Kim',
      department: 'Electrical Engineering',
      guide: 'Dr. Emma Rodriguez',
      domain: 'Renewable Energy',
      passoutYear: '2024',
      createdAt: new Date('2024-01-05')
    }
  ]);

  const addProject = useCallback((projectData: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date()
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, []);

  const updateProject = useCallback((id: string, projectData: ProjectFormData) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...projectData }
        : project
    ));
  }, []);
  return {
    projects,
    addProject,
    deleteProject,
    updateProject
  };
};