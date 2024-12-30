from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.utils import process_pipeline
from pymongo import MongoClient
from django.conf import settings
from .models import User
import jwt
from datetime import datetime, timedelta
from bcrypt import hashpw, gensalt

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
class SignupView(APIView):
    def post(self, request):
        try:
            # MongoClient inside the method to ensure it works during the post request
            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000  # Timeout after 5 seconds
            )
            db = client.get_database('users')
            users_collection = db.users

            email = request.data.get('email')
            password = request.data.get('password')

            hashed_password = hashpw(password.encode('utf-8'), gensalt())

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Insert user data into MongoDB
            mongo_user = users_collection.insert_one({
                'email': email,
                'password': hashed_password,
                'created_at': datetime.now()
            })

            # Create a Django user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=hashed_password,
                mongodb_id=str(mongo_user.inserted_id)  # Save the MongoDB ID
            )

            token = jwt.encode({'user_id': str(user.id), 'exp': datetime.utcnow() + timedelta(days=1)},
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

class LoginView(APIView):
    def post(self, request):
        try:
            # Get credentials from request
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Connect to MongoDB
            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            db = client.get_database('users')
            users_collection = db.users

            # Find user in MongoDB
            user_data = users_collection.find_one({'email': email})
            
            if not user_data:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            print(user_data)
            # Return user data
            
            token = jwt.encode({'user_id': str(user_data['_id']), 'exp': datetime.utcnow() + timedelta(days=1)},
                               'your_secret_key', algorithm='HS256')

            return Response({
                'token': token,
                'user': {
                    'email': user_data['email'],
                    'id': str(user_data['_id']),
                    'password': user_data['password']
                }
            });

        except Exception as e:
            return Response({'error': f"Login failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)