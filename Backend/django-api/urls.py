# Backend/django-api/urls.py

from django.urls import path
from views import ScriptGenerationView

urlpatterns = [
    path('generate-script/', ScriptGenerationView.as_view(), name='generate-script'),
]