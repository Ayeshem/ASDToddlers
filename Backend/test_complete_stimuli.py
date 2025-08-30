import requests
import json

def test_complete_stimuli_system():
    base_url = "http://192.168.100.205:8000"
    
    print("=== Complete Stimuli System Test ===\n")
    
    # Test 1: Get all stimuli
    print("1. Testing Get All Stimuli...")
    try:
        response = requests.get(f"{base_url}/all-stimuli")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if 'stimuli_videos' in data and isinstance(data['stimuli_videos'], list):
            print(f"✅ Found {len(data['stimuli_videos'])} videos with full details")
            for i, video in enumerate(data['stimuli_videos']):
                print(f"  Video {i+1}: {video['title']} ({video['category']})")
        else:
            print("❌ Response format is incorrect")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Add a new stimuli
    print("\n2. Testing Add Stimuli...")
    try:
        new_stimuli = {
            "title": "Test Video for Frontend",
            "description": "A test video to verify frontend integration",
            "category": "Social Interaction",
            "duration": "180",
            "video_url": "/stimuli/test_frontend_video.mp4"
        }
        
        response = requests.post(f"{base_url}/add-stimuli", json=new_stimuli)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Stimuli added successfully")
        else:
            print("❌ Failed to add stimuli")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get all stimuli again
    print("\n3. Testing Get All Stimuli After Add...")
    try:
        response = requests.get(f"{base_url}/all-stimuli")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if 'stimuli_videos' in data and isinstance(data['stimuli_videos'], list):
            print(f"✅ Now have {len(data['stimuli_videos'])} videos")
            
            # Test 4: Get single stimuli
            if data['stimuli_videos']:
                first_video = data['stimuli_videos'][0]
                video_id = first_video['id']
                print(f"\n4. Testing Get Single Stimuli (ID: {video_id})...")
                
                response = requests.get(f"{base_url}/stimuli/{video_id}")
                print(f"Status: {response.status_code}")
                print(f"Response: {json.dumps(response.json(), indent=2)}")
                
                if response.status_code == 200:
                    print("✅ Single stimuli retrieved successfully")
                else:
                    print("❌ Failed to get single stimuli")
        else:
            print("❌ No videos found to test with")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Test video serving
    print("\n5. Testing Video Serving...")
    try:
        # Test serving a video file
        response = requests.get(f"{base_url}/stimuli/test_video.mp4")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Video serving works")
        elif response.status_code == 404:
            print("⚠️  Video file not found (this is normal if file doesn't exist)")
        else:
            print(f"❌ Video serving failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_complete_stimuli_system() 