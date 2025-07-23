// Project type definitions
export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  userId: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectRequest {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  color?: string
  isArchived?: boolean
}