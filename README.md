# FitNova - A New Fitness Experience

FitNova is an independent student project.

FitNova is a modern webcam-based fitness game web application powered by client-side computer vision (Google MediaPipe) and real-time biomechanical analysis.

> "Your workout is the game. Your body is the controller."

---

## Highlights

- **100% On-Device Pose Tracking**: Evaluates joint angles with 33 landmarks in real time using WebAssembly and WebGL. No camera frames or video are ever uploaded to any server.
- **Real-Time Rep & Form Detection**: Accurate biomechanical angle detection for squats, jumping jacks, bicep curls, wall sits, butt kicks, and forward lunges.
- **Deterministic Rotating Daily Challenges**: 9 original challenges deterministically selected by local date, updating every day at local midnight.
- **Verified Public Leaderboard**: Anonymous guest ranking by verified XP, level, and streaks with secret anti-hijacking tokens.
- **Ghost Racing & Superpowers**: Race against your previous personal bests and charge up multiplier superpowers.

---

## Getting Started

### Client
```bash
npm install
npm run dev
```
Runs Vite on [http://localhost:5180](http://localhost:5180).

### Server
```bash
cd server
npm install
npm run dev
```
Runs Express on [http://localhost:5000](http://localhost:5000).

---

## License
MIT
