# serializers.py
from rest_framework import serializers
from ..models.models import data_object

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = data_object
        fields = [
            'id',
            'file_name',
            'file_type',
            'uploaded_at',
            'status',
            'cleaned_file_content',
        ]
        read_only_fields = ['id', 'uploaded_at', 'status', 'cleaned_file_content']
