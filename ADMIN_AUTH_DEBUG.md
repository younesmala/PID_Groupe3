# Frontend Session Cookie Debug & Logging

The most likely issue causing "Authentication credentials were not provided" is one of:

## 1. Session Cookie Not Being Sent
```javascript
// Check in browser DevTools Network tab:
// - Look for a request to /api/admin/users/
// - Go to the "Cookies" tab to see if sessionid is present
// - If sessionid is missing, the backend can't authenticate
```

## 2. Session Not Persisting After Login
The login endpoint creates a session, but the session might:
- Not be saved to the browser's cookies
- Be cleared immediately after  
- Not survive between page navigation requests

## 3. User Not Admin on Backend
```python
# Backend check during admin request:
# IsAdminUser permission requires:
user.is_authenticated == True
AND
(user.is_staff == True OR user.is_superuser == True)
```

If the logged-in user doesn't have `is_staff=True`, the request will fail.

## Frontend Changes Made

Three admin pages (AdminUsers, AdminProducers, AdminReservations) now have:

1. **Better Error Messages**: 401 and 403 errors show diagnostic information
2. **Session Debugging**: Console logs show:
   - If CSRF token exists
   - If sessionid cookie is present
   - HTTP status codes and error responses

3. **Console Logs** (visible in DevTools):
   ```
   [adminApi] GET /admin/users/
   {hasCsrfToken: true, hasSessionCookie: true}
   
   [adminApi] Authentication failed (401)
   {path: '/admin/users/', status: 401, ...}
   ```

## Testing Steps

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Go to Console tab**: Look for `[adminApi]` logs
3. **Go to Network tab**: Filter by "admin" and check cookie headers
4. **Login and check**:
   - Is sessionid cookie set? (Cookies tab in Network)
   - Do admin requests include sessionid? (Headers tab in Network)
   - What error message does the backend return?

## Most Likely Problem: User Not Admin

If frontend allows access to admin pages but backend rejects it:
- Frontend checks: `user.is_staff === true` 
- But user might not be actually admin on the backend database

**Solution**: 
```bash
# In Django shell:
python manage.py shell
from django.contrib.auth.models import User
user = User.objects.get(username='admin')
print(f"is_staff: {user.is_staff}, is_superuser: {user.is_superuser}")
# If False, run:
user.is_staff = True
user.is_superuser = True
user.save()
```
