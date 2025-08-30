from app import app
from database import StimuliVideo

with app.app_context():
    print("=== Debug Stimuli Endpoint ===")
    
    # Test database directly
    videos = StimuliVideo.query.all()
    print(f"Database has {len(videos)} videos")
    
    for i, video in enumerate(videos):
        print(f"Video {i+1}: {video.title} ({video.category})")
    
    # Test the endpoint directly
    with app.test_client() as client:
        response = client.get('/all-stimuli')
        print(f"\nAPI Response Status: {response.status_code}")
        print(f"API Response: {response.get_json()}")
        
        # Check if response has the right structure
        data = response.get_json()
        if 'stimuli_videos' in data:
            if isinstance(data['stimuli_videos'], list):
                print(f"✅ API returns {len(data['stimuli_videos'])} videos as array")
                for i, video in enumerate(data['stimuli_videos']):
                    print(f"  Video {i+1}: {video.get('title', 'No title')}")
            else:
                print(f"❌ API returns count: {data['stimuli_videos']}")
        else:
            print("❌ API response missing 'stimuli_videos' key") 