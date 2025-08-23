// --- DEFAUT WIDGETS ---

function initClockWidget() {
	const icon = `<svg class="text-green-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
	const { widget, content } = createWidget('clock-widget', icon, 'Clock & Date', ['w-72']);

	content.classList.add('flex', 'flex-col', 'items-center');
	content.innerHTML = `
		<div class="clock-face mb-4 bg-black/20">
			<div class="hand hour-hand"></div>
			<div class="hand minute-hand"></div>
			<div class="hand second-hand"></div>
			<div class="clock-center"></div>
		</div>
		<p id="current-time" class="font-medium text-lg"></p>
		<p id="current-date" class="font-medium text-lg"></p>`;
	
	document.getElementById('dashboard-container').appendChild(widget);

	const hourHand = content.querySelector('.hour-hand');
	const minuteHand = content.querySelector('.minute-hand');
	const secondHand = content.querySelector('.second-hand');
	const dateElement = content.querySelector('#current-date');
	const timeElement = content.querySelector('#current-time');
	
	function getCurrentTime() {
	  const now = new Date();

	  let hours = now.getHours();
	  const minutes = now.getMinutes();
	  const seconds = now.getSeconds();
	  const ampm = hours >= 12 ? 'PM' : 'AM';

	  hours = hours % 12;
	  hours = hours ? hours : 12; // 0 becomes 12

	  const formattedTime = 
		`${hours.toString().padStart(2, '0')}:` +
		`${minutes.toString().padStart(2, '0')}:` +
		`${seconds.toString().padStart(2, '0')} ${ampm}`;

	  return formattedTime;
	}
	
	function setDate() {
		const now = new Date();
		secondHand.style.transform = `rotate(${((now.getSeconds() / 60) * 360) + 90}deg)`;
		minuteHand.style.transform = `rotate(${((now.getMinutes() / 60) * 360) + ((now.getSeconds() / 60) * 6) + 90}deg)`;
		hourHand.style.transform = `rotate(${(((now.getHours() % 12) / 12) * 360) + ((now.getMinutes() / 60) * 30) + 90}deg)`;
		dateElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
		timeElement.textContent = getCurrentTime();
	}
	setInterval(setDate, 1000);
	setDate();
}

// weather widget needs a location request 
// if allowed, it will detect the current location 
// if not, fallback will, it will return the current weather in Manila, Ph
async function initWeatherWidget() {
	const icon = `<svg class="text-blue-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
	// The createWidget function is assumed to be defined elsewhere.
	const { widget, content } = createWidget('weather-widget', icon, 'Weather', ['w-72']);
	
	content.innerHTML = `
		<div class="weather-animation-bg"></div>
		<div class="relative z-10">
			<div class="text-center">
				<p id="weather-temp" class="text-4xl font-bold">--°C</p>
				<p id="weather-desc" class="text-gray-200">Loading...</p>
				<p id="weather-location" class="text-sm mt-1">Fetching location...</p>
			</div>
			<div id="hourly-forecast" class="flex overflow-x-auto space-x-4 mt-4 pb-2"></div>
		</div>`;
	
	document.getElementById('dashboard-container').appendChild(widget);

	const tempEl = content.querySelector('#weather-temp');
	const descEl = content.querySelector('#weather-desc');
	const locationEl = content.querySelector('#weather-location');
	const hourlyForecastEl = content.querySelector('#hourly-forecast');
	const animationContainer = content.querySelector('.weather-animation-bg');
	
	function getWeatherDescription(code) {
		const descriptions = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle", 61: "Slight rain", 63: "Rain", 65: "Heavy rain", 80: "Showers", 81: "Rain showers", 82: "Violent showers", 95: "Thunderstorm" };
		return descriptions[code] || "Clear";
	}
	
	function getWeatherIcon(code, isDay = 1) {
		// Simplified icon mapping
		if (code <= 1) return isDay ? '☀️' : '🌙';
		if (code <= 3) return '☁️';
		if (code >= 51 && code <= 65) return '🌧️';
		if (code >= 80 && code <= 82) return '🌦️';
		if (code >= 95) return '⛈️';
		return '🌫️'; // Fog
	}

	function updateWeatherAnimation(code, container) {
		container.innerHTML = '';
		if (code <= 1) {
			container.className = 'weather-animation-bg weather-sunny';
			container.innerHTML = '<div class="sun"></div>';
		} else if (code <= 3 || code === 45 || code === 48) {
			container.className = 'weather-animation-bg weather-cloudy';
			container.innerHTML = '<div class="sun" style="background:#fde047;"></div><div class="cloud cloud1"></div><div class="cloud cloud2"></div>';
		} else {
			container.className = 'weather-animation-bg weather-rainy';
			let html = '<div class="cloud cloud1" style="background:#9ca3af;"></div><div class="cloud cloud2" style="background:#9ca3af;"></div>';
			for (let i = 0; i < 20; i++) {
				html += `<div class="rain-drop" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s; animation-duration: ${0.5 + Math.random() * 0.5}s;"></div>`;
			}
			container.innerHTML = html;
		}
	}

	async function fetchAndDisplayWeather(lat, lon) {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code&timezone=auto`;
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error('Weather data not available');
			const data = await response.json();
			
			const temp = Math.round(data.current.temperature_2m);
			const weatherCode = data.current.weather_code;
			tempEl.textContent = `${temp}°C`;
			descEl.textContent = getWeatherDescription(weatherCode);
            // Use the timezone from the API response for a more accurate location name
			locationEl.textContent = data.timezone.split('/')[1].replace('_', ' ');
			updateWeatherAnimation(weatherCode, animationContainer);

			// Hourly Forecast
			hourlyForecastEl.innerHTML = '';
			const now = new Date();
			const currentHour = now.getHours();
			const startIndex = data.hourly.time.findIndex(time => new Date(time).getHours() >= currentHour);

			for (let i = startIndex; i < startIndex + 8; i++) {
                if (!data.hourly.time[i]) continue; // Guard against missing data
				const hourData = {
					time: new Date(data.hourly.time[i]).getHours(),
					temp: Math.round(data.hourly.temperature_2m[i]),
					code: data.hourly.weather_code[i]
				};
				const hourEl = document.createElement('div');
				hourEl.className = 'flex flex-col items-center space-y-1 flex-shrink-0';
				hourEl.innerHTML = `
					<span class="text-xs">${hourData.time % 12 === 0 ? 12 : hourData.time % 12}${hourData.time < 12 ? 'am' : 'pm'}</span>
					<div class="w-8 h-8 text-2xl">${getWeatherIcon(hourData.code, data.current.is_day)}</div>
					<span class="font-bold text-sm">${hourData.temp}°</span>
				`;
				hourlyForecastEl.appendChild(hourEl);
			}

		} catch (error) {
			console.error("Failed to fetch weather:", error);
			descEl.textContent = 'Could not load data';
		}
	}

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Success callback
                (position) => {
                    fetchAndDisplayWeather(position.coords.latitude, position.coords.longitude);
                },
                // Error callback
                (error) => {
                    console.error("Geolocation error:", error);
                    locationEl.textContent = "Location denied.";
                    // Fallback to default location (Manila)
                    fetchAndDisplayWeather(14.5995, 120.9842);
                }
            );
        } else {
            locationEl.textContent = "Geolocation not supported.";
            // Fallback to default location (Manila)
            fetchAndDisplayWeather(14.5995, 120.9842);
        }
    }

    // Start the process by getting the location
    getLocation();
}


function initCalendarWidget() {
	const icon = `<svg class="text-purple-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`;
	const { widget, content } = createWidget('calendar-widget', icon, 'Calendar', ['w-80']);
	
	content.innerHTML = `
		<div class="flex justify-between items-center mb-2">
			<button id="prev-month" class="p-1 rounded-full hover:bg-white/20">&lt;</button>
			<h3 id="month-year" class="font-semibold text-lg"></h3>
			<button id="next-month" class="p-1 rounded-full hover:bg-white/20">&gt;</button>
		</div>
		<div id="calendar-grid" class="grid grid-cols-7 gap-1 text-center"></div>
		<div id="event-display-container" class="mt-4"></div>`;
	
	document.getElementById('dashboard-container').appendChild(widget);

	const KEY = 'dashboardCalendarEvents';
	const monthYearEl = content.querySelector('#month-year');
	const grid = content.querySelector('#calendar-grid');
	const prevBtn = content.querySelector('#prev-month');
	const nextBtn = content.querySelector('#next-month');
	const display = content.querySelector('#event-display-container');
	const modal = document.getElementById('event-modal'); // Modal is global
	const input = document.getElementById('event-input');
	const saveBtn = document.getElementById('save-event-btn');
	const cancelBtn = document.getElementById('cancel-event-btn');
	let date = new Date();
	let selectedStr = null;
	let events = JSON.parse(localStorage.getItem(KEY)) || {};

	function save() { localStorage.setItem(KEY, JSON.stringify(events)); }

	function render() {
		grid.innerHTML = '';
		const year = date.getFullYear();
		const month = date.getMonth();
		monthYearEl.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
			const el = document.createElement('div');
			el.textContent = d;
			el.className = 'font-bold text-gray-400 text-sm';
			grid.appendChild(el);
		});
		for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
		for (let day = 1; day <= daysInMonth; day++) {
			const el = document.createElement('div');
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
			el.textContent = day;
			el.className = 'day-cell p-1 cursor-pointer rounded-full hover:bg-blue-500/50';
			const today = new Date();
			if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) el.classList.add('today');
			if (events[dateStr] && events[dateStr].length > 0) {
				const ind = document.createElement('div');
				ind.className = 'event-indicator';
				el.appendChild(ind);
			}
			if (dateStr === selectedStr) el.classList.add('selected');
			el.addEventListener('click', () => {
				selectedStr = dateStr;
				render();
				renderEvents();
			});
			grid.appendChild(el);
		}
	}

	function renderEvents() {
		display.innerHTML = '';
		if (!selectedStr) return;
		const evs = events[selectedStr] || [];
		const title = document.createElement('h4');
		title.className = 'font-bold text-md mb-2';
		title.textContent = `Events for ${new Date(selectedStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
		display.appendChild(title);
		if (evs.length > 0) {
			const ul = document.createElement('ul');
			ul.className = 'space-y-1';
			evs.forEach((ev, i) => {
				const li = document.createElement('li');
				li.className = 'text-sm flex justify-between items-center';
				li.textContent = ev;
				const delBtn = document.createElement('button');
				delBtn.textContent = '✕';
				delBtn.className = 'text-red-400 hover:text-red-300';
				delBtn.onclick = () => {
					events[selectedStr].splice(i, 1);
					save();
					render();
					renderEvents();
				};
				li.appendChild(delBtn);
				ul.appendChild(li);
			});
			display.appendChild(ul);
		} else {
			const p = document.createElement('p');
			p.className = 'text-sm text-gray-400';
			p.textContent = 'No events.';
			display.appendChild(p);
		}
		const addBtn = document.createElement('button');
		addBtn.textContent = '+ Add Event';
		addBtn.className = 'mt-2 w-full text-center bg-white/10 hover:bg-white/20 p-2 rounded-md text-sm';
		addBtn.onclick = () => {
			modal.style.display = 'flex';
			input.focus();
		};
		display.appendChild(addBtn);
	}

	saveBtn.addEventListener('click', () => {
		const txt = input.value.trim();
		if (txt && selectedStr) {
			if (!events[selectedStr]) events[selectedStr] = [];
			events[selectedStr].push(txt);
			save();
			input.value = '';
			modal.style.display = 'none';
			render();
			renderEvents();
		}
	});
	input.addEventListener('keypress', e => { if (e.key === 'Enter') saveBtn.click(); });
	cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });
	prevBtn.addEventListener('click', () => {
		date.setMonth(date.getMonth() - 1);
		render();
	});
	nextBtn.addEventListener('click', () => {
		date.setMonth(date.getMonth() + 1);
		render();
	});
	render();
}

function initTodoListWidget() {
	const icon = `<svg class="text-yellow-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`;
	const { widget, content } = createWidget('todo-widget', icon, 'Todo List', ['w-80']);

	content.innerHTML = `
		<div class="flex mb-3">
			<input type="text" id="todo-input" class="flex-grow bg-black/20 text-white placeholder-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Add a new task...">
			<button id="add-todo-btn" class="bg-yellow-500 text-white font-bold px-4 rounded-r-md hover:bg-yellow-600">+</button>
		</div>
		<ul id="todo-list" class="space-y-2 max-h-60 overflow-y-auto"></ul>`;
	
	document.getElementById('dashboard-container').appendChild(widget);

	const KEY = 'dashboardTodoItems';
	const input = content.querySelector('#todo-input');
	const addBtn = content.querySelector('#add-todo-btn');
	const list = content.querySelector('#todo-list');

	function save() {
		const items = [];
		list.querySelectorAll('.todo-item').forEach(el => items.push({ text: el.querySelector('span').textContent, completed: el.classList.contains('completed') }));
		localStorage.setItem(KEY, JSON.stringify(items));
	}

	function createEl({ text, completed }) {
		const li = document.createElement('li');
		li.className = 'todo-item flex justify-between items-center p-2 rounded-md hover:bg-white/10';
		li.setAttribute('draggable', 'true');
		if (completed) li.classList.add('completed');
		const span = document.createElement('span');
		span.textContent = text;
		li.appendChild(span);
		const delBtn = document.createElement('button');
		delBtn.textContent = '✕';
		delBtn.className = 'delete-btn text-red-400 font-bold';
		li.appendChild(delBtn);
		li.addEventListener('click', e => {
			if (e.target !== delBtn) {
				li.classList.toggle('completed');
				save();
			}
		});
		delBtn.addEventListener('click', () => {
			li.remove();
			save();
		});
		li.addEventListener('dragstart', () => li.classList.add('dragging'));
		li.addEventListener('dragend', () => {
			li.classList.remove('dragging');
			save();
		});
		list.appendChild(li);
	}

	function load() {
		const items = JSON.parse(localStorage.getItem(KEY)) || [];
		list.innerHTML = '';
		items.forEach(createEl);
	}

	function add() {
		const text = input.value.trim();
		if (text) {
			createEl({ text, completed: false });
			save();
			input.value = '';
		}
	}

	list.addEventListener('dragover', e => {
		e.preventDefault();
		const afterEl = [...list.querySelectorAll('.todo-item:not(.dragging)')].reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = e.clientY - box.top - box.height / 2;
			return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
		}, { offset: Number.NEGATIVE_INFINITY }).element;
		const draggingEl = document.querySelector('.todo-item.dragging');
		if (draggingEl) {
			if (afterEl == null) list.appendChild(draggingEl);
			else list.insertBefore(draggingEl, afterEl);
		}
	});

	addBtn.addEventListener('click', add);
	input.addEventListener('keypress', e => { if (e.key === 'Enter') add(); });
	load();
}

function initNotesWidget() {
	const icon = `<svg class="text-yellow-200" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>`;
	const { widget, content } = createWidget('notes-widget', icon, 'Sticky Notes', ['w-96']);
	
	content.innerHTML = `<div id="notes-container"><button id="add-note-btn">+</button></div>`;
	document.getElementById('dashboard-container').appendChild(widget);

	const NOTES_KEY = 'dashboardStickyNotes';
	const container = content.querySelector('#notes-container');
	const addBtn = content.querySelector('#add-note-btn');
	let notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || [];

	function saveNotes() {
		localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
	}

	function createNoteElement(note) {
		const noteEl = document.createElement('div');
		noteEl.className = 'sticky-note';
		noteEl.style.left = note.left;
		noteEl.style.top = note.top;
		noteEl.setAttribute('contenteditable', 'true');
		noteEl.textContent = note.content;
		noteEl.dataset.id = note.id;

		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'delete-note-btn';
		deleteBtn.innerHTML = '&times;';
		noteEl.appendChild(deleteBtn);

		deleteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			notes = notes.filter(n => n.id != note.id);
			saveNotes();
			noteEl.remove();
		});

		noteEl.addEventListener('input', () => {
			const targetNote = notes.find(n => n.id == note.id);
			if(targetNote) {
			   targetNote.content = noteEl.textContent;
			   saveNotes();
			}
		});

		let activeNote = null, offsetX = 0, offsetY = 0;
		noteEl.addEventListener('mousedown', (e) => {
			e.stopPropagation();
			activeNote = noteEl;
			offsetX = e.clientX - activeNote.offsetLeft;
			offsetY = e.clientY - activeNote.offsetTop;
			document.addEventListener('mousemove', onNoteMove);
			document.addEventListener('mouseup', onNoteUp);
		});
		
		function onNoteMove(e) {
			if (!activeNote) return;
			activeNote.style.left = `${e.clientX - offsetX}px`;
			activeNote.style.top = `${e.clientY - offsetY}px`;
		}

		function onNoteUp() {
			if (!activeNote) return;
			const targetNote = notes.find(n => n.id == note.id);
			if(targetNote){
				targetNote.left = activeNote.style.left;
				targetNote.top = activeNote.style.top;
				saveNotes();
			}
			activeNote = null;
			document.removeEventListener('mousemove', onNoteMove);
			document.removeEventListener('mouseup', onNoteUp);
		}
		
		container.appendChild(noteEl);
	}

	addBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		const newNote = { id: Date.now(), content: 'New note...', left: '20px', top: '20px' };
		notes.push(newNote);
		saveNotes();
		createNoteElement(newNote);
	});

	notes.forEach(createNoteElement);
}

// port from BASIC 
async function initStarfieldSimulation() {
	// define an SVG icon
	const icon = `<svg class="text-indigo-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path></svg>`;

	// widget - add the unique widget id and title
	// I've given the widget a height (h-80) so the canvas has space to display.
	const {
		widget,
		content
	} = createWidget('starfield-widget', icon, 'Starfield Simulation', ['w-80', 'h-80']);

	// Define the content with a canvas for the starfield.
	// The inline style ensures it fills the container.
	content.innerHTML = `<canvas id="starfield-canvas" style="background-color: #000; width: 100%; height: 100%; display: block; border-radius: 0.5rem;"></canvas>`;

	// Get the canvas element from the content we just set
	const canvas = content.querySelector('#starfield-canvas');
	if (!canvas) {
		console.error("Canvas element not found!");
		return;
	}

	const ctx = canvas.getContext('2d');

	setTimeout(() => {
		// Set canvas resolution to its displayed size
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		const numStars = 800;
		const stars = [];
		const speed = 0.9; // Controls how fast the stars move towards the viewer

		for (let i = 0; i < numStars; i++) {
			stars[i] = {
				x: (Math.random() - 0.5) * canvas.width, // Random x from -width/2 to +width/2
				y: (Math.random() - 0.5) * canvas.height, // Random y from -height/2 to +height/2
				z: Math.random() * canvas.width, // Random depth
			};
		}

		function animate() {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);
			
			for (let i = 0; i < numStars; i++) {
				const star = stars[i];

				star.z -= speed;

				if (star.z <= 0) {
					star.x = (Math.random() - 0.5) * canvas.width;
					star.y = (Math.random() - 0.5) * canvas.height;
					star.z = canvas.width;
				}

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

			requestAnimationFrame(animate);
		}

		animate();
		
		const handleResize = () => {
			// A small delay to ensure the container has finished resizing and to debounce events
			setTimeout(() => {
				if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
					canvas.width = canvas.offsetWidth;
					canvas.height = canvas.offsetHeight;
					
					// Reset star depths based on the new width to maintain perspective
					for (let i = 0; i < numStars; i++) {
						stars[i].z = Math.random() * canvas.width;
					}
				}
			}, 100);
		};
		
		// Use ResizeObserver to watch the widget element for size changes
		if ('ResizeObserver' in window) {
			const observer = new ResizeObserver(handleResize);
			observer.observe(widget); // Observe the widget itself
		} else {
			// Fallback for older browsers that don't support ResizeObserver
			window.addEventListener('resize', handleResize);
		}


	}, 0);

	//	do not forget to add this new child to our dashboard-container
	document.getElementById('dashboard-container').appendChild(widget);
}

// comment out initBasicWidget(); in main() function to use this
async function initBasicWidget() {
	// define an SVG icon
	const icon = `<svg class="text-indigo-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path></svg>`;

	// widget - add the unique widget id and title
	const { widget, content } = createWidget('about-widget', icon, 'Basic Widget', ['w-80']);

	// define the content
	content.innerHTML = ``;

	//	do not forget to add this new child to our dashboard-container
	document.getElementById('dashboard-container').appendChild(widget);
}

async function initDefaultWidgets() {
	initClockWidget();
	initCalendarWidget();
	initTodoListWidget();
	initNotesWidget();
	initWeatherWidget();
	
	initStarfieldSimulation();
}
