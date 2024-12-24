from rest_framework import serializers
from ..models.models import User, Project, WhiteboardState

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = Project
        fields = ['id', 'name', 'owner', 'collaborators', 'created_at']

class WhiteboardStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhiteboardState
        fields = ['project', 'data']
