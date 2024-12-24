from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class User(models.Model):
    id = models.AutoField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length = 30)
    def __str__(self):
        return self.name

class Project(models.Model):
    id = models.AutoField()
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_projects")
    collaborators = models.ManyToManyField(User, related_name="collaborating_projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class WhiteboardState(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="whiteboard_state")
    data = models.JSONField(default=dict)  