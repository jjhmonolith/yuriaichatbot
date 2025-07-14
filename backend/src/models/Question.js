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
const questionSchema = new mongoose_1.Schema({
    setId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PassageSet',
        required: [true, 'Set ID is required']
    },
    questionNumber: {
        type: Number,
        required: [true, 'Question number is required'],
        min: [1, 'Question number must be positive']
    },
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxLength: [1000, 'Question text cannot exceed 1000 characters']
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function (options) {
                return options.length >= 2 && options.length <= 5;
            },
            message: 'Options must have between 2 and 5 choices'
        }
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        trim: true,
        validate: {
            validator: function (answer) {
                return this.options.includes(answer);
            },
            message: 'Correct answer must be one of the options'
        }
    },
    explanation: {
        type: String,
        required: [true, 'Explanation is required'],
        trim: true,
        maxLength: [2000, 'Explanation cannot exceed 2000 characters']
    }
}, {
    timestamps: true,
    versionKey: false
});
// Indexes
questionSchema.index({ setId: 1, questionNumber: 1 }, { unique: true });
questionSchema.index({ questionText: 'text', explanation: 'text' }); // Text search
exports.default = mongoose_1.default.model('Question', questionSchema);
