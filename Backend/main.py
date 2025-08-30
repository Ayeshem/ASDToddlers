import cv2
import threading
import queue
from gaze_tracking import GazeTracking
from openpyxl import Workbook
from datetime import datetime
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import os
from keras.models import load_model
from PIL import Image, ImageOps
import json
import sys
from scipy.ndimage import gaussian_filter
import time
from utils import save_results_to_db
#################
import signal
import sys

##################
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STOP_FILE = os.path.join(BASE_DIR, "session.stop")


def create_session_folder(child_id):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder = os.path.join("results", str(child_id), timestamp)
    os.makedirs(folder, exist_ok=True)
    return folder


def handle_interrupt(sig, frame):
    print("Received interrupt signal, creating stop file...")
    with open(STOP_FILE, "w") as f:
        f.write("Session interrupted")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_interrupt)



def run_gaze_session(child_id, stimulus_id, session_type, base_dir, db, Report,app):
    session_folder = create_session_folder(child_id)

    os.makedirs(session_folder, exist_ok=True)

    # -------------------- SETUP --------------------
    # Initialize Excel workbook for logging eye tracking data
    wb = Workbook()
    ws = wb.active
    ws.title = "Eye Tracking Data"
    ws.append(["Timestamp", "Left Pupil", "Right Pupil", "Gaze Direction", "Blinking", "Duration(s)"])

    current_direction = None
    direction_start_time = None

    gaze = GazeTracking()

    # Setup webcam (on Mac, using default backend; ensure permissions are granted)
    webcam = cv2.VideoCapture(0)
    webcam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    webcam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)


    # -------------------- MAIN LOOP --------------------
    try:
        prev_frame_time = time.time()

        while True:
            if os.path.exists(STOP_FILE):
                print("Stop signal detected, ending session...")
                break
        
            webcam_ret, webcam_frame = webcam.read()
            if not webcam_ret:
                print("Error: Could not read from webcam")
                break

            gaze.refresh(webcam_frame)
            frame = gaze.annotated_frame()

            # Determine gaze direction and text for display
            if gaze.is_blinking():
                gaze_direction = "Blinking"
                text = "Blinking"
            elif gaze.is_right():
                gaze_direction = "Right"
                text = "Looking right"
            elif gaze.is_left():
                gaze_direction = "Left"
                text = "Looking left"
            else:
                gaze_direction = "Center"
                text = "Looking center"

            # Track duration of the current gaze direction
            current_time = time.time()
            if gaze_direction != current_direction:
                direction_start_time = current_time
                current_direction = gaze_direction
                current_duration = 0.0
            else:
                current_duration = current_time - direction_start_time

            # Get pupil coordinates
            left_pupil = gaze.pupil_left_coords()
            right_pupil = gaze.pupil_right_coords()

            # Log data to Excel workbook
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            ws.append([
                timestamp,
                str(left_pupil),
                str(right_pupil),
                gaze_direction,
                "Yes" if gaze.is_blinking() else "No",
                round(current_duration, 2)
            ])

            # Overlay gaze information on the annotated frame
            cv2.putText(frame, text, (90, 60), cv2.FONT_HERSHEY_DUPLEX, 1.6, (147, 58, 31), 2)
            cv2.putText(frame, f"Duration: {round(current_duration, 1)}s", (90, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (147, 58, 31), 1)
            cv2.putText(frame, f"Left pupil: {left_pupil}", (90, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (147, 58, 31), 1)
            cv2.putText(frame, f"Right pupil: {right_pupil}", (90, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (147, 58, 31), 1)



    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt, saving data...")

    finally:
        # -------------------- CLEANUP --------------------
        webcam.release()
        if os.path.exists(STOP_FILE):
            os.remove(STOP_FILE)
    

        # -------------------- SAVE DATA --------------------
        
        filename = os.path.join(session_folder, "gaze_data.xlsx")

        wb.save(filename)
        print(f"Data saved to {filename}")


        # -------------------- DATA PROCESSING --------------------
        df = pd.read_excel(filename, sheet_name='Eye Tracking Data')

        def extract_coords(coord_str):
            try:
                if isinstance(coord_str, str) and coord_str.startswith("(") and coord_str.endswith(")"):
                    stripped = coord_str.strip("()")
                    parts = stripped.split(",")
                    if len(parts) == 2:
                        return [float(parts[0].strip()), float(parts[1].strip())]
                return [None, None]
            except Exception:
                return [None, None]


        # safer parsing for Left Pupil
        left_coords = df["Left Pupil"].apply(lambda s: pd.Series(extract_coords(s)))
        left_coords.columns = ["Left_X", "Left_Y"]
        df = pd.concat([df, left_coords], axis=1)

        # and for Right Pupil
        right_coords = df["Right Pupil"].apply(lambda s: pd.Series(extract_coords(s)))
        right_coords.columns = ["Right_X", "Right_Y"]
        df = pd.concat([df, right_coords], axis=1)
        if "Left_X" in df.columns and "Right_X" in df.columns:
            df["Avg_X"] = df[["Left_X", "Right_X"]].mean(axis=1)
            df["Avg_Y"] = df[["Left_Y", "Right_Y"]].mean(axis=1)
        else:
            print("Warning: Left_X or Right_X missing in DataFrame")

        clean_df = df[(df['Blinking'] == 'No') & (df['Avg_X'].notna())].copy()



        # -------------------- SCANPATH GENERATION --------------------
        fig, ax = plt.subplots(figsize=(2.24, 2.24), dpi=100)
        fig.patch.set_facecolor('black')
        ax.set_facecolor('black')

        for i in range(1, len(clean_df)):
            x0, y0 = clean_df.iloc[i-1][['Avg_X', 'Avg_Y']]
            x1, y1 = clean_df.iloc[i][['Avg_X', 'Avg_Y']]
            color = plt.cm.jet(i / len(clean_df))
            ax.plot([x0, x1], [y0, y1], color=color, alpha=0.5, linewidth=0.8)

        ax.invert_yaxis()
        ax.axis('off')
        plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

        scanpath_filename = os.path.join(session_folder, "scanpath.png")
        plt.savefig(scanpath_filename, dpi=100, facecolor='black')
        plt.close()
        print(f"Scanpath image saved as {scanpath_filename}")



        #  -------------------- HEATMAP GENERATION --------------------
        print("Generating heatmap...")
        
        # Create a clean heatmap figure
        fig, ax = plt.subplots(figsize=(10, 8))
        fig.patch.set_facecolor('white')
        ax.set_facecolor('white')
        
        # Extract gaze coordinates
        x_coords = clean_df['Avg_X'].values
        y_coords = clean_df['Avg_Y'].values
        
        # Create 2D histogram (heatmap)
        heatmap, xedges, yedges = np.histogram2d(x_coords, y_coords, bins=50, 
                                                range=[[0, 640], [0, 480]])
        
        # Apply Gaussian smoothing
        heatmap = gaussian_filter(heatmap, sigma=1.5)
        
        # Display heatmap with 'hot' colormap
        im = ax.imshow(heatmap.T, origin='lower', cmap='hot', 
                    extent=[0, 640, 0, 480], aspect='auto')
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Gaze Density', fontsize=12)
        
        # Set title and labels
        ax.set_title('Gaze Heatmap', fontsize=14, pad=20)
        ax.set_xlabel('X Coordinate (pixels)', fontsize=12)
        ax.set_ylabel('Y Coordinate (pixels)', fontsize=12)
        
        # Add grid for better readability
        ax.grid(True, alpha=0.3)
        
        # Invert y-axis to match image coordinates
        ax.invert_yaxis()
        
        # Set axis limits
        ax.set_xlim(0, 640)
        ax.set_ylim(0, 480)
        
        heatmap_filename = os.path.join(session_folder, "heatmap.png")
        plt.savefig(heatmap_filename, dpi=150, facecolor='white', bbox_inches='tight')
        plt.close()
        print(f"Heatmap image saved as {heatmap_filename}")



        # -------------------- ASD DETECTION --------------------
        print("Running ASD detection...")
        result_data = None

        try:
            model = load_model("TFSMconverted_model.keras")
            image = Image.open(scanpath_filename).convert("RGB")
            image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)

            image_array = np.asarray(image)
            normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
            data = np.expand_dims(normalized_image_array, axis=0)

            prediction = model.predict(data)

            if isinstance(prediction, dict):
                prediction = list(prediction.values())[0]

            index = np.argmax(prediction)
            confidence_score = prediction[0][index]

            class_names = open("labels.txt", "r").readlines()
            class_name = class_names[index].strip()
            print("Prediction:", class_name)
            print("Confidence:", confidence_score)
            if float(confidence_score) <= 0.6:
                risk_level = "Low"
            elif 0.75 >= float(confidence_score) > 0.6:
                risk_level = "Moderate"
            else:
                risk_level = "High"

            result_filename = os.path.join(session_folder, "prediction_result.txt")
            with open(result_filename, "w") as f:
                f.write("ASD Prediction Result\n")
                f.write("=====================\n")
                f.write(f"Timestamp       : {datetime.now().strftime('%Y%m%d_%H%M%S')}\n")
                f.write(f"Child_ID        : {child_id}\n")
                f.write(f"Stimulus_ID     : {stimulus_id}\n")
                f.write(f"Heatmap Image   : {heatmap_filename}\n")
                f.write(f"Session_Type    : {session_type}\n")
                f.write(f"Scanpath Image  : {scanpath_filename}\n")
                f.write(f"Predicted Class : {class_name}\n")
                f.write(f"Risk Level      : {risk_level}\n")
                f.write(f"Confidence      : {confidence_score:.6f}\n")

            print(f"Prediction result saved to {result_filename}")
            print("Saving report for child_id:", child_id)



            result_data = {
            "child_id": child_id,
            "stimulus_id": stimulus_id,
            "session_type": session_type,
            "predicted_class": class_name,
            "risk_level": risk_level,
            "confidence": float(confidence_score),
            "scanpath_path": scanpath_filename,
            "heatmap_path": heatmap_filename,
            "gaze_data_path": filename,
            "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S")
        }

            # Save to JSON file (separate for each child & timestamp)
            result_filename = os.path.join(session_folder, "results.json")

            with open(result_filename, "w") as f:
                json.dump(result_data, f, indent=4)
            

            save_results_to_db(child_id,db, Report,app)

        
        except Exception as e:
            print(f"Error during ASD detection: {str(e)}")
                    
        return result_data

















