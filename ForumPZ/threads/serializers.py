from rest_framework import serializers
from .models import Thread

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['id', 'title', 'author', 'creation_time', 'is_public']
        read_only_fields = ['id', 'author', 'creation_time']