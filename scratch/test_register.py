import requests, json, sys
url='http://127.0.0.1:8000/api/v1/auth/register'
payload={
    "full_name":"Test User",
    "email":"test5@example.com",
    "phone":"+1234567890",
    "password":"Password123!",
    "role":"citizen"
}
resp=requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Body:', resp.text)
