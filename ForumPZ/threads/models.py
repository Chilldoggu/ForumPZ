from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
User = get_user_model()

class Thread(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="threads")
    creation_time = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.title

# class Comment(models.Model):
#     thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='comments')
#     author = models.ForeignKey(User, on_delete=models.CASCADE)
#     content = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.author.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"