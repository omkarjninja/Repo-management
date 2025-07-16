import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface HeaderProps {
  onAddProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddProject }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ProjectHub</h1>
              <p className="text-xs text-gray-500">Repository Management System</p>
            </div>
          </div>
          
          <button
            onClick={onAddProject}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};