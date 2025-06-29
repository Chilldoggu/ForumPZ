# utils.py
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

def generate_verification_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

def generate_refresh_password_token(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    return f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"


def delete_old_unverified_users():
    threshold = timezone.now() - timedelta(minutes=10)
    unverified_users = User.objects.filter(is_active=False, date_joined__lt=threshold)
    deleted_count, _ = unverified_users.delete()
    return deleted_count