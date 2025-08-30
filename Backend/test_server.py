import threading
import time
import requests
from app import app

def start_server():
    app.run(debug=False, host='0.0.0.0', port=8000, use_reloader=False)

def test_api():
    time.sleep(2)  # Wait for server to start
    try:
        response = requests.get('http://192.168.100.205:8000/all-stimuli')
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        data = response.json()
        if 'stimuli_videos' in data:
            if isinstance(data['stimuli_videos'], list):
                print(f"✅ API returns {len(data['stimuli_videos'])} videos as array")
                for i, video in enumerate(data['stimuli_videos']):
                    print(f"  Video {i+1}: {video.get('title', 'No title')}")
            else:
                print(f"❌ API returns count: {data['stimuli_videos']}")
        else:
            print("❌ API response missing 'stimuli_videos' key")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Start server in a separate thread
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Test the API
    test_api() 