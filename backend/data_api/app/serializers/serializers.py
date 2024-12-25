from rest_framework import serializers
from ..models.models import *

class NodeSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    position = serializers.DictField()
    data = serializers.ListField()

class ConnectionSerializer(serializers.Serializer):
    id = serializers.CharField()
    sourceNodeId = serializers.CharField()
    sourcePortId = serializers.CharField()
    targetNodeId = serializers.CharField()
    targetPortId = serializers.CharField()

class PipelineSerializer(serializers.Serializer):
    nodes = NodeSerializer(many=True)
    connections = ConnectionSerializer(many=True) 