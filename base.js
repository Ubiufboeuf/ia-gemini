class ChatBot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.chatToggle = document.getElementById('chatToggle');
        this.chatContainer = document.querySelector('.chat-container');
        
        this.initializeChatbase();
        this.initializeEventListeners();
    }

    initializeChatbase() {
        // Integración de Chatbase
        if (!window.chatbase || window.chatbase("getState") !== "initialized") {
            window.chatbase = () => {
                if (!window.chatbase.q) {
                    window.chatbase.q = []
                }
                window.chatbase.q.push(arguments)
            }
            window.chatbase = new Proxy(window.chatbase, {
                get (target, prop) {
                    if (prop === "q") {
                        return target.q
                    }
                    return (...args) => target(prop, ...args)
                }
            })
        }

        const onLoad = () => {
            const script = document.createElement("script")
            script.src = "https://www.chatbase.co/embed.min.js"
            script.id = "p4c2Z2IYnluOAIvTRwi8u"
            script.domain = "www.chatbase.co"
            document.body.appendChild(script)
            
            // Configurar Chatbase para modo headless (sin interfaz propia)
            setTimeout(() => {
                if (window.chatbase) {
                    window.chatbase('init', {
                        chatbotId: 'p4c2Z2IYnluOAIvTRwi8u',
                        headless: true
                    });
                }
            }, 1000);
        }

        if (document.readyState === "complete") {
            onLoad()
        } else {
            window.addEventListener("load", onLoad)
        }
    }

    initializeEventListeners() {
        // Enviar mensaje con botón
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enviar mensaje con Enter
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Minimizar/maximizar chat
        this.minimizeBtn.addEventListener('click', () => this.toggleChat());
        this.chatToggle.addEventListener('click', () => this.toggleChat());
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        // Enviar mensaje a Chatbase
        this.getBotResponse(message);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const currentTime = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
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
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    async getBotResponse(userMessage) {
        try {
            // Verificar si Chatbase está disponible
            if (window.chatbase && typeof window.chatbase === 'function') {
                // Enviar mensaje a Chatbase
                window.chatbase('sendMessage', {
                    message: userMessage,
                    callback: (response) => {
                        this.hideTypingIndicator();
                        if (response && response.text) {
                            this.addMessage(response.text, 'bot');
                        } else {
                            this.addMessage('Lo siento, no pude procesar tu mensaje. Inténtalo de nuevo.', 'bot');
                        }
                    },
                    onError: (error) => {
                        console.error('Error de Chatbase:', error);
                        this.hideTypingIndicator();
                        this.addMessage('Lo siento, hubo un error de conexión. Inténtalo de nuevo.', 'bot');
                    }
                });
            } else {
                // Fallback si Chatbase no está disponible
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addMessage('El chatbot se está inicializando. Por favor, espera unos segundos e inténtalo de nuevo.', 'bot');
                }, 1500);
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.hideTypingIndicator();
            this.addMessage('Lo siento, hubo un error. Inténtalo de nuevo.', 'bot');
        }
    }

    toggleChat() {
        this.chatContainer.classList.toggle('minimized');
        
        if (this.chatContainer.classList.contains('minimized')) {
            this.chatToggle.style.display = 'flex';
        } else {
            this.chatToggle.style.display = 'none';
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollTop + 1000;
    }
}

// Inicializar el chatbot cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});

// Funciones adicionales para personalización
function updateBotName(name) {
    document.querySelector('.header-text h3').textContent = name;
}

function updateBotStatus(status) {
    document.querySelector('.status').textContent = status;
}
