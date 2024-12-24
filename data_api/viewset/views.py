from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.models import UploadedFile
from ..serializers.serializers import UploadedFileSerializer
from ..utils.utils import 

class FileUploadView(APIView):
    def post(self, request):
        file = request.FILES['file']
        file_type = request.data.get('file_type')
        user_prompt = request.data.get('user_prompt', "Clean and analyze this data.")

        if not file_type:
            return Response({"error": "File type is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save file to MongoDB
            uploaded_file = UploadedFile.objects.create(
                file_name=file.name,
                file_content=file.read(),
                file_type=file_type,
                status='Processing',
            )

            # Parse file data
            file_binary = BytesIO(uploaded_file.file_content)
            if file_type == 'csv':
                parsed_data = pd.read_csv(file_binary)
            elif file_type == 'json':
                parsed_data = pd.read_json(file_binary)
            else:
                return Response({"error": f"Unsupported file type: {file_type}"}, status=status.HTTP_400_BAD_REQUEST)

            # Load data into Apache Spark
            spark_df = load_data_to_apache_spark(parsed_data)

            # Analyze data and determine actions
            actions = analyze_data_and_determine_actions(spark_df, user_prompt)

            # Clean data using LangChain
            openai_api_key = " "
            cleaned_data = clean_data_with_langchain(parsed_data, actions, openai_api_key)

            # Convert cleaned data back to binary
            cleaned_file_binary = BytesIO()
            if file_type == 'csv':
                cleaned_data.to_csv(cleaned_file_binary, index=False)
            elif file_type == 'json':
                cleaned_data.to_json(cleaned_file_binary)
            else:
                raise ValueError("Unsupported file type for cleaning.")

            cleaned_file_binary.seek(0)
            uploaded_file.cleaned_file_content = cleaned_file_binary.read()
            uploaded_file.status = 'Completed'
            uploaded_file.save()

            return Response(UploadedFileSerializer(uploaded_file).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            uploaded_file.status = 'Failed'
            uploaded_file.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        try:
            # Retrieve the uploaded file from MongoDB
            uploaded_file = UploadedFile.objects.get(pk=pk)
            if not uploaded_file.cleaned_file_content:
                return Response({"error": "Cleaned file not available."}, status=status.HTTP_404_NOT_FOUND)

            # Load cleaned file content into a Spark DataFrame
            file_binary = BytesIO(uploaded_file.cleaned_file_content)
            if uploaded_file.file_type == 'csv':
                cleaned_data = pd.read_csv(file_binary)
            elif uploaded_file.file_type == 'json':
                cleaned_data = pd.read_json(file_binary)
            else:
                return Response({"error": f"Unsupported file type: {uploaded_file.file_type}"}, status=status.HTTP_400_BAD_REQUEST)

            spark_df = load_data_to_apache_spark(cleaned_data)

            # Optionally show the Spark DataFrame (if debugging)
            spark_df.show()

            # Return confirmation and DataFrame metadata
            return Response({
                "file_name": uploaded_file.file_name,
                "spark_schema": spark_df.schema.simpleString(),
                "row_count": spark_df.count(),
                "message": "The cleaned dataset is loaded into Spark."
            }, status=status.HTTP_200_OK)
        except UploadedFile.DoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
