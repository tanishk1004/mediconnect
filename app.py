from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

# Serve files from the same folder as app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
CORS(app)

DB_PATH = os.path.join(BASE_DIR, 'mediconnect.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, phone TEXT NOT NULL,
        specialization TEXT NOT NULL, consult_type TEXT NOT NULL,
        date TEXT NOT NULL, time TEXT NOT NULL,
        description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS symptom_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT, age INTEGER, symptoms TEXT,
        duration TEXT, urgency TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    conn = get_db()
    rows = conn.execute('SELECT * FROM appointments ORDER BY date, time').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    required = ['name', 'phone', 'specialization', 'consult_type', 'date', 'time']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Missing field: {field}'}), 400
    conn = get_db()
    conn.execute('''INSERT INTO appointments (name, phone, specialization, consult_type, date, time, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (data['name'], data['phone'], data['specialization'],
         data['consult_type'], data['date'], data['time'], data.get('description', '')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Appointment booked successfully'}), 201

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'MediConnect API running'})

if __name__ == '__main__':
    init_db()
    print("\n" + "="*50)
    print("  🏥 MediConnect Server Starting...")
    print("  🌐 Open: http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
