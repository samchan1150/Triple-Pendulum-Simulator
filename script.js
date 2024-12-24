const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Scaling factor
const scale = 100; // 100 pixels per meter

// Pendulum parameters
let length = 1.5 * scale; // Length in pixels (1.5 meters)
let angle = 30 * Math.PI / 180; // Convert degrees to radians
let angleVelocity = 0;
let angleAcceleration = 0;
let gravity = 9.81 * scale; // Gravity in pixels/s²
let damping = 0.02;
let paused = true;
let lastTimestamp = 0;

// Store the initial conditions
let initialAngle = angle;
let initialAngleVelocity = 0;

// Origin point
const originX = canvas.width / 2;
const originY = 0;

// Initialize controls
const lengthSlider = document.getElementById('length');
const angleSlider = document.getElementById('angle');
const gravityInput = document.getElementById('gravity');
const dampingInput = document.getElementById('damping');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Event listeners for controls
lengthSlider.addEventListener('input', () => {
    const lengthInMeters = parseFloat(lengthSlider.value);
    length = lengthInMeters * scale; // Convert length to pixels

    // Optionally reset the simulation
    angle = initialAngle;
    angleVelocity = 0;
    angleAcceleration = 0;
    draw();
});

angleSlider.addEventListener('input', () => {
    initialAngle = parseFloat(angleSlider.value) * Math.PI / 180;
    angle = initialAngle;
    angleVelocity = 0;
    angleAcceleration = 0;
    draw();
});

gravityInput.addEventListener('input', () => {
    const gravityValue = parseFloat(gravityInput.value);
    gravity = gravityValue * scale; // Convert gravity to pixels/s²

    // Optionally reset the simulation
    angle = initialAngle;
    angleVelocity = 0;
    angleAcceleration = 0;
    draw();
});

dampingInput.addEventListener('input', () => {
    damping = parseFloat(dampingInput.value);
});

// Start button resets the simulation and starts it
startBtn.addEventListener('click', () => {
    // Reset simulation to initial conditions
    angle = initialAngle;
    angleVelocity = initialAngleVelocity;
    angleAcceleration = 0;

    // Reset timestamp
    lastTimestamp = performance.now();

    // Start the simulation if it was paused
    if (paused) {
        paused = false;
        requestAnimationFrame(animate);
    }
});

// Pause button toggles between pause and resume
pauseBtn.addEventListener('click', () => {
    paused = !paused; // Toggle pause state

    if (!paused) {
        // Resume the animation
        lastTimestamp = performance.now();
        requestAnimationFrame(animate);
        pauseBtn.textContent = 'Pause';
    } else {
        // Update button text to 'Resume'
        pauseBtn.textContent = 'Resume';
    }
});

// Draw pendulum
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate pendulum position
    const bobX = originX + length * Math.sin(angle);
    const bobY = originY + length * Math.cos(angle);

    // Draw rod
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw bob
    ctx.beginPath();
    ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#007BFF';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

// Update physics
function update(timestamp) {
    // Calculate the time difference
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert ms to seconds
    lastTimestamp = timestamp;

    // Handle the initial call
    if (isNaN(deltaTime) || deltaTime <= 0) {
        return;
    }

    // Formula: θ'' = -(g / L) * sin(θ) - damping * θ'
    angleAcceleration = (-gravity / length) * Math.sin(angle) - damping * angleVelocity;
    angleVelocity += angleAcceleration * deltaTime;
    angle += angleVelocity * deltaTime;
}

function animate(timestamp) {
    if (!paused) {
        update(timestamp);
        draw();
        requestAnimationFrame(animate);
    }
}

// Initial draw
draw();