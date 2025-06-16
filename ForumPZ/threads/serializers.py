from rest_framework import serializers
from .models import Thread, Comment

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['id', 'title', 'author', 'creation_time', 'is_public']
        read_only_fields = ['id', 'author', 'creation_time']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'thread', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'thread', 'author', 'created_at']