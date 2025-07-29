const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Conversation history storage
const conversationHistory = new Map();

// Session management
let sessionCounter = 0;

// Function to optimize conversation history for API calls
function optimizeConversationHistory(history) {
    if (history.length <= 20) {
        return history; // Keep all messages if conversation is short
    }
    
    // For longer conversations, use smart truncation
    const firstMessages = history.slice(0, 2); // Keep initial context
    const recentMessages = history.slice(-18); // Keep recent context
    return [...firstMessages, ...recentMessages];
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Generate or use existing session ID
        const currentSessionId = sessionId || `session_${++sessionCounter}`;
        
        // Get or create conversation history for this session
        if (!conversationHistory.has(currentSessionId)) {
            conversationHistory.set(currentSessionId, []);
        }
        
        const history = conversationHistory.get(currentSessionId);
        
        // Add user message to history
        history.push({
            role: "user",
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Optimize conversation history for API call
        const messagesToSend = optimizeConversationHistory(history);
        
        // Prepare messages for OpenAI (system + history + current message)
        const messages = [
            {
                role: "system",
                content: `You are Sunny AI, a bright, cheerful, and intelligent assistant with memory capabilities. You have a warm personality and always try to be helpful and engaging. 

IMPORTANT: You remember previous conversations and can reference them to provide more contextual and personalized responses. If the user asks about something mentioned earlier in the conversation, refer back to it naturally.

Your capabilities include:
- Remembering user preferences and past topics
- Providing contextual responses based on conversation history
- Maintaining a cheerful and enthusiastic tone
- Using emojis and expressions when appropriate
- Offering helpful suggestions and insights
- Adapting your responses based on the conversation flow

Keep your responses conversational, friendly, and informative. Show that you remember what the user has told you by referencing previous parts of the conversation when relevant.`
            },
            ...messagesToSend
        ];
        
        // Call OpenAI API with conversation history
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 800,
            temperature: 0.8,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
        });
        
        const response = completion.choices[0].message.content;
        
        // Add AI response to history
        history.push({
            role: "assistant",
            content: response,
            timestamp: new Date().toISOString()
        });
        
        // Update conversation history
        conversationHistory.set(currentSessionId, history);
        
        // Log conversation for debugging
        console.log(`Session ${currentSessionId}: ${history.length} messages (sent ${messages.length} to API)`);
        
        res.json({ 
            response,
            sessionId: currentSessionId,
            messageCount: history.length,
            contextSize: messages.length
        });
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Handle token limit errors specifically
        if (error.message && error.message.includes('token')) {
            console.log('Token limit reached, trying with shorter context...');
            
            try {
                // Try again with only the last 10 messages
                const shortHistory = history.slice(-10);
                const shortMessages = [
                    {
                        role: "system",
                        content: "You are Sunny AI, a bright and helpful assistant. Keep responses concise and friendly."
                    },
                    ...shortHistory
                ];
                
                const retryCompletion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: shortMessages,
                    max_tokens: 600,
                    temperature: 0.8,
                });
                
                const response = retryCompletion.choices[0].message.content;
                
                // Add AI response to history
                history.push({
                    role: "assistant",
                    content: response,
                    timestamp: new Date().toISOString()
                });
                
                conversationHistory.set(currentSessionId, history);
                
                res.json({ 
                    response,
                    sessionId: currentSessionId,
                    messageCount: history.length,
                    contextSize: shortMessages.length,
                    note: "Used shortened context due to length"
                });
                return;
                
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
            }
        }
        
        if (error.code === 'insufficient_quota') {
            res.status(500).json({ 
                error: 'API quota exceeded. Please check your OpenAI account.' 
            });
        } else if (error.code === 'invalid_api_key') {
            res.status(500).json({ 
                error: 'Invalid API key. Please check your OpenAI API key.' 
            });
        } else {
            res.status(500).json({ 
                error: 'An error occurred while processing your request.' 
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        activeSessions: conversationHistory.size,
        totalMessages: Array.from(conversationHistory.values()).reduce((sum, history) => sum + history.length, 0)
    });
});

// Get conversation history for a session
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!conversationHistory.has(sessionId)) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    const history = conversationHistory.get(sessionId);
    res.json({ 
        sessionId,
        messages: history,
        messageCount: history.length
    });
});

// Clear conversation history for a session
app.delete('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (conversationHistory.has(sessionId)) {
        conversationHistory.delete(sessionId);
        res.json({ message: 'Conversation cleared successfully' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Get all active sessions
app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(conversationHistory.keys()).map(sessionId => ({
        sessionId,
        messageCount: conversationHistory.get(sessionId).length,
        lastActivity: conversationHistory.get(sessionId)[conversationHistory.get(sessionId).length - 1]?.timestamp
    }));
    
    res.json({ sessions });
});

// Get conversation analytics
app.get('/api/analytics', (req, res) => {
    const totalSessions = conversationHistory.size;
    const totalMessages = Array.from(conversationHistory.values()).reduce((sum, history) => sum + history.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;
    
    // Get most active session
    let mostActiveSession = null;
    let maxMessages = 0;
    
    for (const [sessionId, history] of conversationHistory.entries()) {
        if (history.length > maxMessages) {
            maxMessages = history.length;
            mostActiveSession = sessionId;
        }
    }
    
    res.json({
        totalSessions,
        totalMessages,
        averageMessagesPerSession,
        mostActiveSession: mostActiveSession ? {
            sessionId: mostActiveSession,
            messageCount: maxMessages
        } : null,
        serverUptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Chatbot server running on http://localhost:${port}`);
    console.log(`📝 Make sure to set your OPENAI_API_KEY in the .env file`);
}); 