import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import { addProject, updateProject } from '../services/firebaseService';
import { uploadFile, deleteFile } from '../services/supabaseService';


// Local interfaces (move these to types/project.ts if preferred)
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

interface ProjectFormData {
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: File;
}

interface ProjectData {
  name: string;
  description: string;
  studentName: string;
  department: string;
  guide: string;
  domain: string;
  passoutYear: string;
  file?: ProjectFile | null;
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Project) => void;
  editingProject?: Project | null;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProject
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    studentName: '',
    department: '',
    guide: '',
    domain: '',
    passoutYear: '',
    file: undefined
  });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        description: editingProject.description,
        studentName: editingProject.studentName,
        department: editingProject.department,
        guide: editingProject.guide,
        domain: editingProject.domain,
        passoutYear: editingProject.passoutYear,
        file: undefined // Don't populate file for editing
      });
    } else {
      setFormData({
        name: '',
        description: '',
        studentName: '',
        department: '',
        guide: '',
        domain: '',
        passoutYear: '',
        file: undefined
      });
    }
    setErrors({});
  }, [editingProject, isOpen]);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.guide.trim()) newErrors.guide = 'Project guide is required';
    if (!formData.domain.trim()) newErrors.domain = 'Domain is required';
    if (!formData.passoutYear.trim()) newErrors.passoutYear = 'Pass out year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let fileData: ProjectFile | null = editingProject?.file || null;
      
      // Handle file upload if there's a new file
      if (formData.file) {
        setUploadProgress(25);
        const timestamp = Date.now();
        const fileName = `${timestamp}_${formData.file.name}`;
        const uploadResult = await uploadFile(formData.file, fileName);
        fileData = {
          name: formData.file.name,
          size: formData.file.size,
          downloadURL: uploadResult.downloadURL,
          fileName: uploadResult.fileName
        };
        setUploadProgress(50);
      }

      // Prepare project data
      const projectData: ProjectData = {
        name: formData.name,
        description: formData.description,
        studentName: formData.studentName,
        department: formData.department,
        guide: formData.guide,
        domain: formData.domain,
        passoutYear: formData.passoutYear,
        file: fileData
      };

      setUploadProgress(75);

      if (editingProject) {
        // Update existing project
        await updateProject(editingProject.id, projectData);
        
        // If there was an old file and we're uploading a new one, delete the old file
        if (editingProject.file && formData.file && editingProject.file.fileName !== fileData?.fileName) {
          await deleteFile(editingProject.file.fileName);
        }
        
        const updatedProject: Project = {
          ...projectData,
          id: editingProject.id,
          createdAt: editingProject.createdAt,
          updatedAt: new Date()
        };
        onSubmit(updatedProject);
      } else {
        // Add new project
        const projectId = await addProject(projectData);
        const newProject: Project = {
          ...projectData,
          id: projectId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        onSubmit(newProject);
      }

      setUploadProgress(100);
      
      // Reset form if not editing
      if (!editingProject) {
        setFormData({
          name: '',
          description: '',
          studentName: '',
          department: '',
          guide: '',
          domain: '',
          passoutYear: '',
          file: undefined
        });
        setErrors({});
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors({ name: 'Failed to submit project. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your project..."
              />
              {errors.description && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name of Student *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.studentName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student name"
              />
              {errors.studentName && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.studentName}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Pass Out *
              </label>
              <select
                value={formData.passoutYear}
                onChange={(e) => handleInputChange('passoutYear', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.passoutYear ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select pass out year</option>
                {Array.from({ length: 51 }, (_, i) => 2000 + i).map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.passoutYear && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.passoutYear}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Computer Science"
                />
                {errors.department && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.department}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Guide Name *
                </label>
                <input
                  type="text"
                  value={formData.guide}
                  onChange={(e) => handleInputChange('guide', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.guide ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Dr. John Smith"
                />
                {errors.guide && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.guide}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name *
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.domain ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Machine Learning, Web Development"
              />
              {errors.domain && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.domain}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Project File (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                />
                
                {formData.file ? (
                  <div className="flex items-center justify-center space-x-2">
                    <File className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, ZIP, RAR up to 10MB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>
              {errors.file && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {"faced soem error while uploading file, please try again"}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editingProject ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>{editingProject ? 'Update Project' : 'Submit Project'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};