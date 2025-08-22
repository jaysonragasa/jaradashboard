![alt text](https://github.com/jaysonragasa/jaradashboard/blob/main/Animation%2008222025112652.gif?raw=true)

# Dynamic Dashboard with Draggable Widgets

A sleek, modern, and customizable dashboard built with vanilla JavaScript. This project features draggable and resizable widgets with persistent state, a "glassmorphism" UI, and a modular design that makes it easy to add new functionality.

---

## Features

- **Draggable & Persistent Layout**: Drag and drop widgets to arrange your perfect layout. All positions are saved to your browser's local storage.
- **Collapsible Widgets**: Click any widget's header to minimize it to an icon, saving screen space.
- **Mobile-First Default**: On first load or after a reset, widgets stack neatly on the left, providing a great experience on any device.
- **Long-Press Menu**: A context menu on the background allows you to reset the layout or collapse all widgets, ensuring you never lose control of the UI.
- **Live Data & Animations**: The weather widget fetches live data and displays beautiful, full-background animations that correspond to the current conditions.

### Included Widgets:
- **Weather**: Live temperature, conditions, and hourly forecast with animated backgrounds.
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

## How to Add a New Widget

Adding new widgets to this dashboard is designed to be straightforward. By following this modular pattern, you can keep the code clean and easily extend the dashboard's functionality.

Here’s a step-by-step guide using a "Quote of the Day" widget as an example.

---

### Step 1: Create an `init` Function for Your Widget

First, create a new `async` function for your widget inside your main `<script>` tag or in a separate `.js` file. This keeps all the logic for your new widget self-contained.

```javascript
async function initQuoteWidget() {
    // All your widget's setup will go here
}
```

---

### Step 2: Design the Widget's Shell

Inside your new function, call the `createWidget()` helper. You'll need to provide four pieces of information:
1.  A unique **ID** (e.g., `'quote-widget'`).
2.  An **SVG icon** as a string.
3.  A **title** for the header.
4.  An array with a **width class** (e.g., `['w-80']`).

```javascript
async function initQuoteWidget() {
    const icon = `<svg class="text-indigo-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path></svg>`;
    const { widget, content } = createWidget('quote-widget', icon, 'Quote of the Day', ['w-80']);
    // ... more code to come
}
```

---

### Step 3: Define the Widget's Content

Set the `innerHTML` for the `content` element that `createWidget()` returned. This is where you'll define the HTML structure for the inside of your widget.

```javascript
// (inside initQuoteWidget)
content.innerHTML = `
    <blockquote id="quote-text" class="text-lg italic">Loading...</blockquote>
    <cite id="quote-author" class="block text-right mt-2 not-italic">— ...</cite>
`;
```

---

### Step 4: Add the Widget to the Page

Append your newly created `widget` to the main dashboard container so it becomes visible.

```javascript
// (inside initQuoteWidget)
document.getElementById('dashboard-container').appendChild(widget);
```

---

### Step 5: Implement Your Widget's Logic

Now, add the JavaScript that makes your widget functional. This could involve fetching data from an API, adding event listeners, or performing calculations.

```javascript
// (inside initQuoteWidget)
const quoteText = content.querySelector('#quote-text');
const quoteAuthor = content.querySelector('#quote-author');

try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
       method: 'GET',
	   headers: {
	      'X-Api-Key': '<YOUR_API_KEY_HERE>',
	      'Content-Type': 'application/json'
	   }
    });
    const data = await response.json();
    const quote = data[0];
    quoteText.textContent = `“${quote.quote}”`;
    quoteAuthor.textContent = `— ${quote.author}`;
} catch (error) {
    quoteText.textContent = "Could not load quote.";
}
```

---

### Step 6: Call Your New Function

Finally, find the `main()` function at the end of the script and add a call to your new `init` function. Make sure to add it **before** the line that applies the core functionality (`.forEach(applyCoreWidgetFunctionality)`).

```javascript
async function main() {
    // Create all widgets first
    await initWeatherWidget();
    initClockWidget();
    initCalendarWidget();
    initTodoListWidget();
    initNotesWidget();
    await initQuoteWidget(); // <-- Add your new widget's init function here

    // Then apply core functionality to all of them
    document.querySelectorAll('.widget').forEach(applyCoreWidgetFunctionality);
    
    // ... rest of the main function
}
```

---

### Full Version of Quote of The Day Widget

```javascript
// quote WIDGET
async function initQuoteWidget() {
	const icon = `<svg class="text-indigo-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8z"></path></svg>`;
	const { widget, content } = createWidget('quote-widget', icon, 'Quote of the Day', ['w-80']);
	
	content.innerHTML = `
		<blockquote id="quote-text" class="text-lg italic">Loading...</blockquote>
		<cite id="quote-author" class="block text-right mt-2 not-italic"></cite>
	`;
	
	document.getElementById('dashboard-container').appendChild(widget);
	
	const quoteText = content.querySelector('#quote-text');
	const quoteAuthor = content.querySelector('#quote-author');

	try {
		const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
		  method: 'GET',
		  headers: {
			'X-Api-Key': '<YOUR_API_KEY_GOES_HERE>',
			'Content-Type': 'application/json'
		  }
		});
		const data = await response.json();
		const quote = data[0];
		quoteText.textContent = `“${quote.quote}”`;
		quoteAuthor.textContent = `— ${quote.author}`;
	} catch (error) {
		quoteText.textContent = "Could not load quote.";
	}
}
```
