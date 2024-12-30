from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.utils import process_pipeline
from pymongo import MongoClient
from django.conf import settings
from .models import User
import jwt
from datetime import datetime, timedelta


class ExecutePipelineView(APIView):
    def post(self, request):
        try:
            result = process_pipeline(request.data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 
        
client = MongoClient("mongodb+srv://jefflu234:Ljun1216@user.hnigv.mongodb.net/users?retryWrites=true&w=majority&appName=User")  # You can store the Mongo URI in Django settings
db = client.get_database()
users_collection = db.users

class SignupView(APIView):
    def post(self, request):

        try:
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            # if User.objects.filter(email=email).exists():
            #     return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            # Insert user data into MongoDB
            mongo_user = users_collection.insert_one({
                'email': email,
                'created_at': datetime.now()
            })

            # Create a Django user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                mongodb_id=str(mongo_user.inserted_id)  # Save the MongoDB ID
            )

            token = jwt.encode({'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=1)},
                               'your_secret_key', algorithm='HS256')

            return Response({
                'token': token,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            })

        except Exception as e:
            return Response({'error': f"Signup failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# Add this new view to test connection
class TestConnectionView(APIView):
    def get(self, request):
        try:
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ping')
            print("MongoDB connection successful!")
            return Response({"status": "Connected to MongoDB successfully!"})
        except ConnectionFailure:
            print("MongoDB connection failed!")
            return Response(
                {"error": "Server not available"}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
