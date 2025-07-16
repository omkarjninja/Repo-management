import React from 'react';
import { Calendar, User, Building, Tag, Trash2, Download, Edit, GraduationCap, Clock } from 'lucide-react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onEdit }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (project.file) {
      const url = URL.createObjectURL(project.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = project.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(project)}
            className="text-gray-400 hover:text-blue-500 transition-all duration-200 p-1 rounded-md hover:bg-blue-50"
            title="Edit project"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-gray-400 hover:text-red-500 transition-all duration-200 p-1 rounded-md hover:bg-red-50"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {project.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <GraduationCap className="w-4 h-4" />
          <span>{project.studentName}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Pass Out: {project.passoutYear}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Building className="w-4 h-4" />
          <span>{project.department}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span>{project.guide}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Tag className="w-4 h-4" />
          <span>{project.domain}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>
      
      {project.file && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="truncate">{project.file.name}</span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
              title={`Download ${project.file.name}`}
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(project.file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}
    </div>
  );
};