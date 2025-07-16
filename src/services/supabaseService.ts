// supabaseService.ts
import { supabase } from '../lib/supabaseClient';

export interface FileUploadResult {
  downloadURL: string;
  fileName: string;
}

export const uploadFile = async (file: File, fileName: string): Promise<FileUploadResult> => {
  const filePath = `project-files/${fileName}`;

  const { data, error } = await supabase.storage
    .from('project-files') // <-- bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('project-files').getPublicUrl(fileName);

  return {
    downloadURL: publicUrl,
    fileName
  };
};


// Delete file from Supabase Storage
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('project-files')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw error;
  }
};
