from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import PIL.Image
import face_recognition
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import pymysql
import random
import hashlib
import json
from time import time

class Blockchain:
    def __init__(self):
        self.chain = []
        self.create_block(previous_hash='0')

    def create_block(self, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'data': {},
            'previous_hash': previous_hash
        }
        self.chain.append(block)
        return block

    def add_medical_record(self, record):
        previous_block = self.chain[-1]
        previous_hash = self.hash(previous_block)
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'data': record,
            'previous_hash': previous_hash
        }
        self.chain.append(block)
        return block

    def hash(self, block):
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def get_chain(self):
        return self.chain

blockchain = Blockchain()

app = Flask(__name__)
CORS(app)

KNOWN_FACES_DIR = "known_faces"

known_encodings = []
known_names = []

for filename in os.listdir(KNOWN_FACES_DIR):
    if filename.lower().endswith((".jpg", ".png", ".jpeg")):
        path = os.path.join(KNOWN_FACES_DIR, filename)
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_encodings.append(encodings[0])
            known_names.append(os.path.splitext(filename)[0])
        else:
            print(f"⚠️ No face found in {filename}")

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Raj@12345',
    'database': 'raksha',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

@app.route('/api/health-data', methods=['GET'])
def get_health_data():
    return jsonify({
        "heartbeat": random.randint(60, 120),
        "spo2": random.randint(90, 100),
        "bp_systolic": random.randint(110, 140),
        "bp_diastolic": random.randint(70, 90),
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

@app.route("/api/save-chat", methods=["POST"])
def save_chat():
    data = request.get_json()
    username = data.get('username')
    messages = data.get('messages')
    chat_name = data.get('chat_name')

    if not username or not messages or not chat_name:
        print("error here of data")
        return jsonify({"status": "error", "message": "Missing data"}), 400

    try:
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            # 1. Insert into chat_sessions
            cursor.execute("""
                INSERT INTO chat_sessions (username, chat_name)
                VALUES (%s, %s)
            """, (username, chat_name))
            session_id = cursor.lastrowid

            # 2. Insert all messages
            for msg in messages:
                cursor.execute("""
                    INSERT INTO chat_messages (session_id, sender, message, timestamp)
                    VALUES (%s, %s, %s, %s)
                """, (
                    session_id,
                    msg.get('from'),
                    msg.get('text'),
                    datetime.now()
                ))
        connection.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print("DB Error:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        connection.close()

@app.route("/api/chat-sessions", methods=["GET"])
def get_chat_sessions():
    try:
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, chat_name, created_at FROM chat_sessions ORDER BY created_at DESC
            """)
            sessions = cursor.fetchall()
        return jsonify(sessions), 200
    except Exception as e:
        print("DB Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route("/api/chat-session/<int:session_id>", methods=["GET"])
def get_chat_by_session(session_id):
    try:
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sender, message, timestamp FROM chat_messages
                WHERE session_id = %s ORDER BY timestamp
            """, (session_id,))
            messages = cursor.fetchall()
        return jsonify(messages), 200
    except Exception as e:
        print("DB Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route("/api/update-chat-name/<int:chat_id>", methods=["PUT"])
def update_chat_name(chat_id):
    try:
        new_name = request.json.get('newName')
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE chat_sessions SET chat_name = %s WHERE id = %s
            """, (new_name, chat_id))
            connection.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("DB Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route("/api/delete-chat/<int:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    try:
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            # First delete from chat_messages table
            cursor.execute("""
                DELETE FROM chat_messages WHERE session_id = %s
            """, (chat_id,))
            # Then delete from chat_sessions table
            cursor.execute("""
                DELETE FROM chat_sessions WHERE id = %s
            """, (chat_id,))
            connection.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("DB Error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/save-medical', methods=['POST'])
def save_medical():
    title = request.form.get('title')
    problem = request.form.get('problem')
    diagnosis = request.form.get('diagnosis')
    description = request.form.get('description')
    files = request.files.getlist('files')  # List of file objects

    # For simplicity, we can store filenames instead of the whole file in blockchain
    filenames = []
    for file in files:
        filenames.append(file.filename)
        file.save(f"uploads/{file.filename}")  # Save files normally (optional)

    # Create medical record dictionary
    record = {
        'title': title,
        'problem': problem,
        'diagnosis': diagnosis,
        'description': description,
        'attachments': filenames
    }

    # Add medical record to blockchain
    block = blockchain.add_medical_record(record)

    return jsonify({'message': 'Medical record added to blockchain!', 'block': block}), 200

@app.route('/api/get-medical-chain', methods=['GET'])
def get_chain():
    chain = blockchain.get_chain()
    return jsonify(chain), 200

@app.route('/api/login', methods=['POST'])
def login():
    if 'image' not in request.files:
        return jsonify({"found": False}), 400

    file = request.files['image']
    filename = secure_filename(file.filename)
    img = face_recognition.load_image_file(file)
    face_locations = face_recognition.face_locations(img)
    encodings = face_recognition.face_encodings(img, face_locations)

    if not encodings:
        return jsonify({"found": False})

    user_encoding = encodings[0]
    results = face_recognition.compare_faces(known_encodings, user_encoding, tolerance=0.8)

    if True in results:
        index = results.index(True)
        username = known_names[index]
        return jsonify({"found": True, "username": username})
    else:
        return jsonify({"found": False})

@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.form.get('message')
    image = request.files.get('image')

    try:
        if image:
            image.save(f"{image.filename}")
            img = PIL.Image.open('broken.jpg')
            client = genai.Client(api_key="[[Your Google API Key]]")
            response = client.models.generate_content(model="gemini-1.5-flash", contents = [f"{user_input}", img])
            print(response.text)
            return jsonify(response.text)
        else:
            client = genai.Client(api_key="[[Your Google API Key]]") 
            response = client.models.generate_content(model="gemini-2.0-flash", contents=f"{user_input}")
            print(response.text)
            return jsonify(response.text)
    except Exception as e:
        print("Gemini API error:", str(e))
        return jsonify("Something went wrong while calling Gemini."), 500

if __name__ == "__main__":
    app.run(debug=True)
