"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration for production and development
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.CORS_ORIGIN, process.env.FRONTEND_URL].filter((url) => Boolean(url))
        : true, // 개발 환경에서는 모든 origin 허용
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// API Routes
app.use('/api', routes_1.default);
// MongoDB connection
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('MongoDB URI not found. Please set MONGODB_URI in .env file');
            return;
        }
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Don't exit in development, just continue without DB
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
});
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
});
startServer();
exports.default = app;
