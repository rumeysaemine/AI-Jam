import os
from dotenv import load_dotenv
import google.generativeai as genai

# Çevresel değişkenleri yükle
load_dotenv()

# API key'i güvenli şekilde al
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

def get_plant_suggestions(location: str, weather: str, soil_type: str) -> str:
    prompt = f"""
    **Görev**: Verilen tarımsal koşullara uygun 3 bitki öner.
    
    **Girdiler**:
    - Konum: {location}
    - Hava Durumu: {weather}
    - Toprak Türü: {soil_type}
    
    **Çıktı Formatı**:
    - Sadece bitki isimleri
    - Virgülle ayrılmış şekilde
    - Örnek: "domates, biber, patlıcan"
    - Açıklama EKLEME!
    
    **Kriterler**:
    - Bölgeye uygun yerel türlere öncelik ver
    - Sürdürülebilir tarıma uygun seçimler yap
    - Mevsimsel uygunluğu dikkate al
    """
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,  # Daha deterministik yanıtlar
            "max_output_tokens": 100  # Çıktı uzunluğu sınırı
        }
    )
    return response.text.strip()

def get_plant_details(plant_name: str) -> str:
    prompt = f"""
    **Görev**: {plant_name} bitkisi için kısa yetiştirme rehberi hazırla.
    
    **İstenen Bilgiler** (max 150 kelime):
    1. Temel gereksinimler (güneş, su, toprak)
    2. Bakım ipuçları
    3. Sürdürülebilir yetiştirme yöntemleri
    4. Yaygın sorunlar ve çözümler
    
    **Format**:
    - Her başlık için 1-2 cümle
    - Madde işaretleri kullan (•)
    - Türkçe ve anlaşılır dil
    
    Örnek:
    • Güneş: Tam güneş sever, günde 6-8 saat...
    • Sulama: Toprak kurudukça, aşırı sudan kaçının...
    """
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.5,
            "max_output_tokens": 300,
            "top_p": 0.9
        }
    )
    return response.text.strip()