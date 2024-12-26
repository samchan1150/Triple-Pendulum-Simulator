const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Scaling factor
const scale = 50; // 50 pixels per meter

// Pendulum parameters
let length1 = 1.5 * scale; // Length of the first pendulum
let mass1 = 20; // Mass of the first bob
let angle1 = 90 * Math.PI / 180; // Initial angle in radians
let angleVelocity1 = 0;
let angleAcceleration1 = 0;

let length2 = 1.5 * scale; // Length of the second pendulum
let mass2 = 20; // Mass of the second bob
let angle2 = 60 * Math.PI / 180; // Initial angle in radians
let angleVelocity2 = 0;
let angleAcceleration2 = 0;

let length3 = 1.5 * scale;
let mass3 = 20;
let angle3 = -90 * Math.PI / 180;
let angleVelocity3 = 0;
let angleAcceleration3 = 0;

let gravity = 9.81 * scale;
let damping = 0.02;
let paused = true; // Initially paused
let lastTimestamp = 0;

// Origin point
const originX = canvas.width / 2;
const originY = canvas.height / 4; // Adjusted to upper part for better visibility

// Path storage
const path = {
    bob1: [],
    bob2: [],
    bob3: []
};

// Maximum number of path points to store (now a let to allow dynamic updates)
let maxPathPoints = 1000;

// Initialize controls
const lengthSlider1 = document.getElementById('length1');
const lengthSlider2 = document.getElementById('length2');
const lengthSlider3 = document.getElementById('length3');
const massInput1 = document.getElementById('mass1');
const massInput2 = document.getElementById('mass2');
const massInput3 = document.getElementById('mass3');
const angleSlider1 = document.getElementById('angle1');
const angleSlider2 = document.getElementById('angle2');
const angleSlider3 = document.getElementById('angle3');
const gravityInput = document.getElementById('gravity');
const dampingInput = document.getElementById('damping');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// New path toggle
const showPathCheckbox = document.getElementById('showPath');
let showPath = showPathCheckbox.checked;

// New Max Path Points control
const maxPathPointsInput = document.getElementById('maxPathPoints');

// Current Configuration Display Elements
const currentLength1 = document.getElementById('currentLength1');
const currentMass1 = document.getElementById('currentMass1');
const currentAngle1 = document.getElementById('currentAngle1');

const currentLength2 = document.getElementById('currentLength2');
const currentMass2 = document.getElementById('currentMass2');
const currentAngle2 = document.getElementById('currentAngle2');

const currentLength3 = document.getElementById('currentLength3');
const currentMass3 = document.getElementById('currentMass3');
const currentAngle3 = document.getElementById('currentAngle3');

const currentGravity = document.getElementById('currentGravity');
const currentDamping = document.getElementById('currentDamping');
const currentMaxPathPoints = document.getElementById('currentMaxPathPoints');

// Function to update Current Configuration Display
function updateCurrentConfigDisplay() {
    currentLength1.textContent = (length1 / scale).toFixed(2);
    currentMass1.textContent = mass1;
    currentAngle1.textContent = (angle1 * 180 / Math.PI).toFixed(2);

    currentLength2.textContent = (length2 / scale).toFixed(2);
    currentMass2.textContent = mass2;
    currentAngle2.textContent = (angle2 * 180 / Math.PI).toFixed(2);

    currentLength3.textContent = (length3 / scale).toFixed(2);
    currentMass3.textContent = mass3;
    currentAngle3.textContent = (angle3 * 180 / Math.PI).toFixed(2);

    currentGravity.textContent = (gravity / scale).toFixed(2);
    currentDamping.textContent = damping.toFixed(2);
    currentMaxPathPoints.textContent = maxPathPoints;
}

// Initialize the display with default values
updateCurrentConfigDisplay();

// Event listeners for controls
lengthSlider1.addEventListener('input', () => {
    length1 = parseFloat(lengthSlider1.value) * scale;
    updateCurrentConfigDisplay();
});
lengthSlider2.addEventListener('input', () => {
    length2 = parseFloat(lengthSlider2.value) * scale;
    updateCurrentConfigDisplay();
});
lengthSlider3.addEventListener('input', () => {
    length3 = parseFloat(lengthSlider3.value) * scale;
    updateCurrentConfigDisplay();
});
massInput1.addEventListener('input', () => {
    mass1 = parseFloat(massInput1.value);
    updateCurrentConfigDisplay();
});
massInput2.addEventListener('input', () => {
    mass2 = parseFloat(massInput2.value);
    updateCurrentConfigDisplay();
});
massInput3.addEventListener('input', () => {
    mass3 = parseFloat(massInput3.value);
    updateCurrentConfigDisplay();
});
angleSlider1.addEventListener('input', () => {
    angle1 = parseFloat(angleSlider1.value) * Math.PI / 180;
    updateCurrentConfigDisplay();
});
angleSlider2.addEventListener('input', () => {
    angle2 = parseFloat(angleSlider2.value) * Math.PI / 180;
    updateCurrentConfigDisplay();
});
angleSlider3.addEventListener('input', () => {
    angle3 = parseFloat(angleSlider3.value) * Math.PI / 180;
    updateCurrentConfigDisplay();
});
gravityInput.addEventListener('input', () => {
    gravity = parseFloat(gravityInput.value) * scale;
    updateCurrentConfigDisplay();
});
dampingInput.addEventListener('input', () => {
    damping = parseFloat(dampingInput.value);
    updateCurrentConfigDisplay();
});

// Event listener for the show path checkbox
showPathCheckbox.addEventListener('change', () => {
    showPath = showPathCheckbox.checked;
    if (!showPath) {
        // Clear the path when disabled
        path.bob1 = [];
        path.bob2 = [];
        path.bob3 = [];
        drawPendulum(); // Redraw to clear paths
    }
});

// Event listener for the maxPathPoints input
maxPathPointsInput.addEventListener('input', () => {
    const newMax = parseInt(maxPathPointsInput.value, 10);
    if (!isNaN(newMax) && newMax >= 100 && newMax <= 5000) {
        maxPathPoints = newMax;
        currentMaxPathPoints.textContent = maxPathPoints;
        // Trim existing paths if necessary
        Object.keys(path).forEach(bob => {
            if (path[bob].length > maxPathPoints) {
                path[bob] = path[bob].slice(path[bob].length - maxPathPoints);
            }
        });
    }
});

// Function to update physics
function updatePhysics(timestamp) {
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isNaN(deltaTime) || deltaTime <= 0) return;

    const sin1 = Math.sin(angle1);
    const sin2 = Math.sin(angle2);
    const sin3 = Math.sin(angle3);
    const cos1 = Math.cos(angle1);
    const cos2 = Math.cos(angle2);
    const cos3 = Math.cos(angle3);
    const sin12 = Math.sin(angle1 - angle2);
    const sin23 = Math.sin(angle2 - angle3);
    const cos12 = Math.cos(angle1 - angle2);
    const cos23 = Math.cos(angle2 - angle3);

    // Equations for triple pendulum motion
    const denom = 2 * mass1 + mass2 + mass3;
    
    angleAcceleration1 = (-gravity * (denom) * sin1 - mass2 * gravity * Math.sin(angle1 - 2 * angle2) 
        - mass3 * gravity * Math.sin(angle1 - 2 * angle3) - 2 * sin12 * mass2 
        * (angleVelocity2 * angleVelocity2 * length2 + angleVelocity1 * angleVelocity1 * length1 * cos12)) 
        / (length1 * denom);

    angleAcceleration2 = (2 * sin12 * (angleVelocity1 * angleVelocity1 * length1 * (mass1 + mass2) 
        + gravity * (mass1 + mass2) * cos1 + angleVelocity2 * angleVelocity2 * length2 * mass2 * cos12)) 
        / (length2 * denom);

    angleAcceleration3 = (2 * sin23 * (angleVelocity2 * angleVelocity2 * length2 * (mass2 + mass3) 
        + gravity * (mass2 + mass3) * cos2 + angleVelocity3 * angleVelocity3 * length3 * mass3 * cos23)) 
        / (length3 * denom);

    // Apply damping
    angleAcceleration1 -= damping * angleVelocity1;
    angleAcceleration2 -= damping * angleVelocity2;
    angleAcceleration3 -= damping * angleVelocity3;

    // Update velocities and angles
    angleVelocity1 += angleAcceleration1 * deltaTime;
    angleVelocity2 += angleAcceleration2 * deltaTime;
    angleVelocity3 += angleAcceleration3 * deltaTime;
    
    angle1 += angleVelocity1 * deltaTime;
    angle2 += angleVelocity2 * deltaTime;
    angle3 += angleVelocity3 * deltaTime;
}

// Function to draw pendulum with optional path
function drawPendulum() {
    if (!showPath) {
        // Clear the canvas with a solid color when path is disabled
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Draw a semi-transparent rectangle to create a fading trail effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Calculate bob positions
    const bob1X = originX + length1 * Math.sin(angle1);
    const bob1Y = originY + length1 * Math.cos(angle1);

    const bob2X = bob1X + length2 * Math.sin(angle2);
    const bob2Y = bob1Y + length2 * Math.cos(angle2);

    const bob3X = bob2X + length3 * Math.sin(angle3);
    const bob3Y = bob2Y + length3 * Math.cos(angle3);

    if (showPath) {
        // Store the current positions
        path.bob1.push({ x: bob1X, y: bob1Y });
        path.bob2.push({ x: bob2X, y: bob2Y });
        path.bob3.push({ x: bob3X, y: bob3Y });

        // Limit the number of stored points to prevent memory issues
        if (path.bob1.length > maxPathPoints) {
            path.bob1.shift();
            path.bob2.shift();
            path.bob3.shift();
        }

        // Draw the paths
        drawPath(path.bob1, '#007BFF');
        drawPath(path.bob2, '#FF4136');
        drawPath(path.bob3, '#2ECC40');
    } else {
        // Clear path arrays when path display is disabled
        path.bob1 = [];
        path.bob2 = [];
        path.bob3 = [];
    }

    // Draw first rod and bob
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bob1X, bob1Y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bob1X, bob1Y, mass1 / 3, 0, Math.PI * 2);
    ctx.fillStyle = '#007BFF';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw second rod and bob
    ctx.beginPath();
    ctx.moveTo(bob1X, bob1Y);
    ctx.lineTo(bob2X, bob2Y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bob2X, bob2Y, mass2 / 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4136';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw third rod and bob
    ctx.beginPath();
    ctx.moveTo(bob2X, bob2Y);
    ctx.lineTo(bob3X, bob3Y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bob3X, bob3Y, mass3 / 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2ECC40';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
}

// Helper function to draw paths
function drawPath(bobPath, color) {
    if (bobPath.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(bobPath[0].x, bobPath[0].y);
    for (let i = 1; i < bobPath.length; i++) {
        ctx.lineTo(bobPath[i].x, bobPath[i].y);
    }
    ctx.stroke();
}

// Animation loop
function animate(timestamp) {
    if (!paused) {
        updatePhysics(timestamp);
        drawPendulum();
        requestAnimationFrame(animate);
    }
}

// Initial draw (Clears the canvas)
drawPendulum();

// Function to Start the Simulation
function startSimulation() {
    if (paused) {
        paused = false;
        lastTimestamp = performance.now();
        requestAnimationFrame(animate);
    }
}

// Function to Reset the Simulation
function resetSimulation() {
    // Stop the simulation
    paused = true;

    // Reset angles to current slider values
    angle1 = parseFloat(angleSlider1.value) * Math.PI / 180;
    angle2 = parseFloat(angleSlider2.value) * Math.PI / 180;
    angle3 = parseFloat(angleSlider3.value) * Math.PI / 180;

    // Reset velocities and accelerations
    angleVelocity1 = 0;
    angleVelocity2 = 0;
    angleVelocity3 = 0;
    angleAcceleration1 = 0;
    angleAcceleration2 = 0;
    angleAcceleration3 = 0;

    // Clear path arrays
    path.bob1 = [];
    path.bob2 = [];
    path.bob3 = [];

    // Clear the canvas
    drawPendulum();

    // Update the current configuration display
    updateCurrentConfigDisplay();
}

// Event listeners for Start and Reset buttons
startBtn.addEventListener('click', startSimulation);
resetBtn.addEventListener('click', resetSimulation);

// Note: The simulation does not start automatically on page load.
// Users must press the "Start" button to begin.