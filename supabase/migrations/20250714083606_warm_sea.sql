/*
  # Project Repository Database Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, project name)
      - `description` (text, project description)
      - `student_name` (text, name of student)
      - `department` (text, department name)
      - `guide` (text, project guide name)
      - `domain` (text, project domain)
      - `passout_year` (text, year of pass out)
      - `file_name` (text, uploaded file name)
      - `file_size` (bigint, file size in bytes)
      - `file_type` (text, file MIME type)
      - `file_url` (text, file storage URL)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
    
    - `departments` (optional normalization table)
      - `id` (serial, primary key)
      - `name` (text, department name)
      - `created_at` (timestamptz)
    
    - `domains` (optional normalization table)
      - `id` (serial, primary key)
      - `name` (text, domain name)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all projects (public read access)
      - Create their own projects
      - Update their own projects
      - Delete their own projects
    - Add policies for departments and domains (public read access)

  3. Performance
    - Add indexes for frequently queried columns
    - Add foreign key constraints where appropriate

  4. Sample Data
    - Insert common departments and domains
    - Insert sample projects for demonstration
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    student_name text NOT NULL,
    department text NOT NULL,
    guide text NOT NULL,
    domain text NOT NULL,
    passout_year text NOT NULL,
    file_name text,
    file_size bigint,
    file_type text,
    file_url text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create departments table (optional for normalization)
CREATE TABLE IF NOT EXISTS departments (
    id serial PRIMARY KEY,
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create domains table (optional for normalization)
CREATE TABLE IF NOT EXISTS domains (
    id serial PRIMARY KEY,
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_student_name ON projects(student_name);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department);
CREATE INDEX IF NOT EXISTS idx_projects_passout_year ON projects(passout_year);
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for projects table

-- Policy: Anyone can read all projects (public read access)
CREATE POLICY "Anyone can read projects"
    ON projects
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy: Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
    ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update own projects"
    ON projects
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete own projects"
    ON projects
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for departments table

-- Policy: Anyone can read departments
CREATE POLICY "Anyone can read departments"
    ON departments
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy: Only authenticated users can insert departments
CREATE POLICY "Authenticated users can insert departments"
    ON departments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for domains table

-- Policy: Anyone can read domains
CREATE POLICY "Anyone can read domains"
    ON domains
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy: Only authenticated users can insert domains
CREATE POLICY "Authenticated users can insert domains"
    ON domains
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Insert sample departments
INSERT INTO departments (name) VALUES 
    ('Computer Science'),
    ('Information Technology'),
    ('Electronics and Communication'),
    ('Mechanical Engineering'),
    ('Civil Engineering'),
    ('Electrical Engineering'),
    ('Biomedical Engineering'),
    ('Chemical Engineering'),
    ('Aerospace Engineering'),
    ('Chemical Engineering'),
    ('Industrial Engineering'),
    ('Software Engineering')
ON CONFLICT (name) DO NOTHING;

-- Insert sample domains
INSERT INTO domains (name) VALUES 
    ('Machine Learning'),
    ('Web Development'),
    ('Mobile Development'),
    ('Internet of Things'),
    ('Artificial Intelligence'),
    ('Data Science'),
    ('Cybersecurity'),
    ('Blockchain'),
    ('Cloud Computing'),
    ('Renewable Energy'),
    ('Robotics'),
    ('Computer Vision'),
    ('Natural Language Processing'),
    ('DevOps'),
    ('Game Development'),
    ('Augmented Reality'),
    ('Virtual Reality'),
    ('Big Data'),
    ('Network Security'),
    ('Database Management')
ON CONFLICT (name) DO NOTHING;

-- Insert sample projects (these will need actual user_id values when users are created)
-- Note: In a real application, these would be inserted by actual users through the application
-- For demonstration purposes, you can replace the user_id with actual user UUIDs after user registration

-- Create a view for easier project querying with additional metadata
CREATE OR REPLACE VIEW projects_with_metadata AS
SELECT 
    p.*,
    CASE 
        WHEN p.created_at >= (CURRENT_DATE - INTERVAL '7 days') THEN true 
        ELSE false 
    END as is_recent,
    CASE 
        WHEN p.file_name IS NOT NULL THEN true 
        ELSE false 
    END as has_file,
    EXTRACT(YEAR FROM p.created_at) as created_year
FROM projects p;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON projects TO authenticated;
GRANT SELECT ON projects TO anon;
GRANT ALL ON departments TO authenticated;
GRANT SELECT ON departments TO anon;
GRANT ALL ON domains TO authenticated;
GRANT SELECT ON domains TO anon;
GRANT SELECT ON projects_with_metadata TO authenticated, anon;