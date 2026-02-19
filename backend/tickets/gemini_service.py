import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")


def classify_ticket(description):
    """
    Uses Google Gemini to analyze a support ticket description
    and return a suggested priority and category.
    """
    prompt = (
        "You are a support ticket classifier. Analyze the following support ticket description "
        "and classify it.\n\n"
        f"Description: {description}\n\n"
        "Return ONLY a valid JSON object with exactly these two keys:\n"
        '- "suggested_priority": one of "low", "medium", "high", "critical"\n'
        '- "suggested_category": one of "billing", "technical", "account", "general"\n\n'
        "Do not include any other text, explanation, or markdown formatting. "
        "Return ONLY the JSON object."
    )

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Remove markdown code fences if present
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

    except (json.JSONDecodeError, Exception) as e:
        print(f"Gemini classification error: {e}")
        return {
            "suggested_priority": None,
            "suggested_category": None,
        }
