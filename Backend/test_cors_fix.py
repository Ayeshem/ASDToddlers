import requests
import json

def test_cors_fix():
    base_url = "http://192.168.100.205:8000"
    
    # Test 1: Simple GET request
    print("Testing GET /")
    try:
        response = requests.get(f"{base_url}/")
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: POST request with CORS headers
    print("Testing POST /login")
    try:
        headers = {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:8081'
        }
        data = {
            'email': 'test@example.com',
            'password': 'password',
            'role': 'parent'
        }
        response = requests.post(f"{base_url}/login", 
                               headers=headers, 
                               json=data)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: OPTIONS request (preflight)
    print("Testing OPTIONS /login")
    try:
        headers = {
            'Origin': 'http://localhost:8081',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{base_url}/login", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cors_fix() 