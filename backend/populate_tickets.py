import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from tickets.models import Ticket

CATEGORIES = ["billing", "technical", "account", "general"]
PRIORITIES = ["low", "medium", "high", "critical"]
STATUSES = ["open", "in_progress", "resolved", "closed"]

TITLES = [
    "Login issue",
    "Payment failed",
    "Feature request",
    "Bug in dashboard",
    "Account access",
    "Refund request",
    "Upgrade plan",
    "API limit reached",
    "Password reset",
    "Integration error",
    "Slow performance",
    "Data export not working",
    "User permission issue",
    "Mobile app crash",
    "Invoice missing",
]

DESCRIPTIONS = [
    "I cannot login to my account even with correct credentials.",
    "My payment was declined but I was charged on my card.",
    "Please add dark mode to the application settings.",
    "The dashboard is not loading correctly on Safari.",
    "I lost access to my account after changing email.",
    "I would like a refund for the last month due to downtime.",
    "How can I upgrade my plan to the enterprise tier?",
    "I keep hitting the API limit even though I'm on pro plan.",
    "I didn't receive the password reset email after multiple tries.",
    "I'm getting a 500 error when trying to integrate with Slack.",
    "The application is running very slow today.",
    "When I try to export data to CSV, nothing happens.",
    "My colleague cannot access the shared project.",
    "The mobile app crashes immediately upon opening.",
    "I cannot find the invoice for last month's subscription.",
]

print("Creating 10 synthetic tickets...")

for _ in range(10):
    idx = random.randint(0, len(TITLES) - 1)
    title = TITLES[idx] if len(TITLES) > 0 else f"Ticket {_}"

    # Ensure unique titles if we pick randomly, or just pick randomly
    # Let's just create random variations
    title = random.choice(TITLES)
    description = random.choice(DESCRIPTIONS)
    category = random.choice(CATEGORIES)
    priority = random.choice(PRIORITIES)
    status = random.choice(STATUSES)

    # Create somewhat distinct data if duplicate titles picked
    ticket = Ticket.objects.create(
        title=title,
        description=description,
        category=category,
        priority=priority,
        status=status,
    )
    print(f"Created ticket: {ticket.title} ({ticket.status})")

print("Done!")
