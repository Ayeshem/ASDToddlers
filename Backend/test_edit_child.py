import requests
import json

def test_edit_child():
    base_url = "http://192.168.100.205:8000"
    
    # Test 1: First get children to see what we have
    print("Testing Get Children...")
    try:
        response = requests.get(f"{base_url}/parent/2/children")
        print(f"Status: {response.status_code}")
        children = response.json()
        print(f"Children: {children}")
        
        if children:
            child_id = children[0]['id']
            print(f"Using child ID: {child_id}")
            
            # Test 2: Update the first child
            print("\nTesting Update Child...")
            update_data = {
                "name": "Updated Test Child",
                "dob": "2022-02-20"
            }
            
            response = requests.put(f"{base_url}/parent/2/child/{child_id}", json=update_data)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test 3: Get children again to see the update
            print("\nTesting Get Children After Update...")
            response = requests.get(f"{base_url}/parent/2/children")
            print(f"Status: {response.status_code}")
            print(f"Updated Children: {response.json()}")
            
        else:
            print("No children found to test with")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_edit_child() 