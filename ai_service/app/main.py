from fastapi import FastAPI
from app.routers import analyze

app = FastAPI(
    title="Cupid AI — AI Microservice",
    description="Analyzes conversations and returns structured flirting response suggestions via Claude.",
    version="1.0.0",
)

app.include_router(analyze.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
