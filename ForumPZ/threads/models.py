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


class Comment(models.Model):
    thread = models.ForeignKey(Thread, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.thread}"


class Permission(models.Model):
    thread = models.ForeignKey(Thread, related_name='permissions', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('thread', 'user')

    def __str__(self):
        return f"Permission: {self.user} on Thread {self.thread.id}"
