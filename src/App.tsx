import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Download, FileText } from 'lucide-react';
import { AddProjectModal } from './components/AddProjectModal';
import { subscribeToProjects, deleteProject } from './services/firebaseService';
import { deleteFile } from './services/supabaseService';


// Using the Project interface from AddProjectModal to ensure compatibility
interface ProjectFile {
  name: string;
  size: number;
  downloadURL: string;
  fileName: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: ProjectFile | null;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToProjects((projectsData) => {
      setProjects(projectsData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddProject = (data: Project) => {
    console.log('Project added:', data);
    // The real-time subscription will automatically update the projects list
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project.id);
        if (project.file) {
          await deleteFile(project.file.fileName);
        }
        console.log('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDownloadFile = (file: any) => {
    window.open(file.downloadURL, '_blank');
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = filterDomain === '' || project.domain.toLowerCase().includes(filterDomain.toLowerCase());
    const matchesYear = filterYear === '' || project.passoutYear === filterYear;
    
    return matchesSearch && matchesDomain && matchesYear;
  });

  const uniqueDomains = [...new Set(projects.map(p => p.domain))];
  const uniqueYears = [...new Set(projects.map(p => p.passoutYear))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Repository</h1>
          <p className="text-gray-600">Manage and explore student projects</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects, students, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Domains</option>
                {uniqueDomains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Get started by adding your first project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Student:</span>
                      <span className="ml-2">{project.studentName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Department:</span>
                      <span className="ml-2">{project.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Guide:</span>
                      <span className="ml-2">{project.guide}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Domain:</span>
                      <span className="ml-2">{project.domain}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Pass Out Year:</span>
                      <span className="ml-2">{project.passoutYear}</span>
                    </div>
                  </div>
                  
                  {project.file && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">{project.file.name}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(project.file)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.file.size ? `${(project.file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <AddProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddProject}
          editingProject={editingProject}
        />
      </div>
    </div>
  );
};
export default App;