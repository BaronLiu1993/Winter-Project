from django.db import models

class Pipeline(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    nodes = models.JSONField(default=list)
    connections = models.JSONField(default=list)

    def __str__(self):
        return f"Pipeline created at {self.created_at}" 
    
class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    mongodb_id = models.CharField(max_length=24, null=True, blank=True)  # MongoDB reference

    def __str__(self):
        return self.email