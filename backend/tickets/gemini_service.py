import json
import logging
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# JSON schema for structured output — guarantees valid JSON from the model
CLASSIFICATION_SCHEMA = {
    "type": "object",
    "properties": {
        "suggested_priority": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"],
        },
        "suggested_category": {
            "type": "string",
            "enum": ["billing", "technical", "account", "general"],
        },
    },
    "required": ["suggested_priority", "suggested_category"],
}

MAX_RETRIES = 2
RETRY_DELAY = 5  # seconds


def classify_ticket(description):
    """
    Uses Google Gemini to analyze a support ticket description
    and return a suggested priority and category.
    """
    prompt = (
        "You are a support ticket classifier. Analyze the following support ticket description "
        "and classify it.\n\n"
        f"Description: {description}\n\n"
        "Return a JSON object with exactly these two keys:\n"
        '- "suggested_priority": one of "low", "medium", "high", "critical"\n'
        '- "suggested_category": one of "billing", "technical", "account", "general"\n'
    )

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_json_schema=CLASSIFICATION_SCHEMA,
                    temperature=0.2,
                ),
            )
            text = response.text.strip()

            # Remove markdown code fences if present (safety fallback)
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0].strip()

            result = json.loads(text)

            # Validate the returned values
            valid_priorities = ["low", "medium", "high", "critical"]
            valid_categories = ["billing", "technical", "account", "general"]

            priority = result.get("suggested_priority")
            category = result.get("suggested_category")

            if priority not in valid_priorities:
                priority = None
            if category not in valid_categories:
                category = None

            return {
                "suggested_priority": priority,
                "suggested_category": category,
            }

        except Exception as e:
            is_rate_limit = "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)
            if is_rate_limit and attempt < MAX_RETRIES:
                logger.warning(
                    "Rate limited (attempt %d/%d), retrying in %ds...",
                    attempt + 1,
                    MAX_RETRIES + 1,
                    RETRY_DELAY,
                )
                time.sleep(RETRY_DELAY)
                continue

            logger.error("Gemini classification error: %s", e, exc_info=True)
            return {
                "suggested_priority": None,
                "suggested_category": None,
            }
