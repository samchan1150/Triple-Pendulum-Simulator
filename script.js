class PendulumSimulator {
    constructor(container) {
        this.container = container;
        this.canvas = container.querySelector('.pendulumCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Scaling factor
        this.scale = 50; // 50 pixels per meter
        
        // Pendulum parameters
        this.length1 = 1.5 * this.scale; // Length of the first pendulum
        this.mass1 = 20; // Mass of the first bob
        this.angle1 = 90 * Math.PI / 180; // Initial angle in radians
        this.angleVelocity1 = 0;
        this.angleAcceleration1 = 0;
        
        this.length2 = 1.5 * this.scale; // Length of the second pendulum
        this.mass2 = 20; // Mass of the second bob
        this.angle2 = 60 * Math.PI / 180; // Initial angle in radians
        this.angleVelocity2 = 0;
        this.angleAcceleration2 = 0;
        
        this.length3 = 1.5 * this.scale;
        this.mass3 = 20;
        this.angle3 = -90 * Math.PI / 180;
        this.angleVelocity3 = 0;
        this.angleAcceleration3 = 0;
        
        this.gravity = 9.81 * this.scale;
        this.damping = 0.02;
        this.paused = true;
        this.lastTimestamp = 0;
        
        // Origin point
        this.originX = this.canvas.width / 2;
        this.originY = this.canvas.height / 4; // Adjusted to upper part for better visibility
        
        // Path storage
        this.path = {
            bob1: [],
            bob2: [],
            bob3: []
        };
        
        // Maximum number of path points to store
        this.maxPathPoints = 1000;
        
        // References to controls
        this.lengthSlider1 = container.querySelector('.length1');
        this.lengthSlider2 = container.querySelector('.length2');
        this.lengthSlider3 = container.querySelector('.length3');
        this.massInput1 = container.querySelector('.mass1');
        this.massInput2 = container.querySelector('.mass2');
        this.massInput3 = container.querySelector('.mass3');
        this.angleSlider1 = container.querySelector('.angle1');
        this.angleSlider2 = container.querySelector('.angle2');
        this.angleSlider3 = container.querySelector('.angle3');
        this.gravityInput = container.querySelector('.gravity');
        this.dampingInput = container.querySelector('.damping');
        this.currentLength1 = container.querySelector('.currentLength1');
        this.currentMass1 = container.querySelector('.currentMass1');
        this.currentAngle1 = container.querySelector('.currentAngle1');
        
        this.currentLength2 = container.querySelector('.currentLength2');
        this.currentMass2 = container.querySelector('.currentMass2');
        this.currentAngle2 = container.querySelector('.currentAngle2');
        
        this.currentLength3 = container.querySelector('.currentLength3');
        this.currentMass3 = container.querySelector('.currentMass3');
        this.currentAngle3 = container.querySelector('.currentAngle3');
        
        this.currentGravity = container.querySelector('.currentGravity');
        this.currentDamping = container.querySelector('.currentDamping');
        this.currentMaxPathPoints = container.querySelector('.currentMaxPathPoints');
        
        this.showPath = true;
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initial draw
        this.drawPendulum();
        
        // Initialize the display with current values
        this.updateCurrentConfigDisplay();
    }
    
    initEventListeners() {
        // Length sliders
        this.lengthSlider1.addEventListener('input', () => {
            this.length1 = parseFloat(this.lengthSlider1.value) * this.scale;
            this.updateCurrentConfigDisplay();
        });
        this.lengthSlider2.addEventListener('input', () => {
            this.length2 = parseFloat(this.lengthSlider2.value) * this.scale;
            this.updateCurrentConfigDisplay();
        });
        this.lengthSlider3.addEventListener('input', () => {
            this.length3 = parseFloat(this.lengthSlider3.value) * this.scale;
            this.updateCurrentConfigDisplay();
        });
        
        // Mass inputs
        this.massInput1.addEventListener('input', () => {
            this.mass1 = parseFloat(this.massInput1.value);
            this.updateCurrentConfigDisplay();
        });
        this.massInput2.addEventListener('input', () => {
            this.mass2 = parseFloat(this.massInput2.value);
            this.updateCurrentConfigDisplay();
        });
        this.massInput3.addEventListener('input', () => {
            this.mass3 = parseFloat(this.massInput3.value);
            this.updateCurrentConfigDisplay();
        });
        
        // Angle sliders
        this.angleSlider1.addEventListener('input', () => {
            this.angle1 = parseFloat(this.angleSlider1.value) * Math.PI / 180;
            this.updateCurrentConfigDisplay();
        });
        this.angleSlider2.addEventListener('input', () => {
            this.angle2 = parseFloat(this.angleSlider2.value) * Math.PI / 180;
            this.updateCurrentConfigDisplay();
        });
        this.angleSlider3.addEventListener('input', () => {
            this.angle3 = parseFloat(this.angleSlider3.value) * Math.PI / 180;
            this.updateCurrentConfigDisplay();
        });
        
        // Gravity input
        this.gravityInput.addEventListener('input', () => {
            this.gravity = parseFloat(this.gravityInput.value) * this.scale;
            this.updateCurrentConfigDisplay();
        });
        
        // Damping input
        this.dampingInput.addEventListener('input', () => {
            this.damping = parseFloat(this.dampingInput.value);
            this.updateCurrentConfigDisplay();
        });
    }
    
    updateCurrentConfigDisplay() {
        this.currentLength1.textContent = (this.length1 / this.scale).toFixed(2);
        this.currentMass1.textContent = this.mass1;
        this.currentAngle1.textContent = (this.angle1 * 180 / Math.PI).toFixed(2);
    
        this.currentLength2.textContent = (this.length2 / this.scale).toFixed(2);
        this.currentMass2.textContent = this.mass2;
        this.currentAngle2.textContent = (this.angle2 * 180 / Math.PI).toFixed(2);
    
        this.currentLength3.textContent = (this.length3 / this.scale).toFixed(2);
        this.currentMass3.textContent = this.mass3;
        this.currentAngle3.textContent = (this.angle3 * 180 / Math.PI).toFixed(2);
    
        this.currentGravity.textContent = (this.gravity / this.scale).toFixed(2);
        this.currentDamping.textContent = this.damping.toFixed(2);
        this.currentMaxPathPoints.textContent = this.maxPathPoints;
    }
    
    updatePhysics(timestamp) {
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
    
        if (isNaN(deltaTime) || deltaTime <= 0) return;
    
        const sin1 = Math.sin(this.angle1);
        const sin2 = Math.sin(this.angle2);
        const sin3 = Math.sin(this.angle3);
        const cos1 = Math.cos(this.angle1);
        const cos2 = Math.cos(this.angle2);
        const cos3 = Math.cos(this.angle3);
        const sin12 = Math.sin(this.angle1 - this.angle2);
        const sin23 = Math.sin(this.angle2 - this.angle3);
        const cos12 = Math.cos(this.angle1 - this.angle2);
        const cos23 = Math.cos(this.angle2 - this.angle3);
    
        // Equations for triple pendulum motion
        const denom = 2 * this.mass1 + this.mass2 + this.mass3;
        
        this.angleAcceleration1 = (-this.gravity * (denom) * sin1 - this.mass2 * this.gravity * Math.sin(this.angle1 - 2 * this.angle2) 
            - this.mass3 * this.gravity * Math.sin(this.angle1 - 2 * this.angle3) - 2 * sin12 * this.mass2 
            * (this.angleVelocity2 * this.angleVelocity2 * this.length2 + this.angleVelocity1 * this.angleVelocity1 * this.length1 * cos12)) 
            / (this.length1 * denom);
    
        this.angleAcceleration2 = (2 * sin12 * (this.angleVelocity1 * this.angleVelocity1 * this.length1 * (this.mass1 + this.mass2) 
            + this.gravity * (this.mass1 + this.mass2) * cos1 + this.angleVelocity2 * this.angleVelocity2 * this.length2 * this.mass2 * cos12)) 
            / (this.length2 * denom);
    
        this.angleAcceleration3 = (2 * sin23 * (this.angleVelocity2 * this.angleVelocity2 * this.length2 * (this.mass2 + this.mass3) 
            + this.gravity * (this.mass2 + this.mass3) * cos2 + this.angleVelocity3 * this.angleVelocity3 * this.length3 * this.mass3 * cos23)) 
            / (this.length3 * denom);
    
        // Apply damping
        this.angleAcceleration1 -= this.damping * this.angleVelocity1;
        this.angleAcceleration2 -= this.damping * this.angleVelocity2;
        this.angleAcceleration3 -= this.damping * this.angleVelocity3;
    
        // Update velocities and angles
        this.angleVelocity1 += this.angleAcceleration1 * deltaTime;
        this.angleVelocity2 += this.angleAcceleration2 * deltaTime;
        this.angleVelocity3 += this.angleAcceleration3 * deltaTime;
        
        this.angle1 += this.angleVelocity1 * deltaTime;
        this.angle2 += this.angleVelocity2 * deltaTime;
        this.angle3 += this.angleVelocity3 * deltaTime;
    }
    
    drawPendulum() {
        if (!this.showPath) {
            // Clear the canvas with a solid color when path is disabled
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Draw a semi-transparent rectangle to create a fading trail effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    
        // Calculate bob positions
        const bob1X = this.originX + this.length1 * Math.sin(this.angle1);
        const bob1Y = this.originY + this.length1 * Math.cos(this.angle1);
    
        const bob2X = bob1X + this.length2 * Math.sin(this.angle2);
        const bob2Y = bob1Y + this.length2 * Math.cos(this.angle2);
    
        const bob3X = bob2X + this.length3 * Math.sin(this.angle3);
        const bob3Y = bob2Y + this.length3 * Math.cos(this.angle3);
    
        if (this.showPath) {
            // Store the current positions
            this.path.bob1.push({ x: bob1X, y: bob1Y });
            this.path.bob2.push({ x: bob2X, y: bob2Y });
            this.path.bob3.push({ x: bob3X, y: bob3Y });
    
            // Limit the number of stored points to prevent memory issues
            if (this.path.bob1.length > this.maxPathPoints) {
                this.path.bob1.shift();
                this.path.bob2.shift();
                this.path.bob3.shift();
            }
    
            // Draw the paths
            this.drawPath(this.path.bob1, '#007BFF');
            this.drawPath(this.path.bob2, '#FF4136');
            this.drawPath(this.path.bob3, '#2ECC40');
        } else {
            // Clear path arrays when path display is disabled
            this.path.bob1 = [];
            this.path.bob2 = [];
            this.path.bob3 = [];
        }
    
        // Draw first rod and bob
        this.ctx.beginPath();
        this.ctx.moveTo(this.originX, this.originY);
        this.ctx.lineTo(bob1X, bob1Y);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    
        this.ctx.beginPath();
        this.ctx.arc(bob1X, bob1Y, this.mass1 / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#007BFF';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();
    
        this.drawVelocityArrow(bob1X, bob1Y, this.length1, this.angle1, this.angleVelocity1, 'darkblue');
    
        // Draw second rod and bob
        this.ctx.beginPath();
        this.ctx.moveTo(bob1X, bob1Y);
        this.ctx.lineTo(bob2X, bob2Y);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    
        this.ctx.beginPath();
        this.ctx.arc(bob2X, bob2Y, this.mass2 / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF4136';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();
    
        this.drawVelocityArrow(bob2X, bob2Y, this.length2, this.angle2, this.angleVelocity2, 'darkred');
    
        // Draw third rod and bob
        this.ctx.beginPath();
        this.ctx.moveTo(bob2X, bob2Y);
        this.ctx.lineTo(bob3X, bob3Y);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    
        this.ctx.beginPath();
        this.ctx.arc(bob3X, bob3Y, this.mass3 / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#2ECC40';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();
    
        this.drawVelocityArrow(bob3X, bob3Y, this.length3, this.angle3, this.angleVelocity3, 'darkgreen');
    }
    
    drawPath(bobPath, color) {
        if (bobPath.length < 2) return;
    
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(bobPath[0].x, bobPath[0].y);
        for (let i = 1; i < bobPath.length; i++) {
            this.ctx.lineTo(bobPath[i].x, bobPath[i].y);
        }
        this.ctx.stroke();
    }
    
    drawVelocityArrow(bx, by, rodLength, angle, angleVel, color) {
        const arrowScale = 0.2;
        const velocity = rodLength * angleVel;
        const arrowAngle = angle + Math.PI / 2;
        const endX = bx + arrowScale * velocity * Math.sin(arrowAngle);
        const endY = by + arrowScale * velocity * Math.cos(arrowAngle);
    
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    
        // Arrowhead
        const headSize = 10 * Math.sign(velocity);
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headSize * Math.sin(arrowAngle - 0.3),
            endY - headSize * Math.cos(arrowAngle - 0.3)
        );
        this.ctx.lineTo(
            endX - headSize * Math.sin(arrowAngle + 0.3),
            endY - headSize * Math.cos(arrowAngle + 0.3)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    
    animate(timestamp) {
        if (!this.paused) {
            this.updatePhysics(timestamp);
            this.drawPendulum();
            requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    startSimulation() {
        if (this.paused) {
            this.paused = false;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    resetSimulation() {
        // Stop the simulation
        this.paused = true;
    
        // Reset angles to current slider values
        this.angle1 = parseFloat(this.angleSlider1.value) * Math.PI / 180;
        this.angle2 = parseFloat(this.angleSlider2.value) * Math.PI / 180;
        this.angle3 = parseFloat(this.angleSlider3.value) * Math.PI / 180;
    
        // Reset velocities and accelerations
        this.angleVelocity1 = 0;
        this.angleVelocity2 = 0;
        this.angleVelocity3 = 0;
        this.angleAcceleration1 = 0;
        this.angleAcceleration2 = 0;
        this.angleAcceleration3 = 0;
    
        // Clear path arrays
        this.path.bob1 = [];
        this.path.bob2 = [];
        this.path.bob3 = [];
    
        // Clear the canvas
        this.drawPendulum();
    
        // Update the current configuration display
        this.updateCurrentConfigDisplay();
    }
}

// Initialize all pendulum simulators on the page
document.addEventListener('DOMContentLoaded', () => {
    const simulators = document.querySelectorAll('.pendulum-simulator');
    const simInstances = [];
    simulators.forEach(sim => {
        simInstances.push(new PendulumSimulator(sim));
    });

    // Global references
    const showPathCheckbox = document.querySelector('.showPath');
    const maxPathPointsInput = document.querySelector('.maxPathPoints');
    const resetBtn = document.querySelector('.resetBtn');
    const startBtn = document.querySelector('.startBtn');

    // Global event listeners to control all simulators
    showPathCheckbox.addEventListener('change', () => {
        simInstances.forEach(sim => {
            sim.showPath = showPathCheckbox.checked;
            if (!sim.showPath) {
                sim.path.bob1 = [];
                sim.path.bob2 = [];
                sim.path.bob3 = [];
                sim.drawPendulum();
            }
        });
    });

    maxPathPointsInput.addEventListener('input', () => {
        const newMax = parseInt(maxPathPointsInput.value, 10);
        if (!isNaN(newMax) && newMax >= 100 && newMax <= 5000) {
            simInstances.forEach(sim => {
                sim.maxPathPoints = newMax;
                sim.currentMaxPathPoints.textContent = newMax;
                Object.keys(sim.path).forEach(bob => {
                    if (sim.path[bob].length > newMax) {
                        sim.path[bob] = sim.path[bob].slice(sim.path[bob].length - newMax);
                    }
                });
            });
        }
    });

    startBtn.addEventListener('click', () => {
        simInstances.forEach(sim => sim.startSimulation());
    });

    resetBtn.addEventListener('click', () => {
        simInstances.forEach(sim => sim.resetSimulation());
    });
});
