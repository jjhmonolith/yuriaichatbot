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
exports.TextbookPassageMapping = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TextbookPassageMappingSchema = new mongoose_1.Schema({
    textbookId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Textbook',
        required: true,
        index: true
    },
    passageSetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PassageSet',
        required: true,
        index: true
    },
    order: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true,
    collection: 'textbook_passage_mappings'
});
// 복합 인덱스: 같은 교재에서 같은 지문세트 중복 방지
TextbookPassageMappingSchema.index({ textbookId: 1, passageSetId: 1 }, { unique: true });
// 교재별 순서 관리를 위한 인덱스
TextbookPassageMappingSchema.index({ textbookId: 1, order: 1 }, { unique: true });
exports.TextbookPassageMapping = mongoose_1.default.model('TextbookPassageMapping', TextbookPassageMappingSchema);
