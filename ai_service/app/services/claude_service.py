import json
import anthropic
from app.models.schemas import AnalyzeRequest, AnalyzeResponse

# System prompt is the entire reason this microservice exists.
# It locks Claude into a predictable, structured output every single time.
# The Golang backend and Flutter app rely on this contract being consistent.
SYSTEM_PROMPT = """You are an expert flirting coach. Your job is to analyze a conversation and generate exactly 5 response suggestions — one for each mode below.

MODES:
- witty: Playful, clever, uses humor or a light tease
- sincere: Warm, genuine, shows real interest
- confident: Bold, assertive, takes initiative
- thoughtful: Deep, considerate, emotionally aware
- casual: Relaxed, low-pressure, friendly

OUTPUT RULES (follow strictly):
1. Return ONLY a raw JSON object — no markdown, no code blocks, no extra text
2. Always return exactly 5 suggestions, one per mode
3. Each suggestion must be a natural, conversational reply — not a template
4. Keep each suggestion between 10 and 120 characters
5. Confidence score (0.0 to 1.0) reflects how well the suggestion fits the conversation context
6. Sentiment reflects the overall tone of the INCOMING conversation (not your reply)

REQUIRED JSON SCHEMA:
{
  "suggestions": [
    {"mode": "witty",      "text": "...", "confidence": 0.00},
    {"mode": "sincere",    "text": "...", "confidence": 0.00},
    {"mode": "confident",  "text": "...", "confidence": 0.00},
    {"mode": "thoughtful", "text": "...", "confidence": 0.00},
    {"mode": "casual",     "text": "...", "confidence": 0.00}
  ],
  "sentiment": "positive" | "neutral" | "negative"
}"""


def _parse_response(raw_text: str) -> AnalyzeResponse:
    """Parse and validate Claude's response into our schema."""
    try:
        data = json.loads(raw_text.strip())
        return AnalyzeResponse(**data)
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Claude returned invalid JSON: {e}\nRaw: {raw_text}")


async def analyze_conversation(
    request: AnalyzeRequest,
    client: anthropic.Anthropic,
    max_retries: int = 2,
) -> AnalyzeResponse:
    """
    Call Claude with the conversation and return structured suggestions.
    Retries up to max_retries times if Claude returns malformed output.
    """
    last_error = None

    for attempt in range(max_retries + 1):
        message = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Analyze this conversation and generate 5 response suggestions:\n\n{request.conversation}",
                }
            ],
        )

        raw_text = message.content[0].text

        try:
            return _parse_response(raw_text)
        except ValueError as e:
            last_error = e
            if attempt < max_retries:
                continue

    raise ValueError(
        f"Claude failed to return valid output after {max_retries + 1} attempts. "
        f"Last error: {last_error}"
    )
