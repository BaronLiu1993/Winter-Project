from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.models import data_object
from ..serializers.serializers import DataObjectSerializer
from rest_framework.decorators import api_view

#View for data_object that is returned as clean
@api_view(['GET', 'POST'])
def data_object_list(request):
    if request.method == 'GET':
        data_objects = data_object.objects.all()
        serializer = DataObjectSerializer(data_objects, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        file = request.FILES.get('file')
        file_type = file.name.split('.')[-1]  
        data_object = data_object.objects.create(
            file_name=file.name, 
            file_content=file.read(), 
            file_type=file_type,
            status='Pending'
        )
        return Response(DataObjectSerializer(data_object).data, status=status.HTTP_201_CREATED)
