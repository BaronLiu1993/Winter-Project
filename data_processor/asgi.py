"""
ASGI config for the combined Django project.

This configuration handles HTTP requests for `data_processor`
and WebSocket connections for `collaborative_whiteboard`.

For more information, see:
https://docs.djangoproject.com/en/stable/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from ..collaboration_api.routing.route import websocket_urlpatterns

# Set the default settings for the data_processor project (HTTP-based)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'data_processor.settings')

# HTTP application for data_processor
data_processor_http_application = get_asgi_application()

# Define the ASGI application
application = ProtocolTypeRouter({
    # HTTP requests are routed to data_processor
    "http": data_processor_http_application,

    # WebSocket requests are routed to collaborative_whiteboard
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns  # WebSocket routes for collaborative_whiteboard
        )
    ),
})
