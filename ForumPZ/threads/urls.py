from django.urls import path
from threads.views import ThreadCreateView, CommentCreateView, ListCommentsView

urlpatterns = [
    path('api/threads/create', ThreadCreateView.as_view(), name='create_thread'),
    path('api/threads/<int:thread_id>/comments/create/', CommentCreateView.as_view(), name='create-comment'),
    path('api/threads/<int:thread_id>/comments/', ListCommentsView.as_view(), name='list-thread-comments'),
]