# main/models.py

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    # Link UserProfile to a User model instance
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Additional fields
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', null=True, blank=True
    )

    def __str__(self):
        return self.user.username
