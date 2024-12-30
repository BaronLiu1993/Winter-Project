from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    mongodb_id = models.CharField(max_length=24, blank=True, null=True)

    class Meta:
        db_table = 'auth_user'  # Use Django's default table name
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.email

class Pipeline(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    nodes = models.JSONField(default=list)
    connections = models.JSONField(default=list)

    def __str__(self):
        return f"Pipeline created at {self.created_at}"