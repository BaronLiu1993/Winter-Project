# Backend/django-api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from serializers import SERIALIZER_REGISTRY  # Adjusted path for serializers
from Backend.scriptBuilder import SCRIPT_GENERATOR_REGISTRY  # Import registry from __init__.py

class ScriptGenerationView(APIView):
    def post(self, request):
        # Extract script_type to determine the correct serializer and generator
        script_type = request.data.get("script_type")
        if not script_type:
            return Response({"error": "Missing script_type"}, status=status.HTTP_400_BAD_REQUEST)

        # Get serializer and generator class dynamically
        serializer_class = SERIALIZER_REGISTRY.get(script_type)
        generator_class = SCRIPT_GENERATOR_REGISTRY.get(script_type)

        if not serializer_class or not generator_class:
            return Response({"error": f"Invalid script_type: {script_type}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the payload
        serializer = serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Generate the script
        generator = generator_class(serializer.validated_data)
        generated_script = generator.generate_script()

        return Response({"generated_script": generated_script}, status=status.HTTP_200_OK)
