from fastapi import FastAPI
from app.api.research import router as research_router

app = FastAPI(
    title="Autonomous Research Agent",
    version="1.0.0",
)

app.include_router(
    research_router,
    prefix="/api/v1",
)

@app.get("/")
def home():
    return {
        "message": "Autonomous Research Agent Backend Running 🚀"
    }