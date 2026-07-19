// ===== GET HTML ELEMENTS FROM THE PAGE =====
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// ===== CONFIGURATION =====
// Replace this with your actual Cloudflare Worker URL.
// The Worker holds the OpenAI key and forwards the request safely.
const WORKER_URL = "https://poneyboy.blaineid.workers.dev/";

// ===== STORE CONVERSATION HISTORY =====
const messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. Help users discover and understand L'Oréal's products including makeup, skincare, haircare, and fragrances. Provide personalized recommendations and routines.",
  },
];

// ===== HELPER FUNCTIONS =====
function createMessageElement(role, text) {
  const messageElement = document.createElement("div");
  messageElement.className = `msg ${role}`;
  messageElement.textContent = text;
  return messageElement;
}

function appendMessage(role, text) {
  const label = role === "user" ? "You:" : "Assistant:";
  const messageElement = createMessageElement(role, `${label} ${text}`);
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return messageElement;
}

function showWelcomeMessage() {
  chatWindow.innerHTML = "";
  const welcome = document.createElement("div");
  welcome.className = "msg ai";
  welcome.textContent = "👋 Hello! How can I help you today?";
  chatWindow.appendChild(welcome);
}

function showError(message) {
  appendMessage("ai", message);
}

// ===== INITIALIZE =====
showWelcomeMessage();

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  messages.push({ role: "user", content: userMessage });
  appendMessage("user", userMessage);
  userInput.value = "";

  const loadingMessage = createMessageElement("ai", "Assistant is typing...");
  chatWindow.appendChild(loadingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      throw new Error("No response received from assistant.");
    }

    messages.push({ role: "assistant", content: assistantMessage });
    loadingMessage.textContent = `Assistant: ${assistantMessage}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error("Chat error:", error);
    if (loadingMessage.parentElement) {
      loadingMessage.remove();
    }
    showError(
      "Sorry, there was an error. Please check your Cloudflare Worker URL and try again.",
    );
  }
});
