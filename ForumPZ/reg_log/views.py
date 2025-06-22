from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if not email or not password or not first_name or not last_name:
            return Response({'detail': 'Email, password, first name and last name are required.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists.'}, status=400)

        try:
            validate_password(password)
        except DjangoValidationError as e:
            return Response({'detail': 'weak password'}, status=400)

        user = User.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password(password)  # Encrypt password
        )

        return Response({'detail': 'User created successfully.'}, status=201)


class RegisterAPIView:
    pass