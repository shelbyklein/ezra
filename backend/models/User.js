"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
// User model and database operations
const db_1 = __importDefault(require("../src/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
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
    static async getAllUsers() {
        const users = await (0, db_1.default)('users')
            .select('*')
            .orderBy('created_at', 'desc');
        return users.map(user => {
            delete user.password_hash;
            delete user.api_key;
            return user;
        });
    }
    static async generateResetToken(email) {
        const user = await this.findByEmail(email);
        if (!user)
            return null;
        // Generate a secure random token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await (0, db_1.default)('users')
            .where({ id: user.id })
            .update({
            reset_token: hashedToken,
            reset_token_expires: expiresAt
        });
        return resetToken;
    }
    static async resetPasswordWithToken(token, newPassword) {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await (0, db_1.default)('users')
            .where('reset_token', hashedToken)
            .where('reset_token_expires', '>', new Date())
            .first();
        if (!user)
            return false;
        const password_hash = await bcrypt_1.default.hash(newPassword, 10);
        await (0, db_1.default)('users')
            .where({ id: user.id })
            .update({
            password_hash,
            reset_token: null,
            reset_token_expires: null
        });
        return true;
    }
}
exports.UserModel = UserModel;
