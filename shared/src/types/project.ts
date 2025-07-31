// Project type definitions
export interface Project {
  id: string
  title: string
  description?: string
  color?: string
  userId: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectRequest {
  title: string
  description?: string
  color?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  color?: string
  isArchived?: boolean
}