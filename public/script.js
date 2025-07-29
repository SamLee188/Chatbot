class Chatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.status = document.getElementById('status');
        
        this.isTyping = false;
        this.messageCount = 0;
        
        // Initialize conversation history dictionary with enhanced structure
        this.conversationHistory = {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            messages: [],
            metadata: {
                totalMessages: 0,
                userMessages: 0,
                botMessages: 0,
                lastActivity: null,
                topics: [],
                preferences: {},
                conversationTone: 'neutral'
            },
            context: {
                sessionDuration: 0,
                averageResponseTime: 0,
                conversationFlow: [],
                userEngagement: 'medium'
            }
        };
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.messageInput.addEventListener('input', () => this.handleInput());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });

        // Add action button listeners
        this.addActionListeners();

        // Auto-focus on input
        this.messageInput.focus();
        
        // Check server status
        this.checkServerStatus();
        
        // Add initial bot message to history
        this.addToHistory('bot', 'Hello! I\'m your intelligent AI assistant. I can remember our conversations and provide more contextual responses. How can I help you today?');
    }

    addActionListeners() {
        // Clear chat button
        const clearBtn = document.querySelector('.action-btn[title="Clear Chat"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }

        // Settings button
        const settingsBtn = document.querySelector('.action-btn[title="Settings"]');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Export history button
        const exportBtn = document.querySelector('.action-btn[title="Export History"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportHistory());
        }

        // Input action buttons
        const attachBtn = document.querySelector('.input-action-btn[title="Attach File"]');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
        }

        const emojiBtn = document.querySelector('.input-action-btn[title="Emoji"]');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        }
    }

    addToHistory(sender, message, responseTime = null) {
        const messageData = {
            id: this.generateMessageId(),
            sender: sender,
            content: message,
            timestamp: new Date().toISOString(),
            displayTime: this.getCurrentTime(),
            responseTime: responseTime,
            messageNumber: this.conversationHistory.metadata.totalMessages + 1,
            context: {
                topics: this.extractTopics(message),
                tone: this.analyzeTone(message),
                intent: this.analyzeIntent(message)
            }
        };

        this.conversationHistory.messages.push(messageData);
        this.conversationHistory.metadata.totalMessages++;
        this.conversationHistory.metadata.lastActivity = new Date().toISOString();

        if (sender === 'user') {
            this.conversationHistory.metadata.userMessages++;
            // Update topics and preferences
            this.updateUserProfile(message);
        } else {
            this.conversationHistory.metadata.botMessages++;
        }

        // Update context
        this.updateConversationContext();

        // Log to console for debugging
        console.log('Message added to history:', messageData);
        console.log('Enhanced conversation history:', this.conversationHistory);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();
        
        const topicKeywords = {
            'technology': ['tech', 'computer', 'software', 'programming', 'code'],
            'health': ['health', 'exercise', 'fitness', 'workout', 'diet'],
            'travel': ['travel', 'trip', 'vacation', 'destination', 'flight'],
            'food': ['food', 'cook', 'recipe', 'restaurant', 'cuisine'],
            'music': ['music', 'song', 'artist', 'concert', 'playlist'],
            'work': ['work', 'job', 'career', 'office', 'business'],
            'education': ['learn', 'study', 'school', 'university', 'course'],
            'weather': ['weather', 'climate', 'temperature', 'forecast']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
            }
        }

        return topics;
    }

    analyzeTone(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('!') || lowerMessage.includes('excited')) return 'excited';
        if (lowerMessage.includes('?') && lowerMessage.length < 20) return 'curious';
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) return 'grateful';
        if (lowerMessage.includes('sorry') || lowerMessage.includes('apologize')) return 'apologetic';
        if (lowerMessage.includes('help') || lowerMessage.includes('need')) return 'needing_help';
        if (lowerMessage.includes('love') || lowerMessage.includes('amazing')) return 'enthusiastic';
        if (lowerMessage.includes('hate') || lowerMessage.includes('terrible')) return 'frustrated';
        
        return 'neutral';
    }

    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) return 'question';
        if (lowerMessage.includes('help') || lowerMessage.includes('assist')) return 'request_help';
        if (lowerMessage.includes('thank')) return 'gratitude';
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) return 'farewell';
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return 'greeting';
        
        return 'statement';
    }

    updateUserProfile(message) {
        const lowerMessage = message.toLowerCase();
        
        // Extract preferences
        if (lowerMessage.includes('i like') || lowerMessage.includes('i love')) {
            const match = message.match(/i (like|love) (.+)/i);
            if (match) {
                this.conversationHistory.metadata.preferences.likes = match[2];
            }
        }
        
        if (lowerMessage.includes('i don\'t like') || lowerMessage.includes('i hate')) {
            const match = message.match(/i don't like (.+)/i);
            if (match) {
                this.conversationHistory.metadata.preferences.dislikes = match[1];
            }
        }

        // Update topics
        const topics = this.extractTopics(message);
        this.conversationHistory.metadata.topics = [
            ...this.conversationHistory.metadata.topics,
            ...topics
        ].slice(-10); // Keep last 10 topics
    }

    updateConversationContext() {
        this.conversationHistory.context.sessionDuration = 
            Date.now() - new Date(this.conversationHistory.startTime).getTime();
        
        this.conversationHistory.context.averageResponseTime = 
            this.calculateAverageResponseTime();
        
        this.conversationHistory.context.conversationFlow = 
            this.conversationHistory.messages.map(msg => ({
                sender: msg.sender,
                intent: msg.context.intent,
                tone: msg.context.tone
            }));
        
        // Calculate user engagement
        const recentMessages = this.conversationHistory.messages.slice(-5);
        const userMessages = recentMessages.filter(msg => msg.sender === 'user').length;
        this.conversationHistory.context.userEngagement = 
            userMessages >= 3 ? 'high' : userMessages >= 1 ? 'medium' : 'low';
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                const data = await response.json();
                this.updateStatus(`Connected to intelligent server (${data.activeSessions} active sessions)`, 'success');
                this.updateOnlineStatus(true);
            } else {
                this.updateStatus('Server connection failed', 'error');
                this.updateOnlineStatus(false);
            }
        } catch (error) {
            this.updateStatus('Cannot connect to server', 'error');
            this.updateOnlineStatus(false);
        }
    }

    updateOnlineStatus(isOnline) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.chat-status span');
        
        if (statusDot && statusText) {
            if (isOnline) {
                statusDot.style.color = '#4CAF50';
                statusText.textContent = 'Online';
            } else {
                statusDot.style.color = '#f44336';
                statusText.textContent = 'Offline';
            }
        }
    }

    handleInput() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
        
        // Add visual feedback
        if (hasText) {
            this.sendButton.style.transform = 'scale(1.05)';
        } else {
            this.sendButton.style.transform = 'scale(1)';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        const startTime = Date.now();

        // Add user message to UI and history
        this.addMessage(message, 'user');
        this.addToHistory('user', message);
        
        this.messageInput.value = '';
        this.handleInput();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.sendMessage(message);
            const responseTime = Date.now() - startTime;
            
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.addToHistory('bot', response, responseTime);
        } catch (error) {
            this.hideTypingIndicator();
            const errorMessage = 'Sorry, I encountered an error. Please try again.';
            this.addMessage(errorMessage, 'bot');
            this.addToHistory('bot', errorMessage, Date.now() - startTime);
            console.error('Error:', error);
        }
    }

    async sendMessage(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                sessionId: this.conversationHistory.sessionId,
                conversationHistory: this.conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        const senderName = sender === 'bot' ? 'AI Assistant' : 'You';
        const currentTime = this.getCurrentTime();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="avatar">
                    ${avatar}
                </div>
                <div class="text">
                    <div class="message-header">
                        <span class="sender-name">${senderName}</span>
                        <span class="message-time">${currentTime}</span>
                    </div>
                    ${this.escapeHtml(text)}
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        this.messageCount++;
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.handleInput();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.handleInput();
        
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        
        // Clear status after 3 seconds
        setTimeout(() => {
            this.status.textContent = '';
            this.status.className = 'status';
        }, 3000);
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Enhanced conversation history methods
    getConversationHistory() {
        return this.conversationHistory;
    }

    getConversationStats() {
        return {
            totalMessages: this.conversationHistory.metadata.totalMessages,
            userMessages: this.conversationHistory.metadata.userMessages,
            botMessages: this.conversationHistory.metadata.botMessages,
            sessionDuration: this.conversationHistory.context.sessionDuration,
            averageResponseTime: this.conversationHistory.context.averageResponseTime,
            topics: this.conversationHistory.metadata.topics,
            preferences: this.conversationHistory.metadata.preferences,
            userEngagement: this.conversationHistory.context.userEngagement
        };
    }

    calculateAverageResponseTime() {
        const botMessages = this.conversationHistory.messages.filter(msg => msg.sender === 'bot' && msg.responseTime);
        if (botMessages.length === 0) return 0;
        
        const totalResponseTime = botMessages.reduce((sum, msg) => sum + msg.responseTime, 0);
        return Math.round(totalResponseTime / botMessages.length);
    }

    exportHistory() {
        const historyData = {
            conversation: this.conversationHistory,
            stats: this.getConversationStats(),
            exportTime: new Date().toISOString(),
            enhancedFeatures: {
                topics: this.conversationHistory.metadata.topics,
                preferences: this.conversationHistory.metadata.preferences,
                conversationFlow: this.conversationHistory.context.conversationFlow,
                userEngagement: this.conversationHistory.context.userEngagement
            }
        };

        const dataStr = JSON.stringify(historyData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `intelligent-chatbot-${this.conversationHistory.sessionId}.json`;
        link.click();
        
        this.updateStatus('Enhanced conversation history exported!', 'success');
    }

    // Additional functionality methods
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Keep only the first bot message
            const messages = this.chatMessages.querySelectorAll('.message');
            messages.forEach((message, index) => {
                if (index > 0) {
                    message.remove();
                }
            });
            
            // Reset conversation history but keep session info
            this.conversationHistory.messages = [this.conversationHistory.messages[0]];
            this.conversationHistory.metadata.totalMessages = 1;
            this.conversationHistory.metadata.userMessages = 0;
            this.conversationHistory.metadata.botMessages = 1;
            this.conversationHistory.metadata.lastActivity = new Date().toISOString();
            this.conversationHistory.metadata.topics = [];
            this.conversationHistory.metadata.preferences = {};
            
            this.messageCount = 0;
            this.updateStatus('Chat cleared', 'success');
        }
    }

    showSettings() {
        const stats = this.getConversationStats();
        const statsMessage = `
            🤖 Intelligent Chatbot Statistics:
            
            📊 Message Analytics:
            • Total Messages: ${stats.totalMessages}
            • User Messages: ${stats.userMessages}
            • Bot Messages: ${stats.botMessages}
            • Session Duration: ${Math.round(stats.sessionDuration / 1000)}s
            • Avg Response Time: ${stats.averageResponseTime}ms
            
            🎯 User Profile:
            • Topics Discussed: ${stats.topics.join(', ') || 'None yet'}
            • User Engagement: ${stats.userEngagement}
            • Preferences: ${Object.keys(stats.preferences).length > 0 ? 'Detected' : 'None yet'}
            
            💡 Intelligence Features:
            • Context Awareness: Active
            • Conversation Memory: Enabled
            • Topic Tracking: Active
            • Tone Analysis: Active
        `;
        alert(statsMessage);
    }

    attachFile() {
        this.updateStatus('File attachment feature coming soon!', 'info');
    }

    showEmojiPicker() {
        this.updateStatus('Emoji picker feature coming soon!', 'info');
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
}); 