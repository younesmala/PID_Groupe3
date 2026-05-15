# Producer Request System - Complete Codebase Analysis

## 1. Database Models & Role Management

### UserProfile Model
**File:** [api/models.py](api/models.py#L1-L25)

```python
class UserProfile(models.Model):
    ROLES = [
        ('USER', 'Utilisateur'),
        ('PRODUCER', 'Producteur'),
        ('ADMIN', 'Admin'),
        ('PRESS_CRITIC', 'Critique de presse'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLES, default='USER')
    is_deleted = models.BooleanField(default=False)
```

**Key Features:**
- Stores user roles: USER, PRODUCER, ADMIN, PRESS_CRITIC
- `is_deleted` field tracks if a producer/critic account has been deleted by admin
- Auto-created via Django signal when User is created
- Status determined by: `is_deleted` (deleted) → `user.is_active` (pending/approved)

---

## 2. Front-End Signup Form (Role Selection)

### Signup Component
**File:** [frontend/src/pages/Signup.jsx](frontend/src/pages/Signup.jsx#L1-L350)

**Key Section - Role Radio Buttons:**
```jsx
const [roleRequest, setRoleRequest] = useState('USER')

// In form JSX (lines 260-280):
<div className="account-request-options">
  <label className="account-request-option">
    <input
      type="radio"
      name="roleRequest"
      value="PRODUCER"
      checked={roleRequest === 'PRODUCER'}
      onChange={() => setRoleRequest('PRODUCER')}
    />
    <span>{t('signup.request_producer')}</span>
  </label>

  <label className="account-request-option">
    <input
      type="radio"
      name="roleRequest"
      value="PRESS_CRITIC"
      checked={roleRequest === 'PRESS_CRITIC'}
      onChange={() => setRoleRequest('PRESS_CRITIC')}
    />
    <span>{t('signup.request_press_critic')}</span>
  </label>
</div>
```

**Form Submission (lines 160-180):**
```jsx
async function handleSubmit(event) {
  event.preventDefault()
  setSubmitted(true)
  setServerError('')
  setSuccess('')
  if (!isFormValid) return
  setLoading(true)
  try {
    await signup({
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      password: form.password,
      confirm_password: form.passwordConfirm,
      language: form.language,
      role,  // ← Sends selected role to backend
    })
```

---

## 3. Backend Signup API

### AuthSignupView
**File:** [api/views/auth.py](api/views/auth.py#L28-L110)

**Key Logic:**
```python
class AuthSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        # ... validation code ...
        
        # Extract role from request (defaults to 'USER')
        role = data.get('role', 'USER')
        if role not in ('USER', 'PRODUCER', 'PRESS_CRITIC'):
            role = 'USER'

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        # If requesting producer or critic role: set is_active=False (pending approval)
        if role in ('PRODUCER', 'PRESS_CRITIC'):
            user.is_active = False
            user.save(update_fields=['is_active'])

        # Set the role on UserProfile
        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.save()
        else:
            UserProfile.objects.update_or_create(user=user, defaults={'role': role})
```

**Key Behavior:**
- Producer/Press Critic requests: `is_active=False` (pending)
- Regular users: `is_active=True` (active immediately)
- Role is stored in UserProfile model

---

## 4. Admin Producers Management API

### Admin Endpoints
**File:** [api/urls.py](api/urls.py#L162-L164)

```python
path('admin/producers/', admin_api.AdminPendingProducersView.as_view(), name='admin-producers'),
path('admin/producers/<int:id>/', admin_api.AdminPendingProducerDetailView.as_view(), name='admin-producer-detail'),
```

### AdminPendingProducersView (List)
**File:** [api/views/admin_api.py](api/views/admin_api.py#L187-L220)

```python
class AdminPendingProducersView(APIView):
    permission_classes = [IsAdminUser]

    REQUEST_ROLES = ('PRODUCER', 'PRESS_CRITIC')

    @staticmethod
    def _serialize_profile(profile):
        return {
            'id': profile.user.id,
            'name': (
                f"{profile.user.first_name} {profile.user.last_name}".strip()
                or profile.user.username
            ),
            'email': profile.user.email,
            'role': profile.role,
            'status': (
                'deleted'
                if profile.is_deleted
                else ('approved' if profile.user.is_active else 'pending')
            ),
        }

    def get(self, request):
        # Fetch all profiles with PRODUCER or PRESS_CRITIC role
        profiles = (
            UserProfile.objects
            .select_related('user')
            .filter(role__in=self.REQUEST_ROLES)
            .order_by('user__id')
        )

        data = [self._serialize_profile(profile) for profile in profiles]
        return Response(data)
```

### AdminPendingProducerDetailView (Approve/Delete)
**File:** [api/views/admin_api.py](api/views/admin_api.py#L224-L290)

```python
class AdminPendingProducerDetailView(APIView):
    permission_classes = [IsAdminUser]

    REQUEST_ROLES = AdminPendingProducersView.REQUEST_ROLES

    def _get_producer(self, id):
        return get_object_or_404(
            User.objects.select_related('profile'),
            id=id,
            profile__role__in=self.REQUEST_ROLES,
        )

    def patch(self, request, id):
        # APPROVE PRODUCER
        user = self._get_producer(id)
        if user.profile.is_deleted:
            return Response(
                {'detail': 'This producer has been deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True  # Activate the user
        user.save(update_fields=['is_active'])
        return Response({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'role': user.profile.role,
            'status': 'approved',
        })

    def delete(self, request, id):
        # DELETE/REJECT PRODUCER
        user = self._get_producer(id)
        if user.profile.is_deleted:
            return Response(
                {'detail': 'This producer has already been deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.set_unusable_password()
        user.save(update_fields=['is_active', 'password'])
        user.profile.is_deleted = True
        user.profile.save(update_fields=['is_deleted'])

        return Response({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'role': user.profile.role,
            'status': 'deleted',
        })
```

---

## 5. Frontend Admin Producers Page

### Admin Producers Component
**File:** [frontend/src/pages/AdminProducers.jsx](frontend/src/pages/AdminProducers.jsx#L1-L350)

**Key Actions:**

```jsx
export default function AdminProducers() {
  const [producers, setProducers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  // Load all producers (pending and approved)
  async function loadProducers() {
    try {
      const res = await adminApiFetch('/admin/producers/')
      const data = await parseAdminResponse(res, t('admin.producers_error_load'))
      setProducers(sortByNewestId(Array.isArray(data) ? data : []))
    } catch (err) {
      setError(err.message || t('admin.producers_error_load'))
    } finally {
      setLoading(false)
    }
  }

  // Approve a producer request
  async function handleApprove(producerId) {
    setWorkingId(producerId)
    try {
      const res = await adminApiFetch(`/admin/producers/${producerId}/`, {
        method: 'PATCH',  // ← Approve
      })
      const data = await parseAdminResponse(res, t('admin.producers_error_approve'))

      setProducers((prev) =>
        sortByNewestId(
          prev.map((producer) =>
            producer.id === producerId ? { ...producer, status: 'approved' } : producer,
          ),
        ),
      )
    } catch (err) {
      setError(err.message || t('admin.producers_error_approve'))
    } finally {
      setWorkingId(null)
    }
  }

  // Reject/delete a producer request
  async function handleDelete(producerId) {
    setWorkingId(producerId)
    try {
      const res = await adminApiFetch(`/admin/producers/${producerId}/`, {
        method: 'DELETE',  // ← Reject
      })

      setProducers((prev) =>
        sortByNewestId(
          prev.map((producer) =>
            producer.id === producerId ? { ...producer, status: 'deleted' } : producer,
          ),
        ),
      )
    } catch (err) {
      setError(err.message || t('admin.producers_error_delete'))
    } finally {
      setWorkingId(null)
    }
  }
}
```

**Styling File:** [frontend/src/pages/AdminProducers.css](frontend/src/pages/AdminProducers.css)

---

## 6. Producer Check in Views

### Producer Guard
**File:** [api/views/artists.py](api/views/artists.py#L18-L22)

```python
def _is_producer(request):
    if not request.user.is_authenticated or request.user.is_staff:
        return False
    return UserProfile.objects.filter(user=request.user, role='PRODUCER').exists()
```

**File:** [api/views/producer.py](api/views/producer.py#L1-L50)

```python
def _producer_guard(request):
    # Check if user is authenticated and has PRODUCER role
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Vous devez être connecté"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    # Check if user has PRODUCER role in UserProfile
    ...
```

---

## 7. Producer Spaces (After Approval)

### Producer Shows Management
**File:** [api/views/producer.py](api/views/producer.py#L59-L130)

```python
class ProducerShowsView(APIView):
    # Endpoint: /producer/shows/
    # Requires: Is authenticated + has PRODUCER role
    
    def get(self, request):
        guard = _producer_guard(request)
        if guard is not None:
            return guard
        shows = Show.objects.filter(producer=request.user).order_by("-created_at")
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Create new show as producer
        ...
```

### Frontend Producer Page
**File:** [frontend/src/pages/ProducerShows.jsx](frontend/src/pages/ProducerShows.jsx#L1-L250)

---

## 8. Database Migrations

### Initial UserProfile Creation
**File:** [api/migrations/0002_userprofile.py](api/migrations/0002_userprofile.py)
- Creates UserProfile model with role field

### Add is_deleted Field
**File:** [api/migrations/0003_userprofile_is_deleted.py](api/migrations/0003_userprofile_is_deleted.py)
- Adds is_deleted field for soft delete

### Add PRESS_CRITIC Role
**File:** [api/migrations/0005_press_critic_role.py](api/migrations/0005_press_critic_role.py)
- Adds PRESS_CRITIC as a role option

---

## 9. Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER SIGNUP WITH PRODUCER REQUEST                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Frontend: User selects "Become a Producer" radio button         │
│     → Signup.jsx sets roleRequest = 'PRODUCER'                     │
│                                                                     │
│  2. Frontend: Submit form with role parameter                      │
│     → AuthService.signup() POSTs to /api/auth/signup/              │
│                                                                     │
│  3. Backend: AuthSignupView.post()                                 │
│     → Creates User with is_active=False (pending)                  │
│     → Creates/Updates UserProfile with role='PRODUCER'            │
│     → Sends welcome email                                          │
│                                                                     │
│  4. Admin: Views pending producers at /fr/admin/producers          │
│     → AdminProducers.jsx calls /admin/producers/ (GET)             │
│     → Admin sees list of pending requests                          │
│                                                                     │
│  5. Admin: Approves or Rejects                                     │
│     APPROVE: PATCH /admin/producers/{id}/ → is_active=True       │
│     REJECT:  DELETE /admin/producers/{id}/ → is_deleted=True      │
│                                                                     │
│  6. Approved Producers: Can use /producer/shows/ endpoints         │
│     → Create, edit, publish shows                                  │
│     → Manage reservations                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Status Mapping

| State | is_active | is_deleted | role | Status Label |
|-------|-----------|-----------|------|--------------|
| Pending Request | False | False | PRODUCER/PRESS_CRITIC | "pending" |
| Approved | True | False | PRODUCER/PRESS_CRITIC | "approved" |
| Rejected/Deleted | False | True | PRODUCER/PRESS_CRITIC | "deleted" |
| Regular User | True | False | USER | N/A |

---

## Summary of Key Files

| Layer | File | Purpose |
|-------|------|---------|
| **Database** | `api/models.py` | UserProfile model with role & is_deleted fields |
| **API - Auth** | `api/views/auth.py` | AuthSignupView: handles role in signup |
| **API - Admin** | `api/views/admin_api.py` | AdminPendingProducersView, AdminPendingProducerDetailView |
| **API - URLs** | `api/urls.py` | Routes for `/admin/producers/` endpoints |
| **Frontend - Signup** | `frontend/src/pages/Signup.jsx` | Role selection in signup form |
| **Frontend - Admin** | `frontend/src/pages/AdminProducers.jsx` | Admin interface for approving/rejecting |
| **Frontend - Producer** | `frontend/src/pages/ProducerShows.jsx` | Producer space (after approval) |
| **Backend - Producer** | `api/views/producer.py` | Producer endpoints (shows, reviews, etc.) |

