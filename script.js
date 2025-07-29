class Chatbot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Session management
        this.sessionId = null;
        this.messageCount = 0;
        
        this.init();
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Clear conversation button
        const clearButton = document.getElementById('clearButton');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearConversation());
        }
        
        // Add scroll event listener for scroll indicator
        this.chatMessages.addEventListener('scroll', () => this.handleScroll());
        
        // Focus on input when page loads
        this.messageInput.focus();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        // Show loading indicator
        this.showLoading();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    sessionId: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update session information
            this.sessionId = data.sessionId;
            this.messageCount = data.messageCount;
            
            // Add bot response to chat
            this.addMessage(data.response, 'bot');
            
            // Update conversation context indicator
            this.updateContextIndicator();
            
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.hideLoading();
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="text">${this.escapeHtml(text)}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <i class="fas fa-sun bot-icon"></i>
                    <div class="text">${this.formatBotResponse(text)}</div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }
    
    formatBotResponse(text) {
        // Convert markdown-like formatting to HTML
        return this.escapeHtml(text)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showLoading() {
        this.loadingIndicator.classList.add('show');
        this.sendButton.disabled = true;
        this.messageInput.disabled = true;
    }
    
    hideLoading() {
        this.loadingIndicator.classList.remove('show');
        this.sendButton.disabled = false;
        this.messageInput.disabled = false;
        this.messageInput.focus();
    }
    
    scrollToBottom() {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    handleScroll() {
        // Add visual feedback for scroll position
        const isAtBottom = this.chatMessages.scrollTop + this.chatMessages.clientHeight >= this.chatMessages.scrollHeight - 10;
        
        if (isAtBottom) {
            this.chatMessages.classList.remove('scrolled');
        } else {
            this.chatMessages.classList.add('scrolled');
        }
    }
    
    updateContextIndicator() {
        // Update header to show conversation context
        const header = document.querySelector('.header p');
        if (this.messageCount > 2) {
            header.innerHTML = `<i class="fas fa-sparkles"></i> Remembering our conversation (${this.messageCount} messages) <i class="fas fa-sparkles"></i>`;
        } else {
            header.innerHTML = `<i class="fas fa-sparkles"></i> Your bright conversation partner <i class="fas fa-sparkles"></i>`;
        }
    }
    
    async clearConversation() {
        if (this.sessionId) {
            try {
                await fetch(`/api/conversation/${this.sessionId}`, {
                    method: 'DELETE'
                });
                
                // Clear chat display
                this.chatMessages.innerHTML = `
                    <div class="message bot-message">
                        <div class="message-content">
                            <i class="fas fa-sun bot-icon"></i>
                            <div class="text">
                                <i class="fas fa-wave-pulse"></i> Hello! I'm Sunny AI, your bright and cheerful assistant! <i class="fas fa-star"></i> How can I brighten your day today?
                            </div>
                        </div>
                    </div>
                `;
                
                // Reset session
                this.sessionId = null;
                this.messageCount = 0;
                this.updateContextIndicator();
                
            } catch (error) {
                console.error('Error clearing conversation:', error);
            }
        }
    }
    
    async getConversationHistory() {
        if (this.sessionId) {
            try {
                const response = await fetch(`/api/conversation/${this.sessionId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Conversation history:', data);
                    return data;
                }
            } catch (error) {
                console.error('Error getting conversation history:', error);
            }
        }
        return null;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
}); 