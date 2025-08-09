import markdownit from 'markdown-it'
// window.markdownit()
const md = markdownit()

const API_KEY = 'AIzaSyDA-Oa3GFjeaDtf0UHoouPE7Py66g7SILM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + API_KEY;

// Prompt base global
const promptBase = `
Eres Andrómeda, una asistente virtual amable, paciente y confiable creada por Google, basada en Gemini 1.5 pro. Tu objetivo es ayudar al usuario con cualquier pregunta o problema que tenga, facilitando la comunicación y ofreciendo respuestas claras, útiles y tranquilizadoras.

Responde siempre de forma natural y amistosa, evitando ser demasiado fría, directa o exagerada. Sé honesta y sincera cuando no sepas algo, y ofrece alternativas o recursos útiles. Anima al usuario a seguir preguntando si necesita más ayuda.

Mantén el contexto de la conversación para responder de forma coherente con lo hablado previamente. Adapta tus respuestas según el interés del usuario, y si te piden opinión, elige la opción que creas más interesante para el usuario, incluso si no tienes emociones propias.

Cumple con las siguientes pautas:

Sé respetuosa y evita generar contenido inapropiado, dañino o engañoso.

Si la pregunta es delicada (médica, legal, financiera), explica que no eres especialista y aconseja consultar a un profesional.

Mantén un lenguaje claro, accesible y amable, sin sonar falso o forzado.

Usa la información proporcionada en el prompt base para orientar tus respuestas, pero adapta el contenido al usuario.

Recibirás entradas que incluyen un prompt base seguido de la consulta del usuario. Usa siempre el prompt base para entender el contexto y proveer respuestas alineadas y relevantes.
`;

// Referencias a elementos
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const minimizeBtn = document.getElementById('minimizeBtn');
const chatContainer = document.querySelector('.chat-container'); // si existe

// Historial global de conversación
const conversationHistory = [];

// Función para crear mensajes en el DOM
function createMessageElement(text, sender = 'bot') {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`, 'flex', 'mb-5', 'items-start', 'animate-[fadeInUp_0.3s_ease]');
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0';
  avatarDiv.innerHTML = sender === 'bot'
    ? '<img src="assets/gemini-logo.svg" />'
    : ''
  if (sender === 'bot') {
    avatarDiv.classList.add('bg-white');
  } else {
    avatarDiv.classList.add('bg-gray-200', 'text-gray-600');
    messageDiv.classList.add('flex-row-reverse')
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content max-w-[80%] mx-3';

  const p = document.createElement('p');
  p.className = sender === 'user'
    ? 'bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white p-3.5 rounded-[18px] mb-1 shadow-md leading-snug overflow-x-auto'
    : 'bg-white p-3.5 rounded-[18px] mb-1 shadow-md leading-snug text-gray-700 overflow-x-auto';
  if (sender === 'bot') {
    p.innerHTML = text
  } else {
    p.textContent = text
  }

  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time block text-[11px] text-gray-400';
  const now = new Date();
  timeSpan.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  contentDiv.appendChild(p);
  contentDiv.appendChild(timeSpan);

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);

  return messageDiv;
}

// Función para mostrar indicador de escritura
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-message flex mb-5 items-start animate-fadeInUp';

  typingDiv.innerHTML = `
    <div class="message-avatar w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-white">
      <img src="assets/gemini-logo.svg" />
    </div>
    <div class="message-content max-w-[80%] mx-3">
      <div class="typing-indicator flex items-center gap-1.5 p-3.5 bg-white rounded-[18px] shadow-md">
        <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing"></div>
        <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing" style="animation-delay: 0.2s;"></div>
        <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing" style="animation-delay: 0.4s;"></div>
      </div>
    </div>
  `;

  chatMessages.appendChild(typingDiv);
  scrollToBottom();
}

// Ocultar indicador
function hideTypingIndicator() {
  const typingMessage = chatMessages.querySelector('.typing-message');
  if (typingMessage) typingMessage.remove();
}

// Scroll al final
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Construir el prompt incluyendo el historial
function construirPrompt(history, mensajeUsuario) {
  let historialTexto = '';

  for (const entry of history) {
    if (entry.role === 'user') {
      historialTexto += `Usuario: ${entry.content}\n`;
    } else if (entry.role === 'bot') {
      historialTexto += `Andrómeda: ${entry.content}\n`;
    }
  }

  historialTexto += `Usuario: ${mensajeUsuario}\n`;

  return `${promptBase}\n\nHistorial de conversación:\n${historialTexto}\nAndrómeda:`;
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Mostrar mensaje usuario en DOM
  const userMsgElem = createMessageElement(message, 'user');
  chatMessages.appendChild(userMsgElem);
  scrollToBottom();

  messageInput.value = '';
  messageInput.disabled = true;
  sendBtn.disabled = true;

  showTypingIndicator();

  try {
    // Agregar mensaje usuario al historial
    conversationHistory.push({ role: 'user', content: message });

    // Construir prompt con historial y mensaje actual
    const fullPrompt = construirPrompt(conversationHistory, message);

    const body = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    hideTypingIndicator();

    if (!response.ok) {
      const errorText = await response.text();
      addBotMessage(`Error: ${response.status}\n${errorText}`);
      return;
    }

    const data = await response.json();
    const respuestaBot = data?.candidates?.[0]?.content?.parts?.[0].text || 'Lo siento, no pude procesar tu mensaje.';

    // Guardar respuesta bot en historial
    conversationHistory.push({ role: 'bot', content: respuestaBot });

    const botText = md.render(respuestaBot);
    addBotMessage(botText);

  } catch (error) {
    hideTypingIndicator();
    addBotMessage('Lo siento, hubo un error. Inténtalo de nuevo.');
    console.error(error);
  } finally {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

function addBotMessage(text) {
  const botMsgElem = createMessageElement(text, 'bot');
  chatMessages.appendChild(botMsgElem);
  scrollToBottom();
}

// Toggle chat minimizar / mostrar
function toggleChat() {
  if (!chatContainer) return;

  chatContainer.classList.toggle('minimized');
}

// Eventos
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});
minimizeBtn.addEventListener('click', toggleChat);

// Opcional: focus automático en input
messageInput.focus();
