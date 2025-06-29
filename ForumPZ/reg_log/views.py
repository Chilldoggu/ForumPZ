from decouple import config
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from .utils import generate_verification_link, generate_refresh_password_token
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import delete_old_unverified_users


User = get_user_model()

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Secured endpoint",
            "email": request.user.email
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        #delete unverified users
        deleted = delete_old_unverified_users()

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
            password=make_password(password),  # Encrypt password
            is_active = False  # Deactivate until email confirmed
        )

        verification_link = generate_verification_link(user)
        # Generate email verification link
        send_mail(
            subject="Verify Your Email",
            message=f"Click the link to verify your email: {verification_link}",
            from_email="forumpz80@gmail.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'detail': 'User created successfully, verify email'}, status=201)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'Blacklisted'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'Exception'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified successfully."}, status=200)
            else:
                return Response({"error": "Invalid token."}, status=400)
        except Exception as e:
            return Response({"error": "Verification failed."}, status=400)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            reset_link = generate_refresh_password_token(user)

            send_mail(
                subject="Reset your password",
                message=f"Click the link to reset your password: {reset_link}",
                from_email="forumpz80@gmail.com",
                recipient_list=[user.email],
            )
        except User.DoesNotExist:
            pass  # don't reveal if email exists

        return Response({"message": "If the email is valid, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({"error": "Invalid or expired token"}, status=400)

            new_password = request.data.get("password")

            try:
                validate_password(new_password)
            except DjangoValidationError as e:
                return Response({'detail': 'Weak password'}, status=400)

            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successful."})

        except Exception as e:
            return Response({"error": "Something went wrong."}, status=400)

