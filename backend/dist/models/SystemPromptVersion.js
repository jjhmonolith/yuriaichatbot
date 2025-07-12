"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPromptVersion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const systemPromptVersionSchema = new mongoose_1.default.Schema({
    promptKey: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: String,
        trim: true,
        default: 'admin'
    }
}, {
    timestamps: true
});
// 인덱스 설정
systemPromptVersionSchema.index({ promptKey: 1, version: -1 }); // 최신 버전순 정렬
systemPromptVersionSchema.index({ promptKey: 1, createdAt: -1 }); // 생성일순 정렬
// promptKey + version 조합은 유니크해야 함
systemPromptVersionSchema.index({ promptKey: 1, version: 1 }, { unique: true });
exports.SystemPromptVersion = mongoose_1.default.model('SystemPromptVersion', systemPromptVersionSchema);
