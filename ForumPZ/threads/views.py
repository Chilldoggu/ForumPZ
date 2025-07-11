from urllib import request
from rest_framework.permissions import IsAuthenticated
from .serializers import ThreadSerializer, CommentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Thread, Comment, Permission, CommentVote
from django.contrib.auth import get_user_model
from rest_framework import generics, filters
from rest_framework.generics import RetrieveAPIView
from django.db.models import Q



User = get_user_model()

class ThreadCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)  # przypisujemy autora
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ThreadDetailView(APIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # use the URL <id> to look up the thread

class ThreadListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ThreadSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']  # Search only by title

    def get_queryset(self):
        user = self.request.user
        return Thread.objects.filter(
            Q(is_public=True) |
            Q(author=user) |
            Q(permissions__user=user)
        ).distinct()

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

        # If the thread is public, do not return allowed users
        if thread.is_public:
            return Response({"error": "Thread is public. All users can access it."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user has access to this thread
        if not user_has_permission(request.user, thread):
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # Collect all users with explicit permission
        permissions = Permission.objects.filter(thread=thread).select_related('user')
        allowed_user_emails = {p.user.email for p in permissions}

        # Always include the author's email
        allowed_user_emails.add(thread.author.email)

        # Return list of emails
        return Response(list(allowed_user_emails), status=status.HTTP_200_OK)



def user_has_permission(user, thread):
    if thread.is_public:
        return True
    return Permission.objects.filter(thread=thread, user=user).exists() or thread.author == user

class ThreadTitleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            thread = Thread.objects.get(id=id)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        if not user_has_permission(request.user, thread):
            return Response({"error": "You don't have access to this thread."}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            "title": thread.title,
            "is_public": thread.is_public,
            "is_owner": thread.author_id == request.user.id
        }, status=status.HTTP_200_OK)


class VoteCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        user = request.user
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

        value = request.data.get('value')
        if value not in [1, -1]:
            return Response({'error': 'Value must be 1 or -1'}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = CommentVote.objects.get_or_create(
            user=user,
            comment=comment,
            defaults={'value': value}
        )
        if not created:
            vote.value = value
            vote.save()

        return Response({'message': 'Vote recorded'}, status=status.HTTP_200_OK)