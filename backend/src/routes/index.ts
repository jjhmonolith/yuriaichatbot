import { Router } from 'express';

// Admin routes
import textbooksRouter from './admin/textbooks';
import setsRouter from './admin/sets';
import questionsRouter from './admin/questions';
import textbookSetsRouter from './admin/textbook-sets';
import setQuestionsRouter from './admin/set-questions';
import passageSetsRouter from './admin/passage-sets';
import textbookMappingsRouter from './admin/textbook-mappings';

// Chat routes
import chatRouter from './chat';

const router = Router();

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
    envKeys: Object.keys(process.env).filter(key => 
      key.includes('OPENAI') || key.includes('API')
    )
  });
});


// Admin routes - specific routes first
router.use('/admin/textbooks/:textbookId/sets', textbookSetsRouter); // LEGACY
router.use('/admin/textbooks/:textbookId/mappings', textbookMappingsRouter); // NEW
router.use('/admin/textbooks', textbooksRouter);
router.use('/admin/sets', setsRouter); // LEGACY
router.use('/admin/passage-sets', passageSetsRouter); // NEW
router.use('/admin/sets/:setId/questions', setQuestionsRouter);
router.use('/admin/questions', questionsRouter);

// Chat routes (for students)
router.use('/chat', chatRouter);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

export default router;