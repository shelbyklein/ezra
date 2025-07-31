"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
// Task model and database operations
const db_1 = __importDefault(require("../src/db"));
class TaskModel {
    static async create(taskData) {
        // Convert labels array to JSON string
        const dataToInsert = {
            ...taskData,
            labels: taskData.labels ? JSON.stringify(taskData.labels) : null
        };
        const [task] = await (0, db_1.default)('tasks')
            .insert(dataToInsert)
            .returning('*');
        // Parse labels back to array
        if (task.labels) {
            task.labels = JSON.parse(task.labels);
        }
        return task;
    }
    static async findById(id) {
        const task = await (0, db_1.default)('tasks')
            .where({ id })
            .first();
        if (task && task.labels) {
            task.labels = JSON.parse(task.labels);
        }
        return task || null;
    }
    static async findByProjectId(projectId) {
        const tasks = await (0, db_1.default)('tasks')
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
    static async update(id, data) {
        const dataToUpdate = { ...data };
        if (dataToUpdate.labels) {
            dataToUpdate.labels = JSON.stringify(dataToUpdate.labels);
        }
        const [updatedTask] = await (0, db_1.default)('tasks')
            .where({ id })
            .update(dataToUpdate)
            .returning('*');
        if (updatedTask.labels) {
            updatedTask.labels = JSON.parse(updatedTask.labels);
        }
        return updatedTask;
    }
    static async delete(id) {
        await (0, db_1.default)('tasks')
            .where({ id })
            .delete();
    }
    static async updatePositions(updates) {
        await db_1.default.transaction(async (trx) => {
            for (const update of updates) {
                await trx('tasks')
                    .where({ id: update.id })
                    .update({ position: update.position, status: update.status });
            }
        });
    }
}
exports.TaskModel = TaskModel;
//# sourceMappingURL=Task.js.map