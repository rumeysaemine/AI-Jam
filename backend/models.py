from pydantic import BaseModel

class SuggestionRequest(BaseModel):
    location: str
    weather: str
    soil_type: str

class PlantSelection(BaseModel):
    plant_name: str

class ChatRequest(BaseModel):
    question: str