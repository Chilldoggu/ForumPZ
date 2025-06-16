from django.urls import path

from threads.views import ThreadCreateView

urlpatterns = [
    path('api/threads/create', ThreadCreateView.as_view(), name='create_thread'),
]