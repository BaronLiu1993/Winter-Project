from django.urls import path
from .views import ExecutePipelineView

urlpatterns = [
    path('execute-pipeline/', ExecutePipelineView.as_view(), name='execute-pipeline'),
] 