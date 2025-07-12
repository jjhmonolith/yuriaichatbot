"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Admin routes
const textbooks_1 = __importDefault(require("./admin/textbooks"));
const sets_1 = __importDefault(require("./admin/sets"));
const questions_1 = __importDefault(require("./admin/questions"));
const textbook_sets_1 = __importDefault(require("./admin/textbook-sets"));
const set_questions_1 = __importDefault(require("./admin/set-questions"));
const passage_sets_1 = __importDefault(require("./admin/passage-sets"));
const textbook_mappings_1 = __importDefault(require("./admin/textbook-mappings"));
const system_prompts_1 = __importDefault(require("./admin/system-prompts"));
const commentary_generator_1 = __importDefault(require("./admin/commentary-generator"));
// Chat routes
const chat_1 = __importDefault(require("./chat"));
const router = (0, express_1.Router)();
// API Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Edutech Backend Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Debug endpoint to check environment variables (임시)
router.get('/debug/env', (req, res) => {
    res.json({
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        envKeys: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('API'))
    });
});
// Admin routes - specific routes first
router.use('/admin/textbooks/:textbookId/sets', textbook_sets_1.default); // LEGACY
router.use('/admin/textbooks/:textbookId/mappings', textbook_mappings_1.default); // NEW
router.use('/admin/textbooks', textbooks_1.default);
router.use('/admin/sets', sets_1.default); // LEGACY
router.use('/admin/passage-sets', passage_sets_1.default); // NEW
router.use('/admin/questions', questions_1.default); // 더 구체적인 경로를 먼저
router.use('/admin/sets/:setId/questions', set_questions_1.default);
router.use('/admin/system-prompts', system_prompts_1.default);
router.use('/admin/commentary-generator', commentary_generator_1.default);
// Chat routes (for students)
router.use('/chat', chat_1.default);
// 404 handler
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});
exports.default = router;
