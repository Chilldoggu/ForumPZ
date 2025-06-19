from urllib import request
from rest_framework.permissions import IsAuthenticated
from .serializers import ThreadSerializer, CommentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Thread, Comment, Permission
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.generics import RetrieveAPIView


User = get_user_model()

class ThreadCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)  # przypisujemy autora
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ThreadDetailView(RetrieveAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # use the URL <id> to look up the thread

class PublicThreadListView(generics.ListAPIView):
    queryset = Thread.objects.filter(is_public=True)
    serializer_class = ThreadSerializer

class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid() and user_has_permission(user, thread):
            serializer.save(author=request.user, thread=thread)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, thread_id):
        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user_has_permission(user, thread):
            comments = Comment.objects.filter(thread=thread).order_by('created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "You don't have access to this thread."}, status=status.HTTP_404_NOT_FOUND)


class AllowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if thread.is_public:
            return Response({"error": "Cannot add users to a public thread."}, status=status.HTTP_400_BAD_REQUEST)

        #All users who have access to thread can add new users, but maybe only the author should be allowed to add new users, IDN
        if not user_has_permission(user, thread):
            return Response({"error": "You don't have permission to add users."}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        Permission.objects.get_or_create(thread=thread, user=new_user)

        return Response({"message": "User successfully added to the thread."}, status=status.HTTP_201_CREATED)


class DenyUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        user = request.user
        email_to_remove = request.data.get("email")

        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only the author of the thread can remove others
        if thread.author_id != user.id:
            return Response({"error": "You don't have permission to remove users."}, status=status.HTTP_403_FORBIDDEN)

        try:
            user_to_remove = User.objects.get(email=email_to_remove)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Remove permission if exists
        deleted, _ = Permission.objects.filter(thread=thread, user=user_to_remove).delete()

        if deleted:
            return Response({"success": f"User {email_to_remove} removed from thread."}, status=200)
        else:
            return Response({"error": "User does not have access to this thread."}, status=404)

class ListOfAllowedUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, thread_id):
        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        # Public threads don't need permission logic
        if thread.is_public:
            return Response({"info": "This is a public thread. All users can view it."})

        # Only the author can view allowed users
        if thread.author_id != request.user.id:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # Get allowed users
        # Now not returning permission for author cuz author don't have row in Permissions!!!!!!!!!!!!!!
        permissions = Permission.objects.filter(thread=thread).select_related('user')
        allowed_users = [{"id": p.user.id, "email": p.user.email} for p in permissions]

        return Response({"allowed_users": allowed_users})

def user_has_permission(user, thread):
    if thread.is_public:
        return True
    return Permission.objects.filter(thread=thread, user=user).exists() or thread.author == user

