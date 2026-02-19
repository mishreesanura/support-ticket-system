from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer
from .gemini_service import classify_ticket


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Ticket.objects.all().order_by("-created_at")

        # Manual filtering by status, priority, category
        status_filter = self.request.query_params.get("status")
        priority_filter = self.request.query_params.get("priority")
        category_filter = self.request.query_params.get("category")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        if category_filter:
            queryset = queryset.filter(category=category_filter)

        return queryset

    @action(detail=False, methods=["post"], url_path="classify")
    def classify(self, request):
        """
        POST /api/tickets/classify/
        Accepts a description and returns AI-suggested priority and category.
        """
        description = request.data.get("description", "")

        if not description:
            return Response(
                {"error": "Description is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = classify_ticket(description)
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        GET /api/tickets/stats/
        Returns aggregated ticket statistics using Django ORM.
        """
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status="open").count()

        priority_breakdown = list(
            Ticket.objects.values("priority")
            .annotate(count=Count("id"))
            .order_by("priority")
        )

        category_breakdown = list(
            Ticket.objects.values("category")
            .annotate(count=Count("id"))
            .order_by("category")
        )

        tickets_per_day = list(
            Ticket.objects.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        return Response(
            {
                "total_tickets": total_tickets,
                "open_tickets": open_tickets,
                "priority_breakdown": priority_breakdown,
                "category_breakdown": category_breakdown,
                "tickets_per_day": tickets_per_day,
            },
            status=status.HTTP_200_OK,
        )
