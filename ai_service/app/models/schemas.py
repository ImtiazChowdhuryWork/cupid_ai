from pydantic import BaseModel, Field
from enum import Enum


class ResponseMode(str, Enum):
    witty = "witty"
    sincere = "sincere"
    confident = "confident"
    thoughtful = "thoughtful"
    casual = "casual"


class Sentiment(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"


class AnalyzeRequest(BaseModel):
    conversation: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="The conversation text to analyze",
    )


class ResponseSuggestion(BaseModel):
    mode: ResponseMode
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class AnalyzeResponse(BaseModel):
    suggestions: list[ResponseSuggestion]
    sentiment: Sentiment

    class Config:
        use_enum_values = True
