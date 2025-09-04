from flask import Flask, jsonify, request, send_file, url_for, send_from_directory
import os
import glob
import json
import threading
import subprocess
import signal
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from database import db, User, Child, DoctorDetails, StimuliVideo, Report, Appointment
from datetime import date, datetime
from werkzeug.utils import secure_filename
from io import BytesIO
from main import handle_interrupt, run_gaze_session
import time
app = Flask(__name__)
CORS(app)

#  Config first
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'mysecretkey-ayesha'

# Video stimuli
UPLOAD_FOLDER = 'uploads/videos'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Child photo uploads
CHILDREN_UPLOAD_FOLDER = 'uploads/children'
app.config['CHILDREN_UPLOAD_FOLDER'] = CHILDREN_UPLOAD_FOLDER
os.makedirs(CHILDREN_UPLOAD_FOLDER, exist_ok=True)
print("UPLOAD PATH:", app.config['CHILDREN_UPLOAD_FOLDER'])


# Create the folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
#  Initialize extensions after config
db.init_app(app)
bcrypt = Bcrypt(app)

with app.app_context():
    db.create_all()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCK_FILE = os.path.join(BASE_DIR, "session.lock")
STOP_FILE = os.path.join(BASE_DIR, "session.stop")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

current_session = None
session_thread = None
stop_requested = False
session_data = {}
#--------------------------------------------Authentication------------------------------------------------------------#
# ---------- Signup ----------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    full_name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    if not all([full_name, email, password, role]):
        return jsonify({"error": "All fields are required"}), 400
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    # Hash password
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    # Create user
    new_user = User(full_name=full_name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()
    # If doctor, add entry in DoctorDetails
    if role == "doctor":
        doctor_detail = DoctorDetails(
            user_id=new_user.id,
            specialization=data.get("specialization"),
            status="active"
        )
        db.session.add(doctor_detail)
        db.session.commit()
        print(doctor_detail)
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }), 201


# @app.route('/signup', methods=['POST'])
# def signup():
#     data = request.get_json()
#     full_name = data.get('name')
#     email = data.get('email')
#     password = data.get('password')
#     role = data.get('role')

#     if not all([full_name, email, password, role]):
#         return jsonify({"error": "All fields are required"}), 400

#     # Check if user exists
#     if User.query.filter_by(email=email).first():
#         return jsonify({"error": "Email already registered"}), 400

#     # Hash password
#     hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

#     # Create user
#     new_user = User(full_name=full_name, email=email, password=hashed_pw, role=role)
#     db.session.add(new_user)
#     db.session.commit()
#     return jsonify({
#         "message": "User registered successfully",
#         "user": {
#             "id": new_user.email,  # Use email as consistent ID
#             "full_name": new_user.full_name,
#             "role": new_user.role
#         }
#     }), 201
# def signup():
#     data = request.get_json()
#     full_name = data.get('name')
#     email = data.get('email')
#     password = data.get('password')
#     role = data.get('role')

#     if not all([full_name, email, password, role]):
#         return jsonify({"error": "All fields are required"}), 400

#     # Check if user exists
#     if User.query.filter_by(email=email).first():
#         return jsonify({"error": "Email already registered"}), 400

#     # Hash password
#     hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

#     # Create user
#     new_user = User(full_name=full_name, email=email, password=hashed_pw, role=role)
#     db.session.add(new_user)
#     db.session.commit()
#     return jsonify({
#         "message": "User registered successfully",
#         "user": {
#             "id": new_user.email,  # Use email as consistent ID
#             "full_name": new_user.full_name,
#             "role": new_user.role
#         }
#     }), 201


# ---------- Login ----------
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    user = User.query.filter_by(email=email, role=role).first()

    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['role'] = user.role
        return jsonify({
            "message": "Login successful", 
            "role": user.role,
            "user": {
                "id": user.email,  # Use email as consistent ID
                "full_name": user.full_name,
                "role": user.role
            }
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401


# ---------- Logout ----------
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

#-------------------------------------------------Child Dashboard------------------------------------------------------#

# Add Child
@app.route('/parent/<parent_id>/child', methods=['POST'])
def add_child(parent_id):
    name = request.form.get('name')
    dob_str = request.form.get('dob')
    photo = request.files.get('photo')

    if not name or not dob_str:
        return jsonify({"error": "Name and DOB are required"}), 400

    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    photo_url = None
    if photo:
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{photo.filename}"
        photo.save(os.path.join(app.config["CHILDREN_UPLOAD_FOLDER"], filename))
        photo_url = f"/children/{filename}"

    new_child = Child(name=name, dob=dob, parent_id=parent_id, photo=photo_url)
    db.session.add(new_child)
    db.session.commit()

    return jsonify({"message": "Child added successfully", "child_id": new_child.id, "photo": photo_url}), 201


# Get All Children
@app.route('/parent/<parent_id>/children', methods=['GET'])
def get_children(parent_id):
    children = Child.query.filter_by(parent_id=parent_id).all()
    children_data = [
        {
            "id": c.id,
            "name": c.name,
            "dob": c.dob.strftime("%Y-%m-%d"),
            "photo": c.photo
        }
        for c in children
    ]
    return jsonify(children_data), 200


# Update Child
@app.route('/parent/<parent_id>/child/<int:child_id>', methods=['PUT'])
def update_child(parent_id, child_id):
    child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()
    if not child:
        return jsonify({"error": "Child not found"}), 404

    name = request.form.get('name')
    dob_str = request.form.get('dob')
    photo = request.files.get('photo')

    if name:
        child.name = name
    if dob_str:
        try:
            child.dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
    if photo:
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{photo.filename}"
        photo.save(os.path.join(app.config["CHILDREN_UPLOAD_FOLDER"], filename))
        child.photo = f"/children/{filename}"

    db.session.commit()
    return jsonify({"message": "Child updated successfully", "photo": child.photo}), 200


# Delete Child
@app.route('/parent/<parent_id>/child/<int:child_id>', methods=['DELETE'])
def delete_child(parent_id, child_id):
    child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()
    if not child:
        return jsonify({"error": "Child not found"}), 404

    db.session.delete(child)
    db.session.commit()
    return jsonify({"message": "Child deleted successfully"}), 200


# Get all of the children
@app.route('/children', methods=['GET'])
def get_all_children():
    try:
        children = Child.query.all()
        if not children:
            return jsonify({"message": "No children found"}), 200

        result = [
            {
                "id": child.id,
                "name": child.name,
                "dob": child.dob.strftime("%Y-%m-%d"),
                "parent_id": child.parent_id,
                "photo": child.photo
            }
            for child in children
        ]
        return jsonify({"children": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Count all children
@app.route('/children/count', methods=['GET'])
def get_children_count():
    try:
        count = Child.query.count()
        return jsonify({"total_children": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get a child
@app.route('/child/<int:child_id>', methods=['GET'])
def get_single_child(child_id):
    try:
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        result = {
            "id": child.id,
            "name": child.name,
            "dob": child.dob.strftime("%Y-%m-%d"),
            "parent_id": child.parent_id,
            "photo": child.photo
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Serve child photos
@app.route('/children/<filename>')
def serve_child_photo(filename):
    return send_from_directory(app.config["CHILDREN_UPLOAD_FOLDER"], filename)
#----------------------------------------------------------------------------------------------------------------------#

#----------------------------------------------------Video-Stimuli-----------------------------------------------------#
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Serve result files (images, excel files)
@app.route('/results/<path:filename>')
def serve_result_file(filename):
    try:
        return send_from_directory('results', filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


# Add video
@app.route('/add-stimuli', methods=['POST'])
def add_stimuli():
    try:
        # Check if request is JSON or form data
        if request.is_json:
            # Handle JSON request (without video file)
            data = request.get_json()
            title = data.get('title')
            description = data.get('description')
            category = data.get('category')
            duration = data.get('duration')
            video_url = data.get('video_url')
            uploaded_by = data.get('uploaded_by')
            
            if not all([title, category, video_url]):
                return jsonify({"error": "Title, Category, and Video URL are required"}), 400
                
        else:
            # Handle form data (with video file)
            title = request.form.get('title')
            description = request.form.get('description')
            category = request.form.get('category')
            duration = request.form.get('duration')
            uploaded_by = request.form.get('uploaded_by')
            video_file = request.files.get('video')

            if not all([title, category, video_file]):
                return jsonify({"error": "Title, Category, and Video File are required"}), 400

            # Validate file type
            if not allowed_file(video_file.filename):
                return jsonify({"error": "Invalid file type. Allowed: mp4, mov, avi, mkv"}), 400

            # Save the video file
            filename = secure_filename(video_file.filename)
            # Add timestamp to avoid filename conflicts
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            video_file.save(video_path)
            
            # Generate URL for the uploaded file
            video_url = url_for('uploaded_file', filename=filename, _external=True)

        # Store the video data
        new_video = StimuliVideo(
            title=title,
            description=description,
            category=category,
            duration=duration,
            video_url=video_url,
            uploaded_by=uploaded_by
        )
        db.session.add(new_video)
        db.session.commit()

        return jsonify({
            "message": "Stimuli video added successfully",
            "video_id": new_video.id,
            "video_url": video_url
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all videos
@app.route('/all-stimuli', methods=['GET'])
def get_all_stimuli():
    try:
        videos = StimuliVideo.query.all()
        result = [
            {
                "id": v.id,
                "title": v.title,
                "description": v.description,
                "category": v.category,
                "duration": v.duration,
                "video_url": v.video_url,
            }
            for v in videos
        ]
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get a video by id
@app.route('/stimuli/<int:video_id>', methods=['GET'])
def get_stimuli(video_id):
    try:
        video = StimuliVideo.query.get(video_id)
        if not video:
            return jsonify({"error": "Stimuli video not found"}), 404

        result = {
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "category": video.category,
            "duration": video.duration,
            "video_url": video.video_url,
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update the added video
@app.route('/stimuli/<int:video_id>', methods=['PUT'])
def update_stimuli(video_id):
    try:
        video = StimuliVideo.query.get(video_id)
        if not video:
            return jsonify({"error": "Stimuli video not found"}), 404

        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category')
        duration = request.form.get('duration')
        video_file = request.files.get('video')

        video.title = title or video.title
        video.description = description or video.description
        video.category = category or video.category
        video.duration = duration or video.duration

        if video_file:
            filename = secure_filename(video_file.filename)
            video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            video_file.save(video_path)
            video.video_url = video_path

        db.session.commit()
        return jsonify({"message": "Stimuli video updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Delete a video
@app.route('/stimuli/<int:video_id>', methods=['DELETE'])
def delete_stimuli(video_id):
    try:
        video = StimuliVideo.query.get(video_id)
        if not video:
            return jsonify({"error": "Stimuli video not found"}), 404

        db.session.delete(video)
        db.session.commit()
        return jsonify({"message": "Stimuli video deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#----------------------------------------------------------------------------------------------------------------------#



#------------------------------------------------- Doctor Management---------------------------------------------------#
# Add a doctor
# Add a doctor
@app.route('/add-doctor', methods=['POST'])
def add_doctor():
    data = request.get_json()
    full_name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    specialization = data.get('specialization')
    status = data.get('status', 'active')
    # Validate inputs
    if not all([full_name, email, password, specialization]):
        return jsonify({"error": "All fields are required"}), 400
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    try:
        # Hash password
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        # Create User record
        new_user = User(
            full_name=full_name,
            email=email,
            password=hashed_pw,
            role='doctor'
        )
        db.session.add(new_user)
        db.session.flush()
        doctor_details = DoctorDetails(
            user_id=new_user.id,
            specialization=specialization,
            status=status
        )
        db.session.add(doctor_details)
        # Commit both together
        db.session.commit()
        return jsonify({
            "message": "Doctor added successfully",
            "doctor": {
                "user_id": new_user.id,
                "name": new_user.full_name,
                "email": new_user.email,
                "specialization": doctor_details.specialization,
                "status": doctor_details.status
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
# @app.route('/add-doctor', methods=['POST'])
# def add_doctor():
#     data = request.get_json()
#     full_name = data.get('name')
#     email = data.get('email')
#     password = data.get('password')
#     specialization = data.get('specialization')
#     status = data.get('status', 'active')

#     try:
#         # Create user with role = doctor
#         hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
#         new_user = User(full_name=full_name, email=email, password=hashed_pw, role='doctor')
#         db.session.add(new_user)
#         db.session.flush()  # <-- Get new_user.id without committing yet

#         # Add doctor details
#         doctor_details = DoctorDetails(user_id=new_user.id, specialization=specialization, status=status)
#         db.session.add(doctor_details)

#         db.session.commit()  # commit both together
#         return jsonify({"message": "Doctor added successfully"}), 201

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 400


# Get a Doctor
@app.route('/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_by_id(doctor_id):
    doctor = db.session.query(User, DoctorDetails)\
        .join(DoctorDetails, User.id == DoctorDetails.user_id).filter(User.role == 'doctor', User.id == doctor_id).first()  

    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    user, details = doctor
    result = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "specialization": details.specialization,
        "status": details.status
    }
    return jsonify(result)


# Get all doctors
@app.route('/all-doctors', methods=['GET'])
def get_all_doctors():
    doctors = db.session.query(User, DoctorDetails)\
        .join(DoctorDetails, User.id == DoctorDetails.user_id)\
        .filter(User.role == 'doctor')\
        .all()

    result = []
    for user, details in doctors:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "specialization": details.specialization,
            "status": details.status
        })
    return jsonify(result)


# Toggle Status
@app.route("/doctors/<int:doctor_id>/toggle-status", methods=["PATCH"])
def toggle_status(doctor_id):
    doctor = DoctorDetails.query.filter_by(user_id=doctor_id).first()
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    doctor.status = "inactive" if doctor.status == "active" else "active"
    db.session.commit()
    return jsonify({"message": f"Doctor status updated to {doctor.status}"}), 200


# Update the doctor
@app.route('/doctor/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.get_json()

    doctor = db.session.query(User, DoctorDetails)\
        .join(DoctorDetails, User.id == DoctorDetails.user_id)\
        .filter(User.id == doctor_id, User.role == 'doctor')\
        .first()

    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    user, details = doctor
    user.full_name = data.get('name', user.full_name)
    user.email = data.get('email', user.email)
    details.specialization = data.get('specialization', details.specialization)
    details.status = data.get('status', details.status)

    db.session.commit()
    return jsonify({"message": "Doctor updated successfully"})

# Delete a doctor
@app.route('/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    doctor = db.session.query(User, DoctorDetails)\
        .join(DoctorDetails, User.id == DoctorDetails.user_id)\
        .filter(User.id == doctor_id, User.role == 'doctor')\
        .first()

    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    user, details = doctor
    db.session.delete(details)  # delete doctor details first
    db.session.delete(user)     # then delete user entry
    db.session.commit()

    return jsonify({"message": "Doctor deleted successfully"})


# Get Total Doctors
@app.route("/doctors-count", methods=["GET"])
def get_doctor_count():
    total = DoctorDetails.query.count()
    return jsonify({"total_doctors": total}), 200
# ---------------------------------------------------------------------------------------------------------------------#

#------------------------- Appointment Routes -------------------------#

# Create an appointment
@app.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    parent_id = data.get('parent_id')
    doctor_id = data.get('doctor_id')
    child_id = data.get('child_id')
    date_str = data.get('date')
    time_str = data.get('time')
    notes = data.get('notes')

    if not all([parent_id, doctor_id, child_id, date_str, time_str]):
        return jsonify({"error": "All fields except notes are required"}), 400

    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_appointment = Appointment(
        parent_id=parent_id,
        doctor_id=doctor_id,
        child_id=child_id,
        date=date_obj,
        time=time_str,
        notes=notes
    )
    db.session.add(new_appointment)
    db.session.commit()
    return jsonify({"message": "Appointment created successfully", "appointment_id": new_appointment.id}), 201


# Get all appointments
@app.route('/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    result = []
    for appt in appointments:
        result.append({
            "id": appt.id,
            "parent_id": appt.parent_id,
            "doctor_id": appt.doctor_id,
            "child_id": appt.child_id,
            "date": appt.date.strftime("%Y-%m-%d"),
            "time": appt.time,
            "notes": appt.notes,
            "status": appt.status
        })
    return jsonify(result), 200


# Get appointment by ID
@app.route('/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404
    return jsonify({
        "id": appt.id,
        "parent_id": appt.parent_id,
        "doctor_id": appt.doctor_id,
        "child_id": appt.child_id,
        "date": appt.date.strftime("%Y-%m-%d"),
        "time": appt.time,
        "notes": appt.notes,
        "status": appt.status
    }), 200


# Update appointment
@app.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    data = request.get_json()
    appt.parent_id = data.get('parent_id', appt.parent_id)
    appt.doctor_id = data.get('doctor_id', appt.doctor_id)
    appt.child_id = data.get('child_id', appt.child_id)
    date_str = data.get('date')
    if date_str:
        try:
            appt.date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    appt.time = data.get('time', appt.time)
    appt.notes = data.get('notes', appt.notes)
    appt.status = data.get('status', appt.status)
    db.session.commit()
    return jsonify({"message": "Appointment updated successfully"}), 200


# Delete appointment
@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404
    db.session.delete(appt)
    db.session.commit()
    return jsonify({"message": "Appointment deleted successfully"}), 200


# Get appointments for a specific doctor
@app.route('/doctor/<doctor_id>/appointments', methods=['GET'])
def get_doctor_appointments(doctor_id):
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    result = []
    for appt in appointments:
        result.append({
            "id": appt.id,
            "parent_id": appt.parent_id,
            "child_id": appt.child_id,
            "date": appt.date.strftime("%Y-%m-%d"),
            "time": appt.time,
            "notes": appt.notes,
            "status": appt.status
        })
    return jsonify(result), 200


# Get appointments for a specific parent
@app.route('/parent/<parent_id>/appointments', methods=['GET'])
def get_parent_appointments(parent_id):
    appointments = Appointment.query.filter_by(parent_id=parent_id).all()
    result = []
    for appt in appointments:
        result.append({
            "id": appt.id,
            "doctor_id": appt.doctor_id,
            "child_id": appt.child_id,
            "date": appt.date.strftime("%Y-%m-%d"),
            "time": appt.time,
            "notes": appt.notes,
            "status": appt.status
        })
    return jsonify(result), 200

#-----------------------------------------------------------------------------------------------------

# Entrypoint
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Gaze Tracking API is running"})


# Start the session
@app.route('/start', methods=['POST'])
def start_session():
    global current_session, session_thread, stop_requested, session_data
    data = request.get_json(silent=True) or {}
    child_id = data.get("child_id")
    stimulus_id = data.get("stimulus_id")
    session_type = data.get("session_type", "default")

    if child_id is None or stimulus_id is None:
        return jsonify({"status": "error", "message": "Missing required fields: child_id, stimulus_id"}), 400

    # Normalize to strings for subprocess args; backend script can cast as needed
    child_id_str = str(child_id)
    stimulus_id_str = str(stimulus_id)
    session_type_str = str(session_type)

    current_session = None
    stop_requested = False
    session_data = {
        "child_id": str(child_id),
        "stimulus_id": str(stimulus_id),
        "session_type": str(session_type),
    }

    # Make sure no leftover stop file exists
    if os.path.exists(STOP_FILE):
        os.remove(STOP_FILE)

    def run_session():
        global current_session
        current_session = run_gaze_session(
            child_id_str,
            stimulus_id_str,
            session_type_str,
            base_dir=RESULTS_DIR,
            db=db,
            Report=Report,
            app=app
        )
    session_thread = threading.Thread(target=run_session, daemon=True)
    session_thread.start()
    

    return jsonify({
        "status": "success",
        "message": "Session started",
        "child_id": child_id_str,
        "stimulus_id": stimulus_id_str,
        "session_type": session_type_str,
    }), 200


# Stop the session
@app.route('/stop', methods=['POST'])
def stop_session():
    global current_session, stop_requested, session_thread, session_data
    if not session_thread or not session_thread.is_alive():
        return jsonify({"status": "error", "message": "No active session"}), 400

    # Signal session to stop
    with open(STOP_FILE, "w") as f:
        f.write("stop")
    stop_requested = True
    session_thread.join()  # wait for session to finish

    results = current_session
    current_session = None
    session_data.clear()

    return jsonify({
        "status": "success",
        "message": "Session stopped"
    }), 200


# Check session status
@app.route('/status', methods=['GET'])
def get_status():
    global current_session
    if current_session:
        return jsonify({"status": "running", "session": current_session}), 200
    else:
        return jsonify({"status": "idle"}), 200


# get a report for a child
@app.route('/get-report/<string:child_id>', methods=['GET'])
def get_latest_report(child_id):
    # Get the latest report for this session_id
    report = Report.query.filter_by(child_id=child_id).order_by(Report.created_at.desc()).first()
    print("data in report for a child api: ", report)

    if not report:
        return jsonify({"message": "No report found for this child/session"}), 404

    # Helper function to create full URLs
    def create_full_url(path):
        if not path:
            return None
        # Remove any existing base URL and create new one
        if path.startswith("http"):
            # Extract just the file path part
            path = path.split("/", 3)[-1]  # Get everything after domain/port
        base_url = f"http://{request.host}"
        return f"{base_url}/{path}"

    # Convert to JSON format with full URLs
    report_data = {
        "id": report.id,
        "child_id": report.child_id,
        "predicted_class": report.predicted_class,
        "confidence": report.confidence,
        "risk_level": report.risk_level,
        "scanpath_path": create_full_url(report.scanpath_path),
        "heatmap_path": create_full_url(report.heatmap_path),
        "gaze_data_path": create_full_url(report.gaze_data_path),
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify(report_data), 200


# get all reports for a child
@app.route('/get-all-reports/<string:child_id>', methods=['GET'])
def get_all_reports(child_id):
    reports = Report.query.filter_by(child_id=child_id).all()

    if not reports:
        return jsonify({"message": "No report found for this child"}), 404

    # Helper function to create full URLs
    def create_full_url(path):
        if not path:
            return None
        # Remove any existing base URL and create new one
        if path.startswith("http"):
            # Extract just the file path part
            path = path.split("/", 3)[-1]  # Get everything after domain/port
        base_url = f"http://{request.host}"
        return f"{base_url}/{path}"

    # Convert to JSON format with full URLs
    report_list = []
    for report in reports:
        report_list.append({
            "id": report.id,
            "child_id": report.child_id,
            "predicted_class": report.predicted_class,
            "confidence": report.confidence,
            "risk_level": report.risk_level,
            "scanpath_path": create_full_url(report.scanpath_path),
            "heatmap_path": create_full_url(report.heatmap_path),
            "gaze_data_path": create_full_url(report.gaze_data_path),
            "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(report_list), 200

#adds safe-risk child count
# all safe-risk children count
@app.route('/count-safe-risk', methods=['GET'])
def count_safe_risk():
    count = Report.query.filter_by(risk_level="Safe").count()
    return jsonify({"risk_level": "Safe", "count": count})

# all low-risk children count
@app.route('/count-low-risk', methods=['GET'])
def count_low_risk():
    count = Report.query.filter_by(risk_level="Low").count()
    return jsonify({"risk_level": "Low", "count": count})


# all moderate-risk children count
@app.route('/count-moderate-risk', methods=['GET'])
def count_moderate_risk():
    count = Report.query.filter_by(risk_level="Moderate").count()
    return jsonify({"risk_level": "Moderate", "count": count})


# all high-risk children count
@app.route('/count-high-risk', methods=['GET'])
def count_high_risk():
    count = Report.query.filter_by(risk_level="High").count()
    return jsonify({"risk_level": "High", "count": count})



# ========================================================================
# === 👇 NEW API ENDPOINT FOR SYSTEM STATUS 👇 ===
# ========================================================================

@app.route('/api/system-status', methods=['GET'])
def get_system_status():
    """
    Provides a live status check of the application's core components.
    """
    services = []

    # 1. Check Database Connection
    try:
        # A simple query to check if the DB is responsive.
        db.session.query(User).first()
        db_status = "Operational"
    except Exception as e:
        print(f"Database connection error: {e}")
        db_status = "Offline"
    services.append({"id": "db", "name": "Database Connection", "status": db_status})

    # 2. Check ML Model Service (Gaze Session Status)
    global session_thread
    if session_thread and session_thread.is_alive():
        ml_status = "Degraded" # Using "Degraded" to signify it's busy/in-use
    else:
        ml_status = "Operational" # Ready for a new session
    services.append({"id": "ml", "name": "ML Model Service", "status": ml_status})

    # 3. Check File Storage (S3) - Checks if the upload directory exists
    if os.path.exists(app.config['UPLOAD_FOLDER']) and os.path.isdir(app.config['UPLOAD_FOLDER']):
        storage_status = "Operational"
    else:
        storage_status = "Offline"
    services.append({"id": "storage", "name": "File Storage", "status": storage_status})
    
    # 4. Public API Gateway (Static Check)
    # This is usually a check against an external service, but we'll assume it's okay if the app is running.
    services.append({"id": "api", "name": "Public API Gateway", "status": "Operational"})

    # 5. System Load (placeholder logic)
    # For a real app, you might check CPU/memory usage. Here, it's a placeholder.
    services.append({"id": "load", "name": "System Load", "status": "Normal"})
    
    return jsonify(services)

# ========================================================================



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))  # Use port 8000 as default to avoid conflicts
    app.run(debug=True, host='0.0.0.0', port=port, use_reloader=False)
