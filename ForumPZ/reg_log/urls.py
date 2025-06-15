from django.urls import path
from .views import RegisterView, ProtectedView, LogoutView, VerifyEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/protected/', ProtectedView.as_view(), name='protected'),
    path('api/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify_email'),
]