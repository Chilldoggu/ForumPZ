from django.contrib import admin
from django.urls import path, include

from .views import RegisterAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    # ваши другие маршруты
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]