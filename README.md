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

