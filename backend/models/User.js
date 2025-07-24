"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
// User model and database operations
const db_1 = __importDefault(require("../src/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    static async create(userData) {
        const { password, ...data } = userData;
        const password_hash = await bcrypt_1.default.hash(password, 10);
        const [user] = await (0, db_1.default)('users')
            .insert({ ...data, password_hash })
            .returning('*');
        delete user.password_hash;
        return user;
    }
    static async findById(id) {
        const user = await (0, db_1.default)('users')
            .where({ id })
            .first();
        if (user) {
            delete user.password_hash;
        }
        return user || null;
    }
    static async findByEmail(email) {
        return (0, db_1.default)('users')
            .where({ email })
            .first();
    }
    static async findByUsername(username) {
        return (0, db_1.default)('users')
            .where({ username })
            .first();
    }
    static async verifyPassword(user, password) {
        if (!user.password_hash)
            return false;
        return bcrypt_1.default.compare(password, user.password_hash);
    }
    static async update(id, data) {
        const [updatedUser] = await (0, db_1.default)('users')
            .where({ id })
            .update(data)
            .returning('*');
        delete updatedUser.password_hash;
        return updatedUser;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map