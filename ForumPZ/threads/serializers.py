from rest_framework import serializers
from .models import Thread, Comment

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['id', 'title', 'author', 'creation_time', 'is_public']
        read_only_fields = ['id', 'author', 'creation_time']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    likes = serializers.SerializerMethodField()
    dislikes = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'thread', 'author', 'content', 'created_at', 'likes', 'dislikes']
        read_only_fields = ['id', 'thread', 'author', 'created_at']

    def get_likes(self, obj):
        return obj.votes.filter(value=1).count()

    def get_dislikes(self, obj):
        return obj.votes.filter(value=-1).count()