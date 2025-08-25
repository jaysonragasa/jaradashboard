![Gif Preview](https://github.com/jaysonragasa/jaradashboard/blob/main/anim_v2_1.gif?raw=true)

# Open Dashboard with Modular Widgets

A sleek, modern, and customizable dashboard built with vanilla JavaScript. This project features draggable and resizable widgets with persistent state, a "glassmorphism" UI, and a modular design that makes it easy to add new functionality.

---

## Features

- **Draggable & Persistent Layout**: Drag and drop widgets to arrange your perfect layout. All positions are saved to your browser's local storage.
- **Collapsible Widgets**: Click any widget's header to minimize it to an icon, saving screen space.
- **Install Widgets:** Add new widgets directly from the application's interface.
- **Mobile-First Default**: On first load or after a reset, widgets stack neatly on the left, providing a great experience on any device.
- **Long-Press Menu**: A context menu on the background allows you to reset the layout or collapse all widgets, ensuring you never lose control of the UI.
- **Live Data & Animations**: The weather widget fetches live data and displays beautiful, full-background animations that correspond to the current conditions.

### Included Widgets:
- **Weather**: Live temperature, conditions, and hourly forecast with animated backgrounds. This widget will ask for location permission.
- **Analog Clock**: A real-time analog clock with the current date.
- **Interactive Calendar**: View months, see the current date, and add/delete events for any day.
- **Todo List**: A fully functional to-do list with draggable reordering and completion toggles.
- **Sticky Notes**: Add, edit, and move multiple sticky notes within their own container.

---

## Tech Stack

- **HTML5**
- **CSS3** (Flexbox, Grid, Custom Animations)
- **Tailwind CSS** (Loaded via CDN for rapid prototyping)
- **Vanilla JavaScript (ES6+)**: No frameworks needed! All logic is handled with modern, clean JavaScript.
- **APIs**:
  - **Open-Meteo API** for live weather data.
- **Browser `localStorage`** for persisting widget positions and data.

---

## Add Widget

![Gif Preview](https://github.com/jaysonragasa/jaradashboard/blob/main/addwidget.gif?raw=true)


## Manage Widget
![Gif Preview](https://github.com/jaysonragasa/jaradashboard/blob/main/managewidget.gif?raw=true)

---

## Starfield Animation Widget
![Gif Preview](https://github.com/jaysonragasa/jaradashboard/blob/main/Animation%2008252025102440.gif?raw=true)

#### Icon SVG
```XML
<svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="black"/><circle cx="4" cy="6" r="1" fill="white"/><circle cx="18" cy="4" r="1.5" fill="white"/><circle cx="10" cy="12" r="0.8" fill="white"/><circle cx="20" cy="18" r="1.2" fill="white"/><circle cx="7" cy="19" r="1" fill="white"/><circle cx="12" cy="3" r="0.6" fill="white"/><circle cx="2" cy="15" r="0.9" fill="white"/><circle cx="22" cy="9" r="0.7" fill="white"/><circle cx="15" cy="21" r="1.1" fill="white"/><circle cx="5" cy="2" r="0.5" fill="white"/><circle cx="19" cy="11" r="0.8" fill="white"/><circle cx="3" cy="22" r="0.6" fill="white"/><circle cx="21" cy="5" r="0.9" fill="white"/><circle cx="9" cy="17" r="0.7" fill="white"/></svg>
```
#### HTML & Script
Just copy the entire code and paste it in HTML & Script field
```javascript
<canvas id="starfield" style="width:100%; height:100%; background:black; display:block;"></canvas>
<script>
(function() {
	const canvas = document.getElementById('starfield');
	if (!canvas) {
		console.error("Canvas element not found!");
		return;
	}

	const ctx = canvas.getContext('2d');

	// Set canvas to current displayed size
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	const numStars = 800;
	const stars = [];
	const speed = 1;

	// Initialize stars with random depth across the canvas width
	for (let i = 0; i < numStars; i++) {
		stars[i] = {
			x: (Math.random() - 0.5) * canvas.width,
			y: (Math.random() - 0.5) * canvas.height,
			z: Math.random() * canvas.width,
		};
	}

	// Draw stars with optional first-frame flag
	function drawStars(isFirstFrame = false) {
		ctx.fillStyle = isFirstFrame ? 'black' : 'rgba(0,0,0,0.3)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);

		for (let i = 0; i < numStars; i++) {
			const star = stars[i];
			const k = 128.0 / star.z;
			const px = star.x * k;
			const py = star.y * k;
			const size = (1 - star.z / canvas.width) * 2.5;

			ctx.beginPath();
			ctx.fillStyle = 'white';
			ctx.arc(px, py, size, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	}

	// Animate stars
	function animate() {
		for (let i = 0; i < numStars; i++) {
			const star = stars[i];
			star.z -= speed;
			if (star.z <= 0) {
				star.x = (Math.random() - 0.5) * canvas.width;
				star.y = (Math.random() - 0.5) * canvas.height;
				star.z = canvas.width;
			}
		}
		drawStars();
		requestAnimationFrame(animate);
	}

	// Draw the very first frame instantly
	drawStars(true);

	// Start the animation loop
	animate();

	// Resize handling
	const handleResize = () => {
		setTimeout(() => {
			if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
				canvas.width = canvas.offsetWidth;
				canvas.height = canvas.offsetHeight;

				for (let i = 0; i < numStars; i++) {
					stars[i].z = Math.random() * canvas.width;
				}
			}
		}, 50);
	};

	if ('ResizeObserver' in window) {
		const observer = new ResizeObserver(handleResize);
		observer.observe(canvas.parentElement || canvas);
	} else {
		window.addEventListener('resize', handleResize);
	}
})();
</script>
```

### Digital Block Clock
![Gif Preview](https://github.com/jaysonragasa/jaradashboard/blob/main/Animation%2008252025105714.gif?raw=true)

#### SVG Icon
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="30" fill="white" stroke="black" stroke-width="3"/><line x1="32" y1="32" x2="16" y2="32" stroke="black" stroke-width="8"/><line x1="32" y1="32" x2="32" y2="10" stroke="black" stroke-width="7"/><line x1="32" y1="32" x2="32" y2="6" stroke="red" stroke-width="5" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="4" fill="black"/></svg>
```

#### HTML & Script
```javascript
<canvas id="clock" style="background: transparent; overflow: hidden; width: 100%; height: 100%"></canvas>
<script>
(function() {
	const canvas = document.getElementById("clock");
	const ctx = canvas.getContext("2d");

	// One-time sizing at start
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	const blockSize = 6;

	const digitPatterns = {
		"0": [
				"11110", 
				"10011", 
				"10101", 
				"10101", 
				"10101", 
				"11001", 
				"01111"],
		"1": ["00100", "01100", "00100", "00100", "00100", "00100", "11111"],
		"2": ["11111", "00001", "11111", "10000", "10000", "10000", "11111"],
		"3": ["11111", "00001", "11111", "00001", "00001", "00001", "11111"],
		"4": ["10001", "10001", "11111", "00001", "00001", "00001", "00001"],
		"5": ["11111", "10000", "11111", "00001", "00001", "00001", "11111"],
		"6": ["11111", "10000", "11111", "10001", "10001", "10001", "11111"],
		"7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
		"8": ["11111", "10001", "11111", "10001", "10001", "10001", "11111"],
		"9": ["11111", "10001", "11111", "00001", "00001", "00001", "11111"],
		":": ["0", "1", "0", "0", "1", "0", "0"]
	};

	class Block {
		constructor(x, y, color) {
			this.x = x;
			this.y = y;
			this.targetY = y;
			this.vy = 0;
			this.color = color;
			this.falling = false;
		}
		update() {
			if (this.falling) {
				this.vy += 0.5;
				this.y += this.vy;
			} else {
				if (Math.abs(this.y - this.targetY) > 1) {
					this.y += (this.targetY - this.y) * 0.1;
				} else {
					this.y = this.targetY;
				}
			}
		}
		draw() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, blockSize - 2, blockSize - 2);
		}
	}

	let digitBlocks = [];

	function formatDate12h(date) {
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();

		hours = hours % 12 || 12;

		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function getTimeString() {
		return formatDate12h(new Date());
	}

	function buildDigitBlocks(digits) {
		const spacing = 6;
		let offsetX = (canvas.width - (digits.length * (5 * blockSize + spacing))) / 2;
		const offsetY = (canvas.height - 7 * blockSize) / 2;

		let newDigitBlocks = [];
		for (let i = 0; i < digits.length; i++) {
			const pattern = digitPatterns[digits[i]];
			let digitGroup = [];
			console.log(digits);
			for (let row = 0; row < pattern.length; row++) {
				for (let col = 0; col < pattern[row].length; col++) {
					if (pattern[row][col] === "1") {
						const x = offsetX + col * blockSize;
						const y = offsetY + row * blockSize;
						let b = new Block(x, -Math.random() * 200, "cyan");
						b.targetY = y;
						digitGroup.push(b);
					}
				}
			}
			newDigitBlocks.push(digitGroup);
			offsetX += (5 * blockSize + spacing);
		}
		return newDigitBlocks;
	}

	function updateClock(newTime, oldTime) {
		const newBlocks = buildDigitBlocks(newTime);
		for (let i = 0; i < newTime.length; i++) {
			if (newTime[i] !== oldTime[i]) {
				digitBlocks[i].forEach(b => b.falling = true);
				digitBlocks[i] = newBlocks[i];
			}
		}
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		digitBlocks.flat().forEach(b => {
			b.update();
			b.draw();
		});
	}

	function startClock() {
		let prevDigits = getTimeString();
		digitBlocks = buildDigitBlocks(prevDigits);
		updateClock(prevDigits, prevDigits);

		setInterval(() => {
			const newTime = getTimeString();
			if (newTime !== prevDigits) {
				updateClock(newTime, prevDigits);
				prevDigits = newTime;
			}
			draw();
		}, 1000 / 60); // ~60 FPS
	}

	// Start immediately when this script is injected
	startClock();
})();
</script>
```
