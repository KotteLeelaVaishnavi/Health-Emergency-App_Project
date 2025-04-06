from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import time
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# In-memory database for the prototype
# In a production app, use a real database like Firebase, MongoDB, or PostgreSQL
PATIENTS = {
    "123456": {
        "name": "Jane Doe",
        "id": "123456",
        "conditions": "Asthma, Type 2 Diabetes",
        "allergies": "Penicillin, Peanuts",
        "medications": "Ventolin, Metformin",
        "bloodType": "A+",
        "emergencyContact": "John Doe (555-123-4567)"
    },
    "789012": {
        "name": "John Smith",
        "id": "789012",
        "conditions": "Hypertension, Epilepsy",
        "allergies": "Sulfa drugs, Latex",
        "medications": "Lisinopril, Keppra",
        "bloodType": "O-",
        "emergencyContact": "Mary Smith (555-987-6543)"
    }
}

EMERGENCY_LOGS = []

# Serve static files (frontend)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    file_path = os.path.join('frontend', path)
    if path != "" and os.path.exists("frontend/" + path):
        return send_from_directory('frontend', path)
    else:
        return send_from_directory('frontend', 'index.html')

# API endpoint to get patient information
@app.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    if patient_id in PATIENTS:
        return jsonify(PATIENTS[patient_id])
    else:
        return jsonify({"error": "Patient not found"}), 404

# API endpoint to handle emergency notifications
@app.route('/api/emergency/notify', methods=['POST'])
def emergency_notify():
    data = request.json
    
    # Validate required fields
    if not data or 'emergencyType' not in data or 'location' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Generate unique emergency ID
    emergency_id = str(uuid.uuid4())
    
    # Record emergency
    emergency_record = {
        "id": emergency_id,
        "type": data['emergencyType'],
        "location": data['location'],
        "timestamp": datetime.now().isoformat(),
        "status": "active",
        "patientInfo": data.get('patientInfo', None)  # Optional patient info
    }
    
    EMERGENCY_LOGS.append(emergency_record)
    
    # In a real application, this would:
    # 1. Send notifications to emergency services
    # 2. Alert nearby users/responders
    # 3. Update real-time database
    
    # Simulate processing time
    time.sleep(1)
    
    return jsonify({
        "success": True,
        "message": "Emergency notification sent",
        "emergencyId": emergency_id
    })

# API endpoint for AI assistance
@app.route('/api/emergency/ai-help', methods=['POST'])
def get_ai_help():
    data = request.json
    
    if not data or 'situation' not in data:
        return jsonify({"error": "Missing situation description"}), 400
    
    situation = data['situation'].lower()
    patient_info = data.get('patientInfo', None)
    
    # In a real app, this would call an AI service like OpenAI
    # For the prototype, we'll use simple keyword matching
    
    response = {
        "instructions": [],
        "severity": "medium",
        "callEmergencyServices": False
    }
    
    # Basic keyword matching logic
    if any(word in situation for word in ['breath', 'chok', 'suffocate']):
        response["instructions"] = [
            "Check if their airway is blocked",
            "If they can cough or speak, encourage them to keep coughing",
            "If they cannot breathe, perform the Heimlich maneuver",
            "Call emergency services immediately"
        ]
        response["severity"] = "high"
        response["callEmergencyServices"] = True
        
    elif any(word in situation for word in ['unconscious', 'faint', 'collapse']):
        response["instructions"] = [
            "Check if they are breathing",
            "If breathing, place them in the recovery position",
            "If not breathing, begin CPR if trained",
            "Call emergency services immediately"
        ]
        response["severity"] = "high"
        response["callEmergencyServices"] = True
        
    elif any(word in situation for word in ['heart', 'chest pain', 'cardiac']):
        response["instructions"] = [
            "Have them sit down and rest",
            "Loosen any tight clothing",
            "If they have heart medication, help them take it",
            "Call emergency services immediately"
        ]
        response["severity"] = "high"
        response["callEmergencyServices"] = True
        
    elif any(word in situation for word in ['bleed', 'blood', 'wound', 'cut']):
        response["instructions"] = [
            "Apply direct pressure to the wound using a clean cloth",
            "Elevate the injured area above the heart if possible",
            "Do not remove the cloth if it becomes soaked; add another on top",
            "For severe bleeding, call emergency services"
        ]
        response["severity"] = "medium"
        response["callEmergencyServices"] = "severe" in situation
        
    else:
        response["instructions"] = [
            "Keep the person calm and comfortable",
            "Do not move them unless necessary",
            "Monitor their condition",
            "Call emergency services if condition worsens"
        ]
        response["severity"] = "medium"
        response["callEmergencyServices"] = False
    
    # Add patient-specific advice if available
    if patient_info:
        conditions = patient_info.get('conditions', '').lower()
        
        if 'asthma' in conditions and ('breath' in situation or 'wheez' in situation):
            response["instructions"].insert(0, "Look for their inhaler and help them use it")
            
        if 'diabetes' in conditions and ('dizz' in situation or 'sweat' in situation or 'confus' in situation):
            response["instructions"].insert(0, "If conscious, give them sugar (juice, candy, glucose tablets)")
    
    return jsonify(response)

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
