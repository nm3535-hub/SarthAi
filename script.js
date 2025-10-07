// script.js
// API Key यहाँ से पूरी तरह हटा दी गई है!
// Netlify Function का डिफ़ॉल्ट path
const PROXY_URL = "/.netlify/functions/gemini-proxy";

const promptInput = document.getElementById('promptInput');
const geminiButton = document.getElementById('geminiButton');
const chatOutput = document.getElementById('chat-output');

// Function to add a message to the chat window
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'system-message');
    
    // Add logic for line breaks from API response
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');

    chatOutput.appendChild(messageDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Event Listeners
geminiButton.addEventListener('click', sendMessage);
promptInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        sendMessage();
    }
});

async function sendMessage() {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        return;
    }

    // 1. User message display
    addMessage(prompt, 'user');
    promptInput.value = ''; 

    // 2. Loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'system-message');
    loadingMessage.textContent = "SarthAi is finding direction...";
    chatOutput.appendChild(loadingMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    geminiButton.disabled = true; // Disable button while fetching

    try {
        // Proxy URL को कॉल करना
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // केवल prompt (payload) भेजें
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        let generatedText = "Error: Could not get response.";

        if (response.ok && data.text) {
             generatedText = data.text;
        } else if (data.error) {
             generatedText = "SarthAi Backend Error: " + data.error;
        }
        
        // 3. Remove loading message and display AI response
        chatOutput.removeChild(loadingMessage);
        addMessage(generatedText, 'ai');
        
    } catch (error) {
        console.error('Network Error:', error);
        chatOutput.removeChild(loadingMessage);
        addMessage("A network or connection error occurred. Please check your internet.", 'ai');
    } finally {
        geminiButton.disabled = false; // Enable button
    }
}