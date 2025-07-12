"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPrompt = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const systemPromptSchema = new mongoose_1.default.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});
// 인덱스 설정
systemPromptSchema.index({ key: 1 });
systemPromptSchema.index({ isActive: 1 });
exports.SystemPrompt = mongoose_1.default.model('SystemPrompt', systemPromptSchema);
