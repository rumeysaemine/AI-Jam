document.addEventListener("DOMContentLoaded", () => {
  // Bitki Öneri Sistemi Değişkenleri
  const form = document.getElementById("plant-form");
  const suggestionsDiv = document.getElementById("suggestions");
  const plantDetailsDiv = document.getElementById("plantDetails");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Önceki önerileri temizle
    suggestionsDiv.innerHTML = "";
    plantDetailsDiv.innerHTML = ""; 

    // Form verilerini al
    const location = document.getElementById("location").value;
    const weather = document.getElementById("weather").value;
    const soilType = document.getElementById("soil_type").value;

    const payload = {
      location: location,
      weather: weather,
      soil_type: soilType
    };

    try {
      // Yükleniyor durumunu göster
      suggestionsDiv.innerHTML = "<div class='loading'>Bitki önerileri alınıyor...</div>";

      const response = await fetch("http://127.0.0.1:8000/suggest_plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Bitki önerisi alınamadı.");
      }

      const data = await response.json();

      const suggestions = Array.isArray(data.suggestions)
        ? data.suggestions
        : data.suggestions.split(",").map(s => s.trim());

      displaySuggestions(suggestions);
    } catch (error) {
      suggestionsDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
  });

  function displaySuggestions(suggestions) {
    suggestionsDiv.innerHTML = "<h3>Önerilen Bitkiler:</h3>";
    
    suggestions.forEach((plant) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<p>${plant}</p>`;
      card.addEventListener("click", async () => {
        await showPlantDetails(plant);
      });
      suggestionsDiv.appendChild(card);
    });
  }

  async function showPlantDetails(plantName) {
    try {
      // Detaylar yüklenirken gösterilecek içerik
      plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <div class="loading-spinner"></div>
        <p>Bitki detayları yükleniyor...</p>
      `;
      plantDetailsDiv.style.display = "block";

      // Detayları backend'den al
      const response = await fetch("http://127.0.0.1:8000/plant_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant_name: plantName })
      });

      if (!response.ok) {
        throw new Error("Bitki detayları alınamadı.");
      }

      const data = await response.json();
      
      // Gelen detayları formatla ve göster
      const formattedDetails = formatPlantDetails(data.details);
      plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <div class="plant-details-content">${formattedDetails}</div>
        <button class="back-button">Geri Dön</button>
      `;

      // Geri dön butonu event'i
      document.querySelector(".back-button").addEventListener("click", () => {
        plantDetailsDiv.style.display = "none";
      });

    } catch (error) {
      plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <p class="error">${error.message}</p>
        <button class="back-button">Geri Dön</button>
      `;
    }
  }

  function formatPlantDetails(details) {
    // Gemini'nin döndürdüğü metni daha okunabilir hale getir
    return details
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **kalın** yazıları HTML'e çevir
      .replace(/\n/g, '<br>') // Yeni satırları <br> ile değiştir
      .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>') // Madde işaretlerini liste yap
      .replace(/<li>/g, '<ul><li>') // Liste başlangıcı
      .replace(/<\/li>/g, '</li></ul>') // Liste bitişi
      .replace(/<\/ul><ul>/g, ''); // Ardışık ul tag'larını temizle
  }

  
  // CHATBOT KISMI
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const chatbotContainer = document.querySelector(".chatbot-container");
  const chatbot = document.querySelector(".chatbot");
  const chatbotCloseBtn = document.querySelector(".chatbot header .close-btn");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendButton = document.querySelector(".send-btn");
  const chatbox = document.querySelector(".chatbox");
  let userMessage = null;
  let isInitialized = false; // Chatbot'un başlatılıp başlatılmadığını takip etmek için

  // Chatbot başlangıç durumu
  const initChatbot = () => {
    if (isInitialized) return; // Zaten başlatıldıysa tekrar başlatma
    
    chatbotContainer.classList.remove("show-chatbot");
    chatbotToggler.classList.remove("active");
    
    // Hoş geldin mesajı (sadece ilk başlatmada)
    if (chatbox.children.length === 0) {
      const welcomeMsg = "Merhaba! 🌱 Sürdürülebilir tarım hakkında sorularınızı yanıtlayabilirim. Örneğin: 'Organik tarım nedir?' veya 'Su tasarrufu nasıl yapılır?'";
      chatbox.appendChild(createChatLi(welcomeMsg, "incoming"));
    }
    
    isInitialized = true;
  };

  // Chatbot aç/kapa
  const toggleChatbot = () => {
    chatbotContainer.classList.toggle("show-chatbot");
    chatbotToggler.classList.toggle("active");
    
    if (chatbotContainer.classList.contains("show-chatbot")) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  };

  // Mesaj oluşturma
  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    
    const chatContent = className === "outgoing" 
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    
    chatLi.innerHTML = chatContent;
    return chatLi;
  };

  // Mesaj gönderme
  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatInput.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
    
    const incomingChatLi = createChatLi("Yazıyor...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTop = chatbox.scrollHeight;
    
    generateResponse(incomingChatLi);
  };

  // API'den cevap alma
  const generateResponse = async (chatElement) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage })
      });

      if (!response.ok) throw new Error("Cevap alınamadı");
      
      const data = await response.json();
      chatElement.querySelector("p").textContent = data.response;
    } catch (error) {
      chatElement.querySelector("p").textContent = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
    } finally {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  };

  // Event Listeners
  chatbotToggler.addEventListener("click", toggleChatbot);
  chatbotCloseBtn.addEventListener("click", () => {
    chatbotContainer.classList.remove("show-chatbot");
    chatbotToggler.classList.remove("active");
  });

  // Dışarı tıklayarak kapatma
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".chatbot") && 
        !e.target.closest(".chatbot-toggler") &&
        chatbotContainer.classList.contains("show-chatbot")) {
      chatbotContainer.classList.remove("show-chatbot");
      chatbotToggler.classList.remove("active");
    }
  });

  sendButton.addEventListener("click", handleChat);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  });

  // Chatbot'u başlat
  initChatbot();
  
  
});