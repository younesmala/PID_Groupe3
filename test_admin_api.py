import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reservations.settings')
django.setup()

from django.test import Client  # noqa: E402
from django.contrib.auth.models import User  # noqa: E402
import json  # noqa: E402

# Get admin user
admin = User.objects.filter(username='admin').first()
if not admin:
    print("No admin user found!")
    exit(1)

# Create client and login
client = Client()
client.force_login(admin)

# Make request to API
response = client.get('/api/admin/reservations/')
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type')}")

if response.status_code == 200:
    data = json.loads(response.content)
    print(f"Number of reservations returned: {len(data) if isinstance(data, list) else '?'}")
    if isinstance(data, list) and len(data) > 0:
        print("\nFirst reservation:")
        print(json.dumps(data[0], indent=2, default=str))
else:
    print(f"Error: {response.content.decode()}")
