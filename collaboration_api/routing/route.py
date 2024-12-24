from django.urls import path
from ..consumers.consumer import WhiteboardConsumer

websocket_urlpatterns = [
    path('ws/whiteboard/<str:project_id>/', WhiteboardConsumer.as_asgi()),
]
