from rest_framework.permissions import IsAuthenticated
from .serializers import ThreadSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ThreadCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)  # przypisujemy autora
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
