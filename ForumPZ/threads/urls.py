from django.urls import path
from threads.views import ThreadCreateView, CommentCreateView, ListCommentsView, AllowUserView, DenyUserView, ListOfAllowedUsersView, ThreadListView, ThreadDetailView

urlpatterns = [
    path('api/threads/create', ThreadCreateView.as_view(), name='create-thread'),
    path('api/threads/<int:id>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('api/threads/<int:thread_id>/comments/create/', CommentCreateView.as_view(), name='create-comment'),
    path('api/threads/<int:thread_id>/comments/', ListCommentsView.as_view(), name='list-thread-comments'),
    path('api/threads/<int:thread_id>/adduser/', AllowUserView.as_view(), name='add-user-to-private-thread'),
    path('api/threads/<int:thread_id>/removeuser/', DenyUserView.as_view(), name='remove-user-from-private-thread'),
    path('api/threads/<int:thread_id>/allowedusers/', ListOfAllowedUsersView.as_view(), name='list-of-allowed-users'),
    path('api/threads/', ThreadListView.as_view(), name='thread-list'),
]