import requests
import json

def test_session():
    base_url = "http://192.168.100.205:8000"
    session = requests.Session()
    
    # Test 1: Login
    print("Testing Login...")
    login_data = {
        'email': 'parent@test.com',
        'password': 'password',
        'role': 'parent'
    }
    
    try:
        response = session.post(f"{base_url}/login", json=login_data)
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.json()}")
        print(f"Cookies: {dict(session.cookies)}")
    except Exception as e:
        print(f"Login Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Session Check
    print("Testing Session Check...")
    try:
        response = session.get(f"{base_url}/session-check")
        print(f"Session Check Status: {response.status_code}")
        print(f"Session Check Response: {response.json()}")
        print(f"Cookies: {dict(session.cookies)}")
    except Exception as e:
        print(f"Session Check Error: {e}")

if __name__ == "__main__":
    test_session() 