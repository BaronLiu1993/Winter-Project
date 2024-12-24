from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models.models import Project, WhiteboardState
from ..serializers.serializers import ProjectSerializer, WhiteboardStateSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_collaborator(self, request, pk=None):
        project = self.get_object()
        user = request.data.get('user')
        if user:
            project.collaborators.add(user)
            project.save()
            return Response({'status': 'collaborator added'})
        return Response({'status': 'user not specified'}, status=400)

class WhiteboardStateViewSet(viewsets.ModelViewSet):
    queryset = WhiteboardState.objects.all()
    serializer_class = WhiteboardStateSerializer
    permission_classes = [permissions.IsAuthenticated]
