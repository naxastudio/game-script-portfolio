# HTML5 Arena Demo

A small open-source browser game script that demonstrates a clean Canvas game loop, keyboard input, enemy spawning, collision checks, scoring, and restart behavior.

This sample is intentionally lightweight. It uses only HTML, CSS, and vanilla JavaScript so the core gameplay code is easy to read and adapt.

## Features

- Responsive Canvas setup
- Player movement with WASD or arrow keys
- Enemy spawning with increasing pressure over time
- Collision detection
- Score and survival timer
- Pause and restart controls
- Simple separation between state, update, render, and input logic

## Run Locally

Open `index.html` in a browser.

No build step is required.

## Controls

| Key | Action |
| --- | --- |
| WASD / Arrow keys | Move |
| Space | Pause / resume |
| R | Restart |

## Project Structure

```text
html5-arena-demo/
├── index.html
├── src/
│   ├── game.js
│   └── styles.css
└── README.md
```

## What This Demonstrates

This sample is useful for clients and developers who want to review:

- How gameplay state is organized
- How input is handled without a framework
- How a game loop updates entities and renders frames
- How small prototypes can be documented for future extension

## Possible Extensions

- Add collectible items
- Add player health instead of instant game over
- Add enemy types
- Add sound effects
- Add mobile touch controls
- Add a high-score table using local storage

## License

MIT License. See the repository root `LICENSE` file.
