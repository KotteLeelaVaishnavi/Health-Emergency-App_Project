// Global variables
let userLocation = null;
let selectedEmergencyType = null;
let isDarkMode = false;
let patientData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('callEmergency').addEventListener('click', callEmergency);
    document.getElementById('sendLocation').addEventListener('click', sendLocationToEmergency);
    
    // Check if the app is being loaded from a PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log("Running in PWA mode");
    }
    
    // Request permission for notifications
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker not registered', err));
    }
});

// Function to handle emergency type selection
function selectEmergency(type) {
    selectedEmergencyType = type;
    console.log(`Selected emergency type: ${type}`);
    
    // Show the emergency actions section
    document.getElementById('emergencyActions').classList.remove('hidden');
    
    // Get user's location
    getUserLocation();
    
    // Show AI assistance section
    document.getElementById('aiAssistance').classList.remove('hidden');
    
    // Update AI suggestions based on emergency type and patient data
    updateAISuggestions(type);
}

// Get user's current location
function getUserLocation() {
    document.getElementById('locationStatus').textContent = "Retrieving your location...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                document.getElementById('locationStatus').textContent = 
                    `Location found: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
                console.log("User location:", userLocation);
            },
            (error) => {
                console.error("Error getting location:", error);
                document.getElementById('locationStatus').textContent = 
                    "Unable to access your location. Please enable location services.";
            }
        );
    } else {
        document.getElementById('locationStatus').textContent = 
            "Geolocation is not supported by this browser.";
    }
}

// Simulate sending location to emergency services
function sendLocationToEmergency() {
    if (!userLocation) {
        alert("Still getting your location. Please wait a moment.");
        return;
    }
    
    // In a real app, this would make an API call to your backend
    console.log("Sending location to emergency services:", userLocation);
    
    // Simulate API call
    fetch('https://your-backend-api.com/emergency/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            emergencyType: selectedEmergencyType,
            location: userLocation,
            patientInfo: patientData
        }),
    })
    .then(response => {
        // This is simulated - in reality we would check the actual response
        showNotification("Emergency services have been notified of your location.");
        document.getElementById('sendLocation').textContent = "Location Sent ✓";
        document.getElementById('sendLocation').disabled = true;
        document.getElementById('sendLocation').classList.add('bg-gray-500');
        document.getElementById('sendLocation').classList.remove('bg-green-500', 'hover:bg-green-600');
    })
    .catch(error => {
        console.error('Error:', error);
        // For the prototype, we'll assume it succeeded anyway
        showNotification("Simulated: Emergency services notified (Demo mode)");
    });
}

// Simulate making an emergency call
function callEmergency() {
    const emergencyNumbers = {
        'US': '911',
        'EU': '112',
        'UK': '999'
    };
    
    const number = emergencyNumbers.US; // Default to US for demo
    console.log(`Calling emergency number: ${number}`);
    
    // On mobile devices, this could actually initiate a call
    window.location.href = `tel:${number}`;
    
    showNotification(`Initiating call to emergency services (${number})`);
}

// Simulate getting AI assistance based on input
function getAIHelp() {
    const situationInput = document.getElementById('situationInput').value.trim();
    
    if (!situationInput) {
        alert("Please describe the situation first.");
        return;
    }
    
    console.log("Getting AI help for situation:", situationInput);
    
    // Show loading state
    document.getElementById('aiSuggestions').innerHTML = "<p>Analyzing situation...</p>";
    
    // In a real app, this would call your backend API with an AI service
    // Simulate API response for the prototype
    setTimeout(() => {
        let suggestions = "";
        
        // Simple keyword-based suggestions for the prototype
        if (situationInput.toLowerCase().includes("breath") || 
            situationInput.toLowerCase().includes("chok")) {
            suggestions = `
                <h4>Possible Choking or Breathing Difficulty</h4>
                <ul>
                    <li>If the person can cough or speak, encourage them to keep coughing.</li>
                    <li>If the person cannot cough, speak, or breathe:
                        <ul>
                            <li>Stand behind them and slightly to one side.</li>
                            <li>Support their chest with one hand.</li>
                            <li>Lean the person forward so the object blocking their airway will come out of their mouth, rather than going further down.</li>
                            <li>Give up to 5 sharp blows between their shoulder blades with the heel of your hand.</li>
                        </ul>
                    </li>
                    <li>If back blows don't work, try abdominal thrusts (Heimlich maneuver).</li>
                </ul>
            `;
        } else if (situationInput.toLowerCase().includes("unconscious") || 
                   situationInput.toLowerCase().includes("pass out") || 
                   situationInput.toLowerCase().includes("faint")) {
            suggestions = `
                <h4>Unconscious Person</h4>
                <ul>
                    <li>Check if they're breathing by tilting their head back slightly and looking and feeling for breaths.</li>
                    <li>If they are breathing, place them in the recovery position:
                        <ul>
                            <li>Position the person on their side.</li>
                            <li>The bottom arm should be at a right angle to the body.</li>
                            <li>Top arm should have the hand resting on the cheek.</li>
                            <li>Top leg bent at the knee.</li>
                        </ul>
                    </li>
                    <li>If not breathing, begin CPR immediately and call emergency services.</li>
                </ul>
            `;
            
            // Add patient-specific information if available
            if (patientData) {
                if (patientData.conditions.toLowerCase().includes("diabet")) {
                    suggestions += `
                        <div class="mt-4 p-3 bg-yellow-100 rounded">
                            <h4 class="text-yellow-800">Patient Has Diabetes</h4>
                            <p>If the person is unconscious and has diabetes:</p>
                            <ul>
                                <li>They might be experiencing hypoglycemia (low blood sugar).</li>
                                <li>Don't give anything by mouth if unconscious.</li>
                                <li>If they regain consciousness and can swallow, give them a sugary drink or food.</li>
                                <li>Look for medical ID or emergency information.</li>
                            </ul>
                        </div>
                    `;
                }
            }
        } else if (situationInput.toLowerCase().includes("chest pain") || 
                   situationInput.toLowerCase().includes("heart")) {
            suggestions = `
                <h4>Possible Heart Attack/Chest Pain</h4>
                <ul>
                    <li>Have the person sit down, rest, and try to keep calm.</li>
                    <li>Loosen any tight clothing.</li>
                    <li>If the person takes medication for a heart condition (like nitroglycerin), help them take it.</li>
                    <li>If symptoms persist for more than a few minutes, call emergency services immediately.</li>
                    <li>If the person becomes unconscious and is not breathing, begin CPR if you're trained.</li>
                </ul>
            `;
        } else {
            suggestions = `
                <h4>General Emergency Guidelines</h4>
                <ul>
                    <li>Ensure your safety first before helping others.</li>
                    <li>Check if the person is conscious and breathing.</li>
                    <li>If appropriate, place the person in the recovery position (on their side).</li>
                    <li>For serious injuries or conditions, minimize movement unless absolutely necessary.</li>
                    <li>Keep the person warm and comfortable.</li>
                    <li>Reassure the person until emergency services arrive.</li>
                </ul>
            `;
        }
        
        document.getElementById('aiSuggestions').innerHTML = suggestions;
    }, 1500);
}

// Update AI suggestions based on emergency type and patient data
function updateAISuggestions(emergencyType) {
    let initialSuggestions = "";
    
    if (patientData) {
        // Patient-specific suggestions
        initialSuggestions = `
            <h4>Important Patient Information</h4>
            <p>This person has the following medical conditions: <strong>${patientData.conditions}</strong></p>
            <p>Allergies: <strong>${patientData.allergies}</strong></p>
            <p>Current medications: <strong>${patientData.medications}</strong></p>
            
            <h4>Specific Recommendations:</h4>
        `;
        
        // Add condition-specific advice
        if (patientData.conditions.toLowerCase().includes("asthma")) {
            initialSuggestions += `
                <div class="p-3 bg-blue-100 rounded mb-2">
                    <h5 class="font-bold">Asthma Management</h5>
                    <ul>
                        <li>Look for an inhaler in their possessions.</li>
                        <li>Help them sit upright to make breathing easier.</li>
                        <li>Keep them calm, as anxiety can worsen symptoms.</li>
                        <li>If they have an inhaler, help them use it according to their plan.</li>
                    </ul>
                </div>
            `;
        }
        
        if (patientData.conditions.toLowerCase().includes("diabet")) {
            initialSuggestions += `
                <div class="p-3 bg-green-100 rounded mb-2">
                    <h5 class="font-bold">Diabetes Information</h5>
                    <ul>
                        <li>If conscious and showing signs of low blood sugar (confusion, shakiness), give them sugar.</li>
                        <li>Look for glucose tablets, gel, or sweet drinks in their possessions.</li>
                        <li>If unconscious, do NOT give anything by mouth.</li>
                        <li>Check for medical ID or insulin pump.</li>
                    </ul>
                </div>
            `;
        }
    } else {
        // Generic emergency suggestions
        switch(emergencyType) {
            case 'medical':
                initialSuggestions = `
                    <p>Please describe the medical emergency or symptoms you observe. Some helpful information to provide:</p>
                    <ul>
                        <li>Is the person conscious and responsive?</li>
                        <li>Are they breathing normally?</li>
                        <li>Do you notice any specific symptoms like chest pain, difficulty breathing, etc.?</li>
                        <li>Did they mention any medical conditions?</li>
                    </ul>
                `;
                break;
            case 'fire':
                initialSuggestions = `
                    <p>Fire emergency guidance:</p>
                    <ul>
                        <li>Ensure your safety first - do not enter a burning building.</li>
                        <li>If you're inside, stay low to avoid smoke inhalation.</li>
                        <li>Use the back of your hand to check if doors are hot before opening.</li>
                        <li>If your clothes catch fire: Stop, Drop, and Roll.</li>
                        <li>Meet at a designated assembly point outside.</li>
                    </ul>
                `;
                break;
            case 'accident':
                initialSuggestions = `
                    <p>For accident situations:</p>
                    <ul>
                        <li>Ensure the scene is safe before approaching.</li>
                        <li>Check for responsive victims who may need immediate assistance.</li>
                        <li>For vehicle accidents, turn off engines if possible.</li>
                        <li>Do not move injured persons unless there is immediate danger.</li>
                        <li>Apply direct pressure to bleeding wounds.</li>
                    </ul>
                `;
                break;
            default:
                initialSuggestions = `
                    <p>Please describe the emergency situation so we can provide appropriate guidance.</p>
                `;
        }
    }
    
    document.getElementById('aiSuggestions').innerHTML = initialSuggestions;
}

// Simulate fetching patient info from backend
function fetchPatientInfo(patientId) {
    console.log(`Fetching info for patient ID: ${patientId}`);
    
    // In a real app, this would be an API call to your backend
    // For the prototype, we'll use mock data
    setTimeout(() => {
        // Mock patient data
        if (patientId === "123456") {
            patientData = {
                name: "Jane Doe",
                id: "123456",
                conditions: "Asthma, Type 2 Diabetes",
                allergies: "Penicillin, Peanuts",
                medications: "Ventolin, Metformin",
                bloodType: "A+",
                emergencyContact: "John Doe (555-123-4567)"
            };
        } else if (patientId === "789012") {
            patientData = {
                name: "John Smith",
                id: "789012",
                conditions: "Hypertension, Epilepsy",
                allergies: "Sulfa drugs, Latex",
                medications: "Lisinopril, Keppra",
                bloodType: "O-",
                emergencyContact: "Mary Smith (555-987-6543)"
            };
        } else {
            // Default mock data for demo
            patientData = {
                name: "Demo Patient",
                id: patientId,
                conditions: "Asthma, Type 2 Diabetes",
                allergies: "Penicillin, Shellfish",
                medications: "Albuterol, Metformin",
                bloodType: "B+",
                emergencyContact: "Emergency Contact (555-555-5555)"
            };
        }
        
        // Update the UI with patient information
        document.getElementById('loginStatus').classList.remove('hidden');
        document.getElementById('patientInfo').classList.remove('hidden');
        document.getElementById('patientName').textContent = patientData.name;
        document.getElementById('patientID').textContent = `ID: #${patientData.id}`;
        document.getElementById('medicalCondition').textContent = patientData.conditions;
        document.getElementById('allergies').textContent = patientData.allergies;
        document.getElementById('medications').textContent = patientData.medications;
        document.getElementById('bloodType').textContent = patientData.bloodType;
        document.getElementById('emergencyContact').textContent = patientData.emergencyContact;
        
        console.log("Patient data loaded:", patientData);
        
        // Show notification
        showNotification(`Patient information loaded for ${patientData.name}`);
    }, 1000);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-gray-100');
        document.body.classList.add('bg-gray-900', 'text-white');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.add('bg-gray-100');
        document.body.classList.remove('bg-gray-900', 'text-white');
    }
    
    console.log("Dark mode:", isDarkMode);
}

// Show a notification
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Health Emergency Assistant', {
            body: message,
            icon: '/icons/icon-192x192.png'
        });
    } else {
        // Fallback to alert for demo purposes
        alert(message);
    }
}