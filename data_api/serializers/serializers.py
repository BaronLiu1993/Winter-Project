# serializers.py
from rest_framework import serializers
from ..models.models import data_object

class DataObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = data_object
        fields = ['id', 'file_name', 'file_type', 'uploaded_at', 'status']
