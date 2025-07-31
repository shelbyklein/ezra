"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
// Project model and database operations
const db_1 = __importDefault(require("../src/db"));
class ProjectModel {
    static async create(projectData) {
        const [project] = await (0, db_1.default)('projects')
            .insert(projectData)
            .returning('*');
        return project;
    }
    static async findById(id) {
        const project = await (0, db_1.default)('projects')
            .where({ id })
            .first();
        return project || null;
    }
    static async findByUserId(userId, includeArchived = false) {
        let query = (0, db_1.default)('projects').where({ user_id: userId });
        if (!includeArchived) {
            query = query.where({ is_archived: false });
        }
        return query.orderBy('position', 'asc');
    }
    static async update(id, data) {
        const [updatedProject] = await (0, db_1.default)('projects')
            .where({ id })
            .update(data)
            .returning('*');
        return updatedProject;
    }
    static async delete(id) {
        await (0, db_1.default)('projects')
            .where({ id })
            .delete();
    }
    static async verifyOwnership(projectId, userId) {
        const project = await (0, db_1.default)('projects')
            .where({ id: projectId, user_id: userId })
            .first();
        return !!project;
    }
}
exports.ProjectModel = ProjectModel;
//# sourceMappingURL=Project.js.map