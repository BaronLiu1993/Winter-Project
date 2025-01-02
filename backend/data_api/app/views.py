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
from bson.objectid import ObjectId

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
        
class NewProjectView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            project_name = request.data.get('project_name')
            collaborators = request.data.get('collaborators')
            is_public = request.data.get('is_public')

            if not user_id or not project_name:
                return Response({'error': 'User ID and project name are required'}, status=status.HTTP_400_BAD_REQUEST)

            client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            db = client.get_database('projects')
            projects_collection = db.projects

            project_id = projects_collection.insert_one({
                'user_id': user_id,
                'project_name': project_name,
                'created_at': datetime.now(),
                'nodes': [],
                'connections': [],
                'collaborators': collaborators,
                'is_public': is_public
            })

            return Response({'project_id': str(project_id.inserted_id)}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f"New project failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class AllUsersView(APIView):
    def get(self, request):
        try:
            client = MongoClient(settings.MONGODB_URI)
            db = client.get_database('users')
            users_collection = db.users

            # Get all users but only return email and id
            users = users_collection.find(
                {},
                {'email': 1}  # Only return email field
            )

            users_list = [{'email': user['email'], 'id': str(user['_id'])} for user in users]
            return Response({'users': users_list})

        except Exception as e:
            return Response(
                {'error': f"Failed to fetch users: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
class AllProjectsView(APIView):
    def get(self, request):
        try:
            client = MongoClient(settings.MONGODB_URI)
            db = client.get_database('projects')
            projects_collection = db.projects

            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Find projects and convert cursor to list
            projects = list(projects_collection.find({'user_id': user_id}))
            
            # Convert ObjectId to string and format the response
            projects_list = [{
                'id': str(project['_id']),
                'name': project['project_name'],
                'created_at': project['created_at'].isoformat(),
                'is_public': project.get('is_public', False),
                'collaborators': project.get('collaborators', [])
            } for project in projects]

            return Response({'projects': projects_list})

        except Exception as e:
            return Response(
                {'error': f"Failed to fetch projects: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteProjectView(APIView):
    def delete(self, request):
        try:
            project_id = request.query_params.get('project_id')
            if not project_id:
                return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            client = MongoClient(settings.MONGODB_URI)
            db = client.get_database('projects')
            projects_collection = db.projects

            result = projects_collection.delete_one({'_id': ObjectId(project_id)})
            if result.deleted_count == 1:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(
                {'error': f"Failed to delete project: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OpenWhiteBoardView(APIView):
    def get(self, request):
        try:
            project_id = request.query_params.get('project_id')
            if not project_id:
                return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            client = MongoClient(settings.MONGODB_URI)
            db = client.get_database('projects')
            projects_collection = db.projects

            project = projects_collection.find_one({'_id': ObjectId(project_id)})
            if not project:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

            return Response({'project': project})

        except Exception as e:
            return Response(
                {'error': f"Failed to open whiteboard: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
