export interface Project {
    id?: number;
    name: string;
    description?: string;
    color?: string;
    user_id: number;
    is_archived?: boolean;
    position?: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare class ProjectModel {
    static create(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>;
    static findById(id: number): Promise<Project | null>;
    static findByUserId(userId: number, includeArchived?: boolean): Promise<Project[]>;
    static update(id: number, data: Partial<Project>): Promise<Project>;
    static delete(id: number): Promise<void>;
    static verifyOwnership(projectId: number, userId: number): Promise<boolean>;
}
//# sourceMappingURL=Project.d.ts.map