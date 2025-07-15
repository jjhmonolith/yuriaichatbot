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
exports.BackgroundJobService = void 0;
const models_1 = require("../models");
const AIService_1 = require("./AIService");
class BackgroundJobService {
    // 해설 생성 작업을 큐에 추가
    static addExplanationJob(job) {
        const explanationJob = Object.assign(Object.assign({}, job), { retryCount: 0, createdAt: new Date() });
        this.jobQueue.push(explanationJob);
        console.log(`Added explanation job for question ${job.questionId}. Queue size: ${this.jobQueue.length}`);
        // 처리 시작
        this.processQueue();
    }
    // 큐 처리 시작
    static processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isProcessing || this.jobQueue.length === 0) {
                return;
            }
            this.isProcessing = true;
            console.log(`Starting queue processing. Queue size: ${this.jobQueue.length}`);
            try {
                // 배치 단위로 처리
                while (this.jobQueue.length > 0) {
                    const batch = this.jobQueue.splice(0, this.BATCH_SIZE);
                    yield this.processBatch(batch);
                }
            }
            catch (error) {
                console.error('Error processing queue:', error);
            }
            finally {
                this.isProcessing = false;
                console.log('Queue processing completed');
            }
        });
    }
    // 배치 처리
    static processBatch(batch) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing batch of ${batch.length} jobs`);
            const promises = batch.map(job => this.processJob(job));
            const results = yield Promise.allSettled(promises);
            // 실패한 작업 재시도 처리
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const job = batch[index];
                    console.error(`Job failed for question ${job.questionId}:`, result.reason);
                    this.handleJobFailure(job);
                }
            });
        });
    }
    // 개별 작업 처리
    static processJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Processing explanation job for question ${job.questionId}`);
                // 문제 상태를 'generating'으로 업데이트
                yield models_1.Question.findByIdAndUpdate(job.questionId, {
                    explanationStatus: 'generating'
                });
                // AI 해설 생성
                const explanation = yield AIService_1.AIService.generateQuestionExplanation({
                    passageContent: job.passageContent,
                    passageComment: job.passageComment,
                    questionText: job.questionText,
                    options: job.options,
                    correctAnswer: job.correctAnswer,
                    subject: '국어',
                    level: '고등학교'
                });
                // 생성된 해설로 업데이트
                yield models_1.Question.findByIdAndUpdate(job.questionId, {
                    explanation: explanation,
                    explanationStatus: 'completed',
                    explanationGeneratedAt: new Date(),
                    explanationError: undefined
                });
                console.log(`Successfully generated explanation for question ${job.questionId}`);
            }
            catch (error) {
                console.error(`Error processing job for question ${job.questionId}:`, error);
                // 문제 상태를 'failed'로 업데이트
                yield models_1.Question.findByIdAndUpdate(job.questionId, {
                    explanationStatus: 'failed',
                    explanationError: error instanceof Error ? error.message : 'Unknown error'
                });
                throw error;
            }
        });
    }
    // 작업 실패 처리
    static handleJobFailure(job) {
        if (job.retryCount < this.MAX_RETRIES) {
            // 재시도 횟수 증가
            job.retryCount++;
            // 지연 후 재시도
            setTimeout(() => {
                console.log(`Retrying job for question ${job.questionId} (attempt ${job.retryCount})`);
                this.jobQueue.push(job);
                this.processQueue();
            }, this.RETRY_DELAY * job.retryCount); // 지수 백오프
        }
        else {
            console.error(`Job failed permanently for question ${job.questionId} after ${this.MAX_RETRIES} retries`);
        }
    }
    // 큐 상태 조회
    static getQueueStatus() {
        return {
            queueSize: this.jobQueue.length,
            isProcessing: this.isProcessing,
            oldestJob: this.jobQueue.length > 0 ? this.jobQueue[0].createdAt : null
        };
    }
    // 특정 문제의 해설 생성 상태 조회
    static getExplanationStatus(questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield models_1.Question.findById(questionId, 'explanationStatus explanationGeneratedAt explanationError');
                return question ? {
                    status: question.explanationStatus,
                    generatedAt: question.explanationGeneratedAt,
                    error: question.explanationError
                } : null;
            }
            catch (error) {
                console.error('Error getting explanation status:', error);
                return null;
            }
        });
    }
    // 큐 정리 (테스트 및 디버깅용)
    static clearQueue() {
        this.jobQueue = [];
        console.log('Queue cleared');
    }
}
exports.BackgroundJobService = BackgroundJobService;
BackgroundJobService.jobQueue = [];
BackgroundJobService.isProcessing = false;
BackgroundJobService.MAX_RETRIES = 3;
BackgroundJobService.RETRY_DELAY = 5000; // 5초
BackgroundJobService.BATCH_SIZE = 3; // 동시 처리 개수
