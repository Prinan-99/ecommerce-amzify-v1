import express from 'express';
import * as chatbotController from '../controllers/chatbotController.js';

const router = express.Router();

// Note: Authentication middleware will be added when integrating with main server
// For now, these routes are public for testing

// Chat endpoint
router.post('/chat', chatbotController.chat);

// Get suggested questions
router.get('/suggestions', chatbotController.getSuggestedQuestions);

// Clear conversation
router.delete('/conversation', chatbotController.clearConversation);

export default router;
