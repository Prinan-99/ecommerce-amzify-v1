import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key', // Free tier available
});

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  customer: `You are a helpful customer support assistant for Amzify, an e-commerce marketplace. 
You help customers with:
- Product inquiries and recommendations
- Order tracking and status
- Account management questions
- Payment and shipping information
- Returns and refunds policy
- General shopping assistance

Be friendly, concise, and helpful. If you don't know something, suggest contacting customer support.`,
  
  seller: `You are a helpful assistant for Amzify sellers. 
You help with:
- Product listing guidelines
- Inventory management
- Order fulfillment process
- Pricing strategies
- Seller policies and fees
- Performance metrics
- Marketing tips

Be professional and provide actionable advice for growing their business on Amzify.`,
  
  admin: `You are an administrative assistant for Amzify platform admins.
You help with:
- Platform analytics and metrics
- User management
- Seller applications review
- System health monitoring
- Policy enforcement
- Technical troubleshooting

Provide clear, technical information to help admins manage the platform effectively.`
};

// Chat with the AI
export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], userType = 'customer', userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Select appropriate system prompt based on user type
    const systemPrompt = SYSTEM_PROMPTS[userType] || SYSTEM_PROMPTS.customer;

    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Groq API (Free & Fast!)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Free Llama 3.3 model
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      message: aiResponse,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process your message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get suggested questions based on user type
export const getSuggestedQuestions = async (req, res) => {
  try {
    const { userType = 'customer' } = req.query;

    const suggestions = {
      customer: [
        "How do I track my order?",
        "What's your return policy?",
        "How can I contact customer support?",
        "Do you offer international shipping?",
        "How do I apply a discount code?"
      ],
      seller: [
        "How do I list a new product?",
        "What are the seller fees?",
        "How do I manage my inventory?",
        "What's the order fulfillment process?",
        "How can I improve my seller rating?"
      ],
      admin: [
        "How do I review seller applications?",
        "What are the key platform metrics?",
        "How do I manage user accounts?",
        "What's the process for handling disputes?",
        "How do I monitor system health?"
      ]
    };

    res.json({
      success: true,
      suggestions: suggestions[userType] || suggestions.customer
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
};

// Clear conversation (optional endpoint for future use)
export const clearConversation = async (req, res) => {
  try {
    // This could be extended to store conversations in DB
    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation'
    });
  }
};
