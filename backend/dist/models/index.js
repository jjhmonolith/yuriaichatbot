"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextbookPassageMapping = exports.Question = exports.PassageSet = exports.Textbook = void 0;
// Export all models
var Textbook_1 = require("./Textbook");
Object.defineProperty(exports, "Textbook", { enumerable: true, get: function () { return __importDefault(Textbook_1).default; } });
var PassageSet_1 = require("./PassageSet");
Object.defineProperty(exports, "PassageSet", { enumerable: true, get: function () { return __importDefault(PassageSet_1).default; } });
var Question_1 = require("./Question");
Object.defineProperty(exports, "Question", { enumerable: true, get: function () { return __importDefault(Question_1).default; } });
var TextbookPassageMapping_1 = require("./TextbookPassageMapping");
Object.defineProperty(exports, "TextbookPassageMapping", { enumerable: true, get: function () { return TextbookPassageMapping_1.TextbookPassageMapping; } });
