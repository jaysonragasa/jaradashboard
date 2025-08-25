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
