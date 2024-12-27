## Introduction
This Triple Pendulum Simulator is a web-based tool that demonstrates how a system of three pendulums connected in series behaves. It visualizes the real-time motion based on physical equations and lets you explore complex chaotic motion with adjustable parameters.

## Features

- Real-time physics simulation of a triple pendulum system
- Interactive controls for adjusting:
  - Lengths of all three pendulum arms
  - Masses of all three bobs
  - Initial angles
  - Gravity strength
  - Damping coefficient
  - Path visibility and maximum path points
- Visual trail effect showing the path of motion
- Pause/Resume/Reset functionality
- Smooth animations and clean UI

## Physics

The simulator implements the full equations of motion for a triple pendulum system, accounting for:
- Gravitational and centripetal forces
- Angular momentum
- Chaotic motion
- Energy conservation
- Damping effects

Small changes in the initial conditions often lead to vastly different trajectories over time, illustrating the chaotic nature of the system.

## Usage

- Adjust the sliders and input fields to set up your desired configuration:
  - **Lengths**: Control the length of each pendulum arm (0.5m – 2.5m)
  - **Masses**: Set the mass of each bob
  - **Angles**: Set the initial angles (-180° to 180°)
  - **Gravity**: Modify the gravitational acceleration
  - **Damping**: Control energy dissipation
  - **Show Path**: Toggle visibility of each bob’s trail
  - **Max Path Points**: Specify how many points to store for the path

- Click “Start” to begin the simulation.  
- Use the “Reset” button to stop and return to your chosen configuration.  
- Observe how different parameters influence the triple pendulum’s behavior in real time.

## Technical Details

Built using JavaScript and HTML5 Canvas, the simulator uses:
- Numerical integration for solving the extended triple pendulum differential equations
- Optimized rendering for path effects
- Responsive canvas and centralized controls
- Event-driven architecture for user interactions
