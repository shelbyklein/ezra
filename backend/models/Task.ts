// Task model and database operations
import db from '../src/db';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  project_id: number;
  position?: number;
  due_date?: Date;
  labels?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  ai_enhanced?: boolean;
  ai_suggestions?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class TaskModel {
  static async create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    // Convert labels array to JSON string
    const dataToInsert = {
      ...taskData,
      labels: taskData.labels ? JSON.stringify(taskData.labels) : null
    };
    
    const [task] = await db('tasks')
      .insert(dataToInsert)
      .returning('*');
    
    // Parse labels back to array
    if (task.labels) {
      task.labels = JSON.parse(task.labels);
    }
    
    return task;
  }

  static async findById(id: number): Promise<Task | null> {
    const task = await db('tasks')
      .where({ id })
      .first();
    
    if (task && task.labels) {
      task.labels = JSON.parse(task.labels);
    }
    
    return task || null;
  }

  static async findByProjectId(projectId: number): Promise<Task[]> {
    const tasks = await db('tasks')
      .where({ project_id: projectId })
      .orderBy('status', 'asc')
      .orderBy('position', 'asc');
    
    return tasks.map(task => {
      if (task.labels) {
        task.labels = JSON.parse(task.labels);
      }
      return task;
    });
  }

  static async update(id: number, data: Partial<Task>): Promise<Task> {
    const dataToUpdate = { ...data };
    
    if (dataToUpdate.labels) {
      dataToUpdate.labels = JSON.stringify(dataToUpdate.labels) as any;
    }
    
    const [updatedTask] = await db('tasks')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
    
    if (updatedTask.labels) {
      updatedTask.labels = JSON.parse(updatedTask.labels);
    }
    
    return updatedTask;
  }

  static async delete(id: number): Promise<void> {
    await db('tasks')
      .where({ id })
      .delete();
  }

  static async updatePositions(updates: { id: number; position: number; status: string }[]): Promise<void> {
    await db.transaction(async (trx) => {
      for (const update of updates) {
        await trx('tasks')
          .where({ id: update.id })
          .update({ position: update.position, status: update.status });
      }
    });
  }
}