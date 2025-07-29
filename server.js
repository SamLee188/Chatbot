const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Use environment PORT for deployment

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://127.0.0.1:8080',
    'https://chatbot-one-pi-15.vercel.app',
    'https://*.vercel.app',
    'https://*.netlify.app',
    'https://*.herokuapp.com',
    'https://*.railway.app',
    'https://*.render.com'
  ], // Allow frontend connections from various domains
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory conversation storage (in production, use a database)
const conversationSessions = new Map();

// Enhanced system prompt for more intelligent responses
const SYSTEM_PROMPT = `You are an intelligent, helpful, and friendly AI assistant with the following capabilities:

1. **Context Awareness**: Remember previous conversations and refer back to them when relevant
2. **Personality**: Be warm, engaging, and conversational while remaining professional
3. **Memory**: Use conversation history to provide more personalized and contextual responses
4. **Knowledge**: Provide accurate, helpful information across various topics
5. **Adaptability**: Adjust your communication style based on the user's tone and needs
6. **Proactivity**: Ask follow-up questions when appropriate to better understand user needs
7. **Clarity**: Explain complex concepts in simple terms when needed
8. **Empathy**: Show understanding and emotional intelligence in your responses

Guidelines:
- Keep responses concise but informative (150-300 words max)
- Use the conversation history to provide contextually relevant responses
- Ask clarifying questions when user intent is unclear
- Provide actionable advice when appropriate
- Use examples and analogies to illustrate points
- Maintain a consistent, helpful personality throughout the conversation

Remember: You have access to the full conversation history, so use it to provide more intelligent and contextual responses.`;

// Chat endpoint with conversation memory
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create or retrieve session
    let session = conversationSessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        startTime: new Date().toISOString(),
        messages: [],
        context: {},
        userPreferences: {}
      };
      conversationSessions.set(sessionId, session);
    }

    // Add user message to session history
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Build conversation context for AI
    const conversationContext = buildConversationContext(session, conversationHistory);

    // Create messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...conversationContext
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1, // Encourage new topics
      frequency_penalty: 0.1, // Reduce repetition
    });

    const botResponse = completion.choices[0].message.content;

    // Add bot response to session history
    session.messages.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString()
    });

    // Update session context based on conversation
    updateSessionContext(session, message, botResponse);

    // Keep only last 20 messages to manage memory
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }

    res.json({ 
      response: botResponse,
      sessionId: sessionId,
      context: session.context,
      messageCount: session.messages.length
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from OpenAI',
      details: error.message 
    });
  }
});

// Build conversation context from history
function buildConversationContext(session, frontendHistory) {
  const context = [];
  
  // Add recent messages from session (last 10)
  const recentMessages = session.messages.slice(-10);
  context.push(...recentMessages);

  // Add relevant context from frontend history if available
  if (frontendHistory && frontendHistory.messages) {
    const relevantMessages = frontendHistory.messages
      .filter(msg => msg.sender === 'user' && !recentMessages.some(sm => sm.content === msg.content))
      .slice(-5); // Last 5 unique user messages

    relevantMessages.forEach(msg => {
      context.push({
        role: 'user',
        content: msg.content,
        timestamp: msg.timestamp
      });
    });
  }

  return context;
}

// Update session context based on conversation
function updateSessionContext(session, userMessage, botResponse) {
  // Extract user preferences and topics
  const topics = extractTopics(userMessage);
  const preferences = extractPreferences(userMessage);
  
  // Update context
  session.context = {
    ...session.context,
    topics: [...(session.context.topics || []), ...topics].slice(-10), // Keep last 10 topics
    preferences: { ...session.context.preferences, ...preferences },
    lastInteraction: new Date().toISOString(),
    conversationTone: analyzeTone(userMessage)
  };
}

// Extract topics from message
function extractTopics(message) {
  const topics = [];
  const lowerMessage = message.toLowerCase();
  
  // Simple topic extraction (in production, use NLP libraries)
  if (lowerMessage.includes('weather')) topics.push('weather');
  if (lowerMessage.includes('music')) topics.push('music');
  if (lowerMessage.includes('food') || lowerMessage.includes('cook')) topics.push('food');
  if (lowerMessage.includes('travel') || lowerMessage.includes('trip')) topics.push('travel');
  if (lowerMessage.includes('work') || lowerMessage.includes('job')) topics.push('work');
  if (lowerMessage.includes('health') || lowerMessage.includes('exercise')) topics.push('health');
  if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) topics.push('technology');
  if (lowerMessage.includes('education') || lowerMessage.includes('learn')) topics.push('education');
  
  return topics;
}

// Extract user preferences
function extractPreferences(message) {
  const preferences = {};
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('i like') || lowerMessage.includes('i love')) {
    preferences.likes = message.match(/i (like|love) (.+)/i)?.[2] || 'general topics';
  }
  
  if (lowerMessage.includes('i don\'t like') || lowerMessage.includes('i hate')) {
    preferences.dislikes = message.match(/i don't like (.+)/i)?.[1] || 'certain topics';
  }
  
  return preferences;
}

// Analyze conversation tone
function analyzeTone(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('!') || lowerMessage.includes('excited')) return 'excited';
  if (lowerMessage.includes('?') && lowerMessage.length < 20) return 'curious';
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) return 'grateful';
  if (lowerMessage.includes('sorry') || lowerMessage.includes('apologize')) return 'apologetic';
  if (lowerMessage.includes('help') || lowerMessage.includes('need')) return 'needing_help';
  
  return 'neutral';
}

// Get conversation history endpoint
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = conversationSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.id,
    startTime: session.startTime,
    messages: session.messages,
    context: session.context,
    messageCount: session.messages.length
  });
});

// Get conversation analytics
app.get('/api/analytics/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = conversationSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const analytics = {
    sessionId: session.id,
    totalMessages: session.messages.length,
    userMessages: session.messages.filter(m => m.role === 'user').length,
    botMessages: session.messages.filter(m => m.role === 'assistant').length,
    sessionDuration: Date.now() - new Date(session.startTime).getTime(),
    topics: session.context.topics || [],
    preferences: session.context.preferences || {},
    conversationTone: session.context.conversationTone || 'neutral',
    lastActivity: session.context.lastInteraction
  };
  
  res.json(analytics);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Intelligent chatbot backend server is running',
    activeSessions: conversationSessions.size,
    serverType: 'backend',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint for backend info
app.get('/', (req, res) => {
  res.json({
    message: 'Intelligent Chatbot Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health',
      conversation: 'GET /api/conversation/:sessionId',
      analytics: 'GET /api/analytics/:sessionId'
    },
    deployment: 'Backend is ready for production deployment'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for production domains`);
}); 