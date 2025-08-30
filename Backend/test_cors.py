import requests
import json

# Test the backend API
def test_backend():
    base_url = "http://192.168.100.205:8000"
    
    # Test home endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"Home endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error testing home endpoint: {e}")
    
    # Test session check endpoint
    try:
        response = requests.get(f"{base_url}/session-check")
        print(f"Session check: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error testing session check: {e}")

if __name__ == "__main__":
    test_backend() 