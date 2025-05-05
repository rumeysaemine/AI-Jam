export class PlantSuggestionSystem {
  constructor(formId, suggestionsDivId, plantDetailsDivId) {
    this.form = document.getElementById(formId);
    this.suggestionsDiv = document.getElementById(suggestionsDivId);
    this.plantDetailsDiv = document.getElementById(plantDetailsDivId);
    
    this.init();
  }
  
  init() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }
  
  async handleFormSubmit() {
    // Önceki önerileri temizle
    this.suggestionsDiv.innerHTML = "";
    this.plantDetailsDiv.innerHTML = ""; 

    // Form verilerini al
    const payload = {
      location: document.getElementById("location").value,
      weather: document.getElementById("weather").value,
      soil_type: document.getElementById("soil_type").value
    };

    try {
      // Yükleniyor durumunu göster
      this.suggestionsDiv.innerHTML = "<div class='loading'>Bitki önerileri alınıyor...</div>";

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

      this.displaySuggestions(suggestions);
    } catch (error) {
      this.suggestionsDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
  
  displaySuggestions(suggestions) {
    this.suggestionsDiv.innerHTML = "<h3>Önerilen Bitkiler:</h3>";
    
    suggestions.forEach((plant) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<p>${plant}</p>`;
      card.addEventListener("click", async () => {
        await this.showPlantDetails(plant);
      });
      this.suggestionsDiv.appendChild(card);
    });
  }
  
  async showPlantDetails(plantName) {
    try {
      // Detaylar yüklenirken gösterilecek içerik
      this.plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <div class="loading-spinner"></div>
        <p>Bitki detayları yükleniyor...</p>
      `;
      this.plantDetailsDiv.style.display = "block";

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
      const formattedDetails = this.formatPlantDetails(data.details);
      this.plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <div class="plant-details-content">${formattedDetails}</div>
        <button class="back-button">Geri Dön</button>
      `;

      // Geri dön butonu event'i
      document.querySelector(".back-button").addEventListener("click", () => {
        this.plantDetailsDiv.style.display = "none";
      });

    } catch (error) {
      this.plantDetailsDiv.innerHTML = `
        <h3>${plantName} Detayları</h3>
        <p class="error">${error.message}</p>
        <button class="back-button">Geri Dön</button>
      `;
    }
  }
  
  formatPlantDetails(details) {
    return details
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>/g, '</li></ul>')
      .replace(/<\/ul><ul>/g, '');
  }
}