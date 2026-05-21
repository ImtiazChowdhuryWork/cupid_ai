from fastapi import APIRouter, Depends, HTTPException
import anthropic

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.claude_service import analyze_conversation
from app.config import get_settings

router = APIRouter(prefix="/analyze", tags=["analyze"])


def get_claude_client() -> anthropic.Anthropic:
    settings = get_settings()
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


@router.post("", response_model=AnalyzeResponse)
async def analyze(
    request: AnalyzeRequest,
    client: anthropic.Anthropic = Depends(get_claude_client),
) -> AnalyzeResponse:
    try:
        return await analyze_conversation(request, client)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")
