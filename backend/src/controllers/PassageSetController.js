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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassageSetController = void 0;
const models_1 = require("../models");
const QRService_1 = require("../services/QRService");
class PassageSetController {
    // 모든 지문세트 목록 조회
    static getAllPassageSets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const skip = (page - 1) * limit;
                const { search } = req.query;
                // 검색 필터 구성
                const filter = {};
                if (search) {
                    filter.$or = [
                        { title: { $regex: search, $options: 'i' } },
                        { passage: { $regex: search, $options: 'i' } }
                    ];
                }
                const passageSets = yield models_1.PassageSet.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield models_1.PassageSet.countDocuments(filter);
                // 각 지문세트가 사용되는 교재 수 추가
                const passageSetsWithStats = yield Promise.all(passageSets.map((set) => __awaiter(this, void 0, void 0, function* () {
                    const textbookCount = yield models_1.TextbookPassageMapping.countDocuments({
                        passageSetId: set._id
                    });
                    return Object.assign(Object.assign({}, set.toObject()), { textbookCount });
                })));
                res.json({
                    success: true,
                    data: {
                        passageSets: passageSetsWithStats,
                        pagination: {
                            current: page,
                            total: Math.ceil(total / limit),
                            count: passageSets.length,
                            totalItems: total
                        }
                    }
                });
            }
            catch (error) {
                console.error('Get all passage sets error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch passage sets',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 지문세트 상세 조회
    static getPassageSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const passageSet = yield models_1.PassageSet.findById(id);
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                // 이 지문세트를 사용하는 교재들 조회
                const mappings = yield models_1.TextbookPassageMapping.find({ passageSetId: id })
                    .populate('textbookId', 'title subject level');
                const textbooks = mappings.map(mapping => (Object.assign(Object.assign({}, mapping.textbookId.toObject()), { order: mapping.order, mappingId: mapping._id })));
                res.json({
                    success: true,
                    data: Object.assign(Object.assign({}, passageSet.toObject()), { textbooks })
                });
            }
            catch (error) {
                console.error('Get passage set error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch passage set',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 지문세트 생성
    static createPassageSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // QR 코드 생성 (교재와 독립적)
                const qrCode = QRService_1.QRService.generateQRCode();
                const qrCodeUrl = QRService_1.QRService.generateQRCodeUrl(qrCode);
                const passageSetData = Object.assign(Object.assign({}, req.body), { qrCode,
                    qrCodeUrl });
                const passageSet = new models_1.PassageSet(passageSetData);
                yield passageSet.save();
                res.status(201).json({
                    success: true,
                    data: passageSet,
                    message: 'Passage set created successfully'
                });
            }
            catch (error) {
                console.error('Create passage set error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to create passage set',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 지문세트 수정
    static updatePassageSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const passageSet = yield models_1.PassageSet.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                res.json({
                    success: true,
                    data: passageSet,
                    message: 'Passage set updated successfully'
                });
            }
            catch (error) {
                console.error('Update passage set error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to update passage set',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 지문세트 삭제
    static deletePassageSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // 지문세트를 사용하는 교재가 있는지 확인
                const mappingCount = yield models_1.TextbookPassageMapping.countDocuments({ passageSetId: id });
                if (mappingCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot delete passage set. It is used in ${mappingCount} textbook(s). Please remove it from all textbooks first.`
                    });
                }
                const passageSet = yield models_1.PassageSet.findByIdAndDelete(id);
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                res.json({
                    success: true,
                    message: 'Passage set deleted successfully'
                });
            }
            catch (error) {
                console.error('Delete passage set error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete passage set',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // QR 코드로 지문세트 조회 (학생용)
    static getPassageSetByQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { qrCode } = req.params;
                if (!QRService_1.QRService.validateQRCode(qrCode)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid QR code format'
                    });
                }
                const passageSet = yield models_1.PassageSet.findOne({ qrCode });
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                res.json({
                    success: true,
                    data: passageSet
                });
            }
            catch (error) {
                console.error('Get passage set by QR error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch passage set',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // QR 코드 재생성
    static regenerateQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const passageSet = yield models_1.PassageSet.findById(id);
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                const newQrCode = QRService_1.QRService.generateQRCode();
                const newQrCodeUrl = QRService_1.QRService.generateQRCodeUrl(newQrCode);
                const updatedPassageSet = yield models_1.PassageSet.findByIdAndUpdate(id, {
                    qrCode: newQrCode,
                    qrCodeUrl: newQrCodeUrl
                }, { new: true });
                res.json({
                    success: true,
                    data: updatedPassageSet,
                    message: 'QR code regenerated successfully'
                });
            }
            catch (error) {
                console.error('Regenerate QR code error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to regenerate QR code',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // QR 코드 이미지 다운로드
    static getQRCodeImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const passageSet = yield models_1.PassageSet.findById(id);
                if (!passageSet) {
                    return res.status(404).json({
                        success: false,
                        message: 'Passage set not found'
                    });
                }
                const qrCodeBuffer = yield QRService_1.QRService.generateQRCodeBuffer(passageSet.qrCode);
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Disposition', `attachment; filename="qr-${passageSet.title.replace(/[^a-zA-Z0-9]/g, '-')}.png"`);
                res.send(qrCodeBuffer);
            }
            catch (error) {
                console.error('Get QR code image error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to generate QR code image',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // LEGACY: 교재별 지문세트 조회 (하위 호환성)
    static getPassageSetsByTextbook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { textbookId } = req.params;
                const mappings = yield models_1.TextbookPassageMapping.find({ textbookId })
                    .populate('passageSetId')
                    .sort({ order: 1 });
                const passageSets = mappings.map(mapping => (Object.assign(Object.assign({}, mapping.passageSetId.toObject()), { order: mapping.order, mappingId: mapping._id })));
                res.json({
                    success: true,
                    data: {
                        sets: passageSets,
                        pagination: {
                            current: 1,
                            total: 1,
                            count: passageSets.length,
                            totalItems: passageSets.length
                        }
                    }
                });
            }
            catch (error) {
                console.error('Get passage sets by textbook error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch passage sets',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.PassageSetController = PassageSetController;
