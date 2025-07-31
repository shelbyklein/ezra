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
export declare class TaskModel {
    static create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task>;
    static findById(id: number): Promise<Task | null>;
    static findByProjectId(projectId: number): Promise<Task[]>;
    static update(id: number, data: Partial<Task>): Promise<Task>;
    static delete(id: number): Promise<void>;
    static updatePositions(updates: {
        id: number;
        position: number;
        status: string;
    }[]): Promise<void>;
}
//# sourceMappingURL=Task.d.ts.map