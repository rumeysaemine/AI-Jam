export class ChatbotSystem {
    constructor() {
      this.chatbotToggler = document.querySelector(".chatbot-toggler");
      this.chatbotContainer = document.querySelector(".chatbot-container");
      this.chatbot = document.querySelector(".chatbot");
      this.chatbotCloseBtn = document.querySelector(".chatbot header .close-btn");
      this.chatInput = document.querySelector(".chat-input textarea");
      this.sendButton = document.querySelector(".send-btn");
      this.chatbox = document.querySelector(".chatbox");
      this.userMessage = null;
      this.isInitialized = false;
      
      this.init();
    }
    
    init() {
      this.setupEventListeners();
      this.showWelcomeMessage();
      this.isInitialized = true;
    }
    
    setupEventListeners() {
      this.chatbotToggler.addEventListener("click", () => this.toggleChatbot());
      this.chatbotCloseBtn.addEventListener("click", () => this.closeChatbot());
      this.sendButton.addEventListener("click", () => this.handleChat());
      
      this.chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleChat();
        }
      });
      
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".chatbot") && 
            !e.target.closest(".chatbot-toggler") &&
            this.chatbotContainer.classList.contains("show-chatbot")) {
          this.closeChatbot();
        }
      });
    }
    
    showWelcomeMessage() {
      if (this.chatbox.children.length === 0) {
        const welcomeMsg = "Merhaba! 🌱 Sürdürülebilir tarım hakkında sorularınızı yanıtlayabilirim. Örneğin: 'Organik tarım nedir?' veya 'Su tasarrufu nasıl yapılır?'";
        this.chatbox.appendChild(this.createChatLi(welcomeMsg, "incoming"));
      }
    }
    
    toggleChatbot() {
      this.chatbotContainer.classList.toggle("show-chatbot");
      this.chatbotToggler.classList.toggle("active");
      
      if (this.chatbotContainer.classList.contains("show-chatbot")) {
        this.chatbox.scrollTop = this.chatbox.scrollHeight;
      }
    }
    
    closeChatbot() {
      this.chatbotContainer.classList.remove("show-chatbot");
      this.chatbotToggler.classList.remove("active");
    }
    
    createChatLi(message, className) {
      const chatLi = document.createElement("li");
      chatLi.classList.add("chat", className);
      
      const chatContent = className === "outgoing" 
        ? `<p>${message}</p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
      
      chatLi.innerHTML = chatContent;
      return chatLi;
    }
    
    async handleChat() {
      this.userMessage = this.chatInput.value.trim();
      if (!this.userMessage) return;
  
      this.chatbox.appendChild(this.createChatLi(this.userMessage, "outgoing"));
      this.chatInput.value = "";
      this.chatbox.scrollTop = this.chatbox.scrollHeight;
      
      const incomingChatLi = this.createChatLi("Yazıyor...", "incoming");
      this.chatbox.appendChild(incomingChatLi);
      this.chatbox.scrollTop = this.chatbox.scrollHeight;
      
      await this.generateResponse(incomingChatLi);
    }
    
    async generateResponse(chatElement) {
      try {
        const response = await fetch("http://127.0.0.1:8000/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: this.userMessage })
        });
  
        if (!response.ok) throw new Error("Cevap alınamadı");
        
        const data = await response.json();
        chatElement.querySelector("p").textContent = data.response;
      } catch (error) {
        chatElement.querySelector("p").textContent = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
      } finally {
        this.chatbox.scrollTop = this.chatbox.scrollHeight;
      }
    }
  }