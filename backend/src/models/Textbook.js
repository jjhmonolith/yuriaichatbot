"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const textbookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [100, 'Title cannot exceed 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxLength: [50, 'Subject cannot exceed 50 characters']
    },
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['초등', '중등', '고등'],
        default: '고등'
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be after 2000'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    versionKey: false
});
// Indexes
textbookSchema.index({ title: 1, year: 1 });
textbookSchema.index({ subject: 1, level: 1 });
exports.default = mongoose_1.default.model('Textbook', textbookSchema);
