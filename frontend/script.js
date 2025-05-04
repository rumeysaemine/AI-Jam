document.addEventListener("DOMContentLoaded", () => {
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
});