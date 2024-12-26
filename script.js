const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Scaling factor
const scale = 50; // 100 pixels per meter

// Pendulum parameters
let length1 = 1.5 * scale; // Length of the first pendulum
let mass1 = 20; // Mass of the first bob
let angle1 = 90 * Math.PI / 180; // Initial angle in radians
let angleVelocity1 = 0;
let angleAcceleration1 = 0;

let length2 = 1.5 * scale; // Length of the second pendulum
let mass2 = 20; // Mass of the second bob
let angle2 = -90 * Math.PI / 180; // Initial angle in radians
let angleVelocity2 = 0;
let angleAcceleration2 = 0;

let length3 = 1.5 * scale;
let mass3 = 20;
let angle3 = -90 * Math.PI / 180;
let angleVelocity3 = 0;
let angleAcceleration3 = 0;

let gravity = 9.81 * scale;
let damping = 0.02;
let paused = true;
let lastTimestamp = 0;

// Origin point
const originX = canvas.width / 2;
const originY = canvas.height / 2;

// Initialize controls (as shown above)

// Update physics
function update(timestamp) {
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

    // Complex equations for triple pendulum motion
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


// Draw pendulum with trail effect
function draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bob1X = originX + length1 * Math.sin(angle1);
    const bob1Y = originY + length1 * Math.cos(angle1);

    const bob2X = bob1X + length2 * Math.sin(angle2);
    const bob2Y = bob1Y + length2 * Math.cos(angle2);

    const bob3X = bob2X + length3 * Math.sin(angle3);
    const bob3Y = bob2Y + length3 * Math.cos(angle3);

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

// Add HTML controls for the third pendulum
const lengthSlider3 = document.getElementById('length3');
const massInput3 = document.getElementById('mass3');
const angleSlider3 = document.getElementById('angle3');

lengthSlider3.addEventListener('input', () => {
    length3 = parseFloat(lengthSlider3.value) * scale;
});
massInput3.addEventListener('input', () => {
    mass3 = parseFloat(massInput3.value);
});
angleSlider3.addEventListener('input', () => {
    angle3 = parseFloat(angleSlider3.value) * Math.PI / 180;
});

function animate(timestamp) {
    if (!paused) {
        update(timestamp);
        draw();
        requestAnimationFrame(animate);
    }
}

// Initial draw
draw();

// Start the animation
paused = false;
requestAnimationFrame(animate);

// Initialize controls
const lengthSlider1 = document.getElementById('length1');
const lengthSlider2 = document.getElementById('length2');
const massInput1 = document.getElementById('mass1');
const massInput2 = document.getElementById('mass2');
const angleSlider1 = document.getElementById('angle1');
const angleSlider2 = document.getElementById('angle2');
const startBtn = document.getElementById('startBtn');

// Event listeners for controls
lengthSlider1.addEventListener('input', () => {
    length1 = parseFloat(lengthSlider1.value) * scale;
});
lengthSlider2.addEventListener('input', () => {
    length2 = parseFloat(lengthSlider2.value) * scale;
});
massInput1.addEventListener('input', () => {
    mass1 = parseFloat(massInput1.value);
});
massInput2.addEventListener('input', () => {
    mass2 = parseFloat(massInput2.value);
});
angleSlider1.addEventListener('input', () => {
    angle1 = parseFloat(angleSlider1.value) * Math.PI / 180;
});
angleSlider2.addEventListener('input', () => {
    angle2 = parseFloat(angleSlider2.value) * Math.PI / 180;
});

// Start button resets the simulation and starts it
startBtn.addEventListener('click', () => {
    // Reset simulation to initial conditions
    angle1 = parseFloat(angleSlider1.value) * Math.PI / 180;
    angle2 = parseFloat(angleSlider2.value) * Math.PI / 180;
    angleVelocity1 = 0;
    angleVelocity2 = 0;
    angleAcceleration1 = 0;
    angleAcceleration2 = 0;

    // Reset timestamp
    lastTimestamp = performance.now();

    // Start the simulation if it was paused
    if (paused) {
        paused = false;
        requestAnimationFrame(animate);
    }
});


