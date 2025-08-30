from app import app, db
from database import StimuliVideo

with app.app_context():
    print("=== Testing Database Stimuli ===")
    
    # Check if table exists
    try:
        videos = StimuliVideo.query.all()
        print(f"Found {len(videos)} videos in database")
        
        for i, video in enumerate(videos):
            print(f"Video {i+1}:")
            print(f"  ID: {video.id}")
            print(f"  Title: {video.title}")
            print(f"  Category: {video.category}")
            print(f"  URL: {video.video_url}")
            print(f"  Duration: {video.duration}")
            print(f"  Description: {video.description}")
            print()
            
    except Exception as e:
        print(f"Error: {e}")
        
    # Test the API endpoint
    print("=== Testing API Endpoint ===")
    with app.test_client() as client:
        response = client.get('/all-stimuli')
        print(f"Status: {response.status_code}")
        print(f"Response: {response.get_json()}") 