from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# Common User Model (for login/auth)
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # hashed
    role = db.Column(db.String(20), nullable=False)  # 'parent', 'doctor', 'admin'


class Child(db.Model):
    __tablename__ = 'child'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)  # Date of Birth
    parent_id = db.Column(db.String(50), nullable=False)  # Changed to String to handle frontend IDs
    photo = db.Column(db.String(255), nullable=True)  # e.g., "/uploads/children/abcd1234.jpg"



class DoctorDetails(db.Model):
    __tablename__ = 'doctor_details'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    specialization = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default="active")  # active / inactive
    user = db.relationship('User', backref=db.backref('doctor_details', uselist=False))


class StimuliVideo(db.Model):
    __tablename__ = 'stimuli_videos'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100))
    duration = db.Column(db.String(50))
    video_url = db.Column(db.String(255), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # Parent/Admin


class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.String(100), nullable=False)
    predicted_class = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(50), nullable=False)
    scanpath_path = db.Column(db.String(255), nullable=False)
    heatmap_path = db.Column(db.String(255), nullable=False)
    gaze_data_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.String(50), nullable=False)
    doctor_id = db.Column(db.String(50), nullable=False)
    child_id = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(10), nullable=False)  # 'HH:mm'
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='scheduled')  # scheduled / completed / cancelled
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
