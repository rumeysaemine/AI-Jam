import { PlantSuggestionSystem } from './modules/PlantSuggestionSystem.js';
import { ChatbotSystem } from './modules/ChatbotSystem.js';

document.addEventListener("DOMContentLoaded", () => {
    // Bitki Öneri Sistemi Başlatma
    const plantSuggestionSystem = new PlantSuggestionSystem(
      "plant-form",
      "suggestions",
      "plantDetails"
    );
    
    // Chatbot Sistemi Başlatma
    const chatbotSystem = new ChatbotSystem();
  });
