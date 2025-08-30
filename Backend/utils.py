# utils.py
import os, json
from datetime import datetime

def save_results_to_db(child_id,db, Report, app):
    print("inside utils to store data to db")
    session_folder = os.path.join("results", str(child_id))
    if not os.path.exists(session_folder):
        print(f"No session folder found for child {child_id}")
        return False

    subfolders = [
        os.path.join(session_folder, d)
        for d in os.listdir(session_folder)
        if os.path.isdir(os.path.join(session_folder, d))
    ]
    if not subfolders:
        print(f"No timestamp folders found for child {child_id}")
        return False

    latest_folder = max(subfolders, key=os.path.getmtime)
    results_file = os.path.join(latest_folder, "results.json")
    if not os.path.exists(results_file):
        print(f"results.json not found in {latest_folder}")
        return False

    with open(results_file, "r") as f:
        data = json.load(f)

    def normalize_path(p):
        BACKEND_URL = "http://192.168.100.205:8000"  # Use your actual IP
        if not p:
            return None
        p = p.replace("\\", "/")
        # Ensure the path is appended behind your backend URL
        return f"{BACKEND_URL}/{p.lstrip('/')}"

    with app.app_context():
        try:
            report = Report(
                child_id=data.get("child_id"),
                predicted_class=data.get("predicted_class"),
                confidence=data.get("confidence"),
                risk_level=data.get("risk_level"),
                scanpath_path=normalize_path(data.get("scanpath_path")),
                heatmap_path=normalize_path(data.get("heatmap_path")),
                gaze_data_path=normalize_path(data.get("gaze_data_path")),
                created_at=datetime.strptime(data.get("timestamp"), "%Y%m%d_%H%M%S")
            )
            db.session.add(report)
            db.session.commit()
            print(f"Results saved to DB for child {child_id}")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error saving results for child {child_id}: {e}")
            return False
