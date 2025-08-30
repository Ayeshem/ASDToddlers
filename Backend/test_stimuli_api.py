import requests
import json

def test_stimuli_api():
    base_url = "http://192.168.100.205:8000"
    
    print("=== Testing Stimuli API ===\n")
    
    # Test 1: Get all stimuli
    print("1. Testing Get All Stimuli...")
    try:
        response = requests.get(f"{base_url}/all-stimuli")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        
        if 'stimuli_videos' in data:
            print(f"Found {len(data['stimuli_videos'])} stimuli videos")
        else:
            print("No stimuli_videos key in response")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Add a new stimuli
    print("\n2. Testing Add Stimuli...")
    try:
        new_stimuli = {
            "title": "Test Social Interaction Video",
            "description": "A test video for social interaction assessment",
            "category": "Social Interaction",
            "duration": "120",
            "video_url": "/stimuli/test_video.mp4"
        }
        
        response = requests.post(f"{base_url}/add-stimuli", json=new_stimuli)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Get all stimuli again to see the new one
    print("\n3. Testing Get All Stimuli After Add...")
    try:
        response = requests.get(f"{base_url}/all-stimuli")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        
        if 'stimuli_videos' in data and data['stimuli_videos']:
            # Get the first stimuli for update/delete tests
            first_stimuli = data['stimuli_videos'][0]
            stimuli_id = first_stimuli['id']
            print(f"Using stimuli ID: {stimuli_id}")
            
            # Test 4: Get single stimuli
            print(f"\n4. Testing Get Single Stimuli (ID: {stimuli_id})...")
            response = requests.get(f"{base_url}/stimuli/{stimuli_id}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test 5: Update stimuli
            print(f"\n5. Testing Update Stimuli (ID: {stimuli_id})...")
            update_data = {
                "title": "Updated Test Video",
                "description": "Updated description for testing",
                "category": "Geometric Patterns",
                "duration": "180",
                "video_url": "/stimuli/updated_test_video.mp4"
            }
            
            response = requests.put(f"{base_url}/stimuli/{stimuli_id}", json=update_data)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test 6: Get single stimuli after update
            print(f"\n6. Testing Get Single Stimuli After Update (ID: {stimuli_id})...")
            response = requests.get(f"{base_url}/stimuli/{stimuli_id}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test 7: Delete stimuli
            print(f"\n7. Testing Delete Stimuli (ID: {stimuli_id})...")
            response = requests.delete(f"{base_url}/stimuli/{stimuli_id}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test 8: Get all stimuli after delete
            print("\n8. Testing Get All Stimuli After Delete...")
            response = requests.get(f"{base_url}/all-stimuli")
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
        else:
            print("No stimuli found to test with")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stimuli_api() 