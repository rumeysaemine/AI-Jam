import { PlantSuggestionSystem } from './modules/PlantSuggestionSystem.js';
import { ChatbotSystem } from './modules/ChatbotSystem.js';
import { VideoBackgroundSystem } from './modules/VideoBackgroundSystem.js';

document.addEventListener("DOMContentLoaded", () => {
  // Video arka plan sistemi
  new VideoBackgroundSystem();
  
  // Bitki Öneri Sistemi Başlatma
  const plantSuggestionSystem = new PlantSuggestionSystem(
    "plant-form",
    "suggestions",
    "plantDetails"
  );
  
  // Chatbot Sistemi Başlatma
  const chatbotSystem = new ChatbotSystem();
});
