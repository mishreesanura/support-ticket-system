import json
import os
import sys

sys.path.insert(0, r"d:\support-ticket-system\backend")
os.chdir(r"d:\support-ticket-system\backend")

from dotenv import load_dotenv

load_dotenv()

from google import genai

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {bool(api_key)}")

client = genai.Client(api_key=api_key)

description = "I cannot login to my account"
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
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    print(f"Raw response: {response.text}")
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()
    result = json.loads(text)
    print(f"Parsed result: {result}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
