from rest_framework import serializers
from .models import Thread, Comment, CommentVote
from django.db.models import Sum

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['id', 'title', 'author', 'creation_time', 'is_public']
        read_only_fields = ['id', 'author', 'creation_time']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    likes = serializers.SerializerMethodField()
    dislikes = serializers.SerializerMethodField()
    author_rating = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'thread', 'author', 'content', 'created_at', 'likes', 'dislikes', 'author_rating']
        read_only_fields = ['id', 'thread', 'author', 'created_at']

    def get_likes(self, obj):
        return obj.votes.filter(value=1).count()

    def get_dislikes(self, obj):
        return obj.votes.filter(value=-1).count()

    def get_author_rating(self, obj):
        result = CommentVote.objects.filter(comment__author=obj.author).aggregate(score=Sum('value'))
        return result['score'] or 0