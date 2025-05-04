from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SuggestionRequest, PlantSelection, ChatRequest
from gemini_utils import get_plant_suggestions, get_plant_details, get_chat_response 

app = FastAPI()

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/suggest_plants")
async def suggest_plants(request: SuggestionRequest):
    suggestions = get_plant_suggestions(request.location, request.weather, request.soil_type)
    return {"suggestions": suggestions}

@app.post("/plant_details")
async def plant_details(request: PlantSelection):
    details = get_plant_details(request.plant_name)
    return {"details": details}

@app.post("/chatbot")
async def chatbot_response(request: ChatRequest):
    try:
        response = get_chat_response(request.question)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
