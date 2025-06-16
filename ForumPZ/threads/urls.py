from django.urls import path
from threads.views import ThreadCreateView, CommentCreateView

urlpatterns = [
    path('api/threads/create', ThreadCreateView.as_view(), name='create_thread'),
    path('api/threads/<int:thread_id>/comments/create/', CommentCreateView.as_view(), name='create-comment'),
]