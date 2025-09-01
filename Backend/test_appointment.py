import requests
from datetime import date

BASE_URL = "http://127.0.0.1:8000"

def test_appointments():
    # 1. Add appointment
    print("Testing Add Appointment...")
    appt_data = {
        "parent_id": "1",
        "doctor_id": "1",
        "child_id": "1",
        "date": str(date.today()),
        "time": "10:30",
        "notes": "Test appointment"
    }
    resp = requests.post(f"{BASE_URL}/appointments", json=appt_data)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json() if resp.content else 'No content'}")
    appointment_id = resp.json().get("appointment_id") if resp.status_code == 201 else None

    print("\n" + "="*50 + "\n")

    # 2. Get all appointments
    print("Testing Get All Appointments...")
    resp = requests.get(f"{BASE_URL}/appointments")
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json() if resp.content else 'No content'}")

    print("\n" + "="*50 + "\n")

    # 3. Get appointment by ID
    if appointment_id:
        print("Testing Get Appointment by ID...")
        resp = requests.get(f"{BASE_URL}/appointments/{appointment_id}")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json() if resp.content else 'No content'}")

    print("\n" + "="*50 + "\n")

    # 4. Get appointments for doctor
    print("Testing Get Appointments for Doctor...")
    resp = requests.get(f"{BASE_URL}/doctor/1/appointments")
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json() if resp.content else 'No content'}")

    print("\n" + "="*50 + "\n")

    # 5. Get appointments for parent
    print("Testing Get Appointments for Parent...")
    resp = requests.get(f"{BASE_URL}/parent/1/appointments")
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json() if resp.content else 'No content'}")

if __name__ == "__main__":
    test_appointments()
