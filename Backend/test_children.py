# import requests
# import json

# def test_children_api():
#     base_url = "http://192.168.100.205:8000"
    
#     # Test 1: Add a child
#     print("Testing Add Child...")
#     child_data = {
#         "name": "Test Child",
#         "dob": "2022-01-15"
#     }
    
#     try:
#         response = requests.post(f"{base_url}/parent/2/child", json=child_data)
#         print(f"Status: {response.status_code}")
#         print(f"Response: {response.json()}")
#     except Exception as e:
#         print(f"Error: {e}")
    
#     print("\n" + "="*50 + "\n")
    
#     # Test 2: Get children for parent
#     print("Testing Get Children...")
#     try:
#         response = requests.get(f"{base_url}/parent/2/children")
#         print(f"Status: {response.status_code}")
#         print(f"Response: {response.json()}")
#     except Exception as e:
#         print(f"Error: {e}")
    
#     print("\n" + "="*50 + "\n")
    
#     # Test 3: Get all children
#     print("Testing Get All Children...")
#     try:
#         response = requests.get(f"{base_url}/children")
#         print(f"Status: {response.status_code}")
#         print(f"Response: {response.json()}")
#     except Exception as e:
#         print(f"Error: {e}")

# if __name__ == "__main__":
#     test_children_api() 









import requests
import json

def test_children_api():
    base_url = "http://127.0.0.1:8000"   # use localhost
    
    # Test 1: Add a child with photo
    print("Testing Add Child with photo...")
    child_data = {
        "name": "Test Child",
        "dob": "2022-01-15"
    }

    try:
        with open("test_baby.jpg", "rb") as f:
            files = {"photo": f}
            response = requests.post(f"{base_url}/parent/2/child", data=child_data, files=files)
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except Exception:
            print(f"Raw Response: {response.text}")
    except FileNotFoundError:
        print("Error: test_baby.jpg not found in current directory.")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Get children for parent
    print("Testing Get Children...")
    try:
        response = requests.get(f"{base_url}/parent/2/children")
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except Exception:
            print(f"Raw Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Count all children
    print("Testing Count Children...")
    try:
        response = requests.get(f"{base_url}/children/count")
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except Exception:
            print(f"Raw Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_children_api()
