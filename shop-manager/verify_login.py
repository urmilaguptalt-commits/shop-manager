import urllib.request, urllib.parse, json

# Test login via API
data = urllib.parse.urlencode({'username': 'vaibhav', 'password': '1234'}).encode()
req = urllib.request.Request('http://localhost:8000/auth/login', data=data)
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        body = json.loads(r.read())
        if 'access_token' in body:
            print("LOGIN SUCCESS - credentials are working correctly")
        else:
            print("ERROR:", body)
except Exception as e:
    print("Could not reach server:", e)
