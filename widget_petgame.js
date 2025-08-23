async function initPetGame() {
	// define an SVG icon
	const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 128 128"><path d="M32 80c0 16 14 28 32 28s32-12 32-28c0-4-2-8-4-12l-12 8-8-10-8 10-8-10-12 10-8-6c-2 4-4 8-4 10z" fill="#fffaf0" stroke="#d8c1a3" stroke-width="3"/><circle cx="64" cy="64" r="18" fill="#ffeb3b" stroke="#d4b830" stroke-width="2"/><circle cx="58" cy="60" r="2.5" fill="#000"/><circle cx="70" cy="60" r="2.5" fill="#000"/><path d="M64 64l4 4-4 2-4-2z" fill="#f57c00"/><path d="M40 48l8 6 6-6 6 8 6-8 6 6 8-6" fill="none" stroke="#d8c1a3" stroke-width="3"/></svg>`;

	// widget - add the unique widget id and title
	const { widget, content } = createWidget('tamagotchi-widget', icon, 'My Cuddly Pet', ['w-full', 'max-w-sm', 'mx-auto']);

	// --- 1. Add Tamagotchi Styles to the document's head ---
	const styles = `
        body {
            font-family: 'Inter', sans-serif;
            touch-action: manipulation;
        }
        .font-kalam {
            font-family: 'Kalam', cursive;
        }
        .progress-bar-fill {
            transition: width 0.5s ease-in-out;
        }
        #tamagotchi-container canvas {
            cursor: pointer;
        }
    `;
    // Create a style element and append it to the head to make sure styles are applied
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    // Also add the Google Fonts link
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Kalam:wght@700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);


	// --- 2. Define the Tamagotchi HTML content ---
	content.innerHTML = `
        <div id="tamagotchi-container" class="w-full bg-white rounded-3xl shadow-2xl p-6 border-4 border-gray-200">
            <!-- Screen Area -->
            <div class="bg-gray-200 rounded-xl p-4 mb-6 relative aspect-square">
                <canvas id="petCanvas" class="w-full h-full bg-sky-100 rounded-lg"></canvas>
                <div id="messageBox" class="absolute top-4 left-0 right-0 text-center text-gray-700 text-3xl font-bold font-kalam hidden drop-shadow-lg">
                    <p id="messageText"></p>
                </div>
            </div>

            <!-- Stats and Age -->
            <div class="mb-6 space-y-3">
                <div class="flex justify-between items-center text-gray-600">
                    <h2 class="text-lg font-bold">Pet Stats</h2>
                    <div class="text-right">
                        <p class="font-semibold">Age: <span id="ageDisplay">0</span> days</p>
                    </div>
                </div>
                <!-- Hunger Stat -->
                <div>
                    <label class="font-semibold text-sm text-gray-500">Hunger</label>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div id="hungerBar" class="bg-green-500 h-4 rounded-full progress-bar-fill"></div>
                    </div>
                </div>
                <!-- Happiness Stat -->
                <div>
                    <label class="font-semibold text-sm text-gray-500">Happiness</label>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div id="happinessBar" class="bg-yellow-400 h-4 rounded-full progress-bar-fill"></div>
                    </div>
                </div>
                <!-- Cleanliness Stat -->
                <div>
                    <label class="font-semibold text-sm text-gray-500">Cleanliness</label>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div id="cleanlinessBar" class="bg-blue-400 h-4 rounded-full progress-bar-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

	// --- 3. Run the Tamagotchi JavaScript Logic ---
    // We wrap it in a function to avoid polluting the global scope
    (function(widgetContent) {
        // --- DOM Elements (scoped to the widget) ---
        const canvas = widgetContent.querySelector('#petCanvas');
        const ctx = canvas.getContext('2d');
        const hungerBar = widgetContent.querySelector('#hungerBar');
        const happinessBar = widgetContent.querySelector('#happinessBar');
        const cleanlinessBar = widgetContent.querySelector('#cleanlinessBar');
        const ageDisplay = widgetContent.querySelector('#ageDisplay');
        const messageBox = widgetContent.querySelector('#messageBox');
        const messageText = widgetContent.querySelector('#messageText');

        // --- Game State ---
        const initialPetState = {
            hunger: 100, happiness: 100, cleanliness: 100, age: 0,
            baseSize: 20, isDirty: false, isAlive: true, isBeingPetted: false,
            x: 150, y: 200, groundY: 200, vx: 0, vy: 0, gravity: 0.4,
            state: 'idle', stateTimer: 0, breathPhase: 0, walkDirection: 1,
        };
        let pet = { ...initialPetState };

        let dayCounter = 0;
        let gameLogicSpeed = 2000;

        // --- Icon Definitions ---
        const icons = {
            feed: { char: '🍖', x: 0, y: 0, size: 40 },
            play: { char: '🎾', x: 0, y: 0, size: 40 },
            clean: { char: '🚿', x: 0, y: 0, size: 40 }
        };

        // --- Game Reset Function ---
        function resetGame() {
            pet = { ...initialPetState };
            pet.x = canvas.width / 2;
            pet.y = pet.groundY;
            dayCounter = 0;
            localStorage.removeItem('tamagotchiSave');
            updateUI();
            showMessage("Let's play again!", 2000);
        }

        // --- Save/Load Functions ---
        function saveGame() {
            const gameState = { pet, dayCounter, saveTime: Date.now() };
            localStorage.setItem('tamagotchiSave', JSON.stringify(gameState));
        }

        function loadGame() {
            const savedState = JSON.parse(localStorage.getItem('tamagotchiSave'));
            if (savedState) {
                const timePassed = Date.now() - savedState.saveTime;
                const ticksPassed = Math.floor(timePassed / gameLogicSpeed);
                pet = savedState.pet;
                dayCounter = savedState.dayCounter;
                if (pet.isAlive) {
                    pet.hunger = Math.max(0, pet.hunger - ticksPassed);
                    let happinessDecay = ticksPassed;
                    if (pet.hunger < 30) happinessDecay += ticksPassed;
                    if (pet.cleanliness < 40) happinessDecay += ticksPassed;
                    pet.happiness = Math.max(0, pet.happiness - happinessDecay);
                    pet.cleanliness = Math.max(0, pet.cleanliness - ticksPassed);
                    const totalTicks = dayCounter + ticksPassed;
                    pet.age += Math.floor(totalTicks / 20);
                    dayCounter = totalTicks % 20;
                    if (pet.hunger <= 0 || pet.happiness <= 0) {
                        pet.isAlive = false;
                        showMessage("Your pet missed you...", 5000);
                    }
                }
            }
        }

        // --- Canvas Sizing ---
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            pet.groundY = canvas.height * 0.8;
            if (pet.state !== 'jumping') {
                 pet.y = pet.groundY;
            }
            if(pet.x > canvas.width || pet.x < 0){
                pet.x = canvas.width / 2;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        
        // --- Drawing Functions ---
        function drawScene() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPet();
            drawIcons();
        }
        
        function drawPet() {
            const growth = 1 + (pet.age / 20);
            const size = pet.baseSize * growth;
            const fatness = 0.8 + (pet.hunger / 100) * 0.4; 
            const breathEffect = pet.state === 'resting' ? 0 : Math.sin(pet.breathPhase) * 2;
            const centerX = pet.x;
            const centerY = pet.y - size + breathEffect;
            ctx.save();
            ctx.translate(centerX, centerY);
            if (pet.state === 'resting' || !pet.isAlive) {
                ctx.rotate(Math.PI / 2);
            }
            const earSize = size * 0.3;
            const earXOffset = size * 0.6 * fatness;
            const earYOffset = -size * 0.8;
            ctx.fillStyle = '#A569BD';
            ctx.beginPath();
            ctx.arc(-earXOffset, earYOffset, earSize, 0, Math.PI * 2);
            ctx.arc(earXOffset, earYOffset, earSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8E44AD';
            ctx.beginPath();
            ctx.ellipse(0, 0, size * fatness, size, 0, 0, Math.PI * 2);
            ctx.fill();
            const eyeXOffset = size * 0.35 * fatness;
            const eyeYOffset = -size * 0.2;
            if (pet.isBeingPetted || pet.state === 'resting' || !pet.isAlive) {
                ctx.strokeStyle = 'black';
                ctx.lineWidth = size * 0.05;
                ctx.beginPath();
                ctx.arc(-eyeXOffset, eyeYOffset, size * 0.1, Math.PI, 0, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(eyeXOffset, eyeYOffset, size * 0.1, Math.PI, 0, false);
                ctx.stroke();
            } else {
                const eyeRadius = size * 0.15;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-eyeXOffset, eyeYOffset, eyeRadius, 0, Math.PI * 2);
                ctx.arc(eyeXOffset, eyeYOffset, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
                const pupilRadius = eyeRadius * 0.7;
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(-eyeXOffset, eyeYOffset, pupilRadius, 0, Math.PI * 2);
                ctx.arc(eyeXOffset, eyeYOffset, pupilRadius, 0, Math.PI * 2);
                ctx.fill();
                const highlightRadius = pupilRadius * 0.4;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-eyeXOffset + highlightRadius, eyeYOffset - highlightRadius, highlightRadius, 0, Math.PI * 2);
                ctx.arc(eyeXOffset + highlightRadius, eyeYOffset - highlightRadius, highlightRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = 'black';
            ctx.lineWidth = size * 0.05;
            ctx.beginPath();
            if (pet.happiness > 30 && pet.isAlive) {
                ctx.arc(0, size * 0.2, size * 0.25, 0, Math.PI, false);
            } else {
                ctx.arc(0, size * 0.3, size * 0.25, 0, Math.PI, true);
            }
            ctx.stroke();
            pet.isDirty = pet.cleanliness < 40;
            if (pet.isDirty) {
                ctx.fillStyle = '#8B4513';
                ctx.beginPath(); ctx.arc(-size * 0.4, 0, size * 0.1, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(size * 0.3, size * 0.5, size * 0.15, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(0, -size * 0.3, size * 0.12, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }

        function drawIcons() {
            const iconMargin = 15;
            icons.feed.x = iconMargin;
            icons.feed.y = canvas.height - iconMargin;
            icons.play.x = canvas.width - icons.play.size - iconMargin;
            icons.play.y = canvas.height - iconMargin;
            icons.clean.x = canvas.width / 2 - icons.clean.size / 2;
            icons.clean.y = iconMargin + icons.clean.size;
            for (const key in icons) {
                const icon = icons[key];
                ctx.font = `${icon.size}px sans-serif`;
                ctx.textBaseline = 'bottom';
                ctx.fillText(icon.char, icon.x, icon.y);
            }
        }

        // --- UI Update Functions ---
        function updateUI() {
            hungerBar.style.width = `${pet.hunger}%`;
            happinessBar.style.width = `${pet.happiness}%`;
            cleanlinessBar.style.width = `${pet.cleanliness}%`;
            ageDisplay.textContent = pet.age;
            hungerBar.style.backgroundColor = pet.hunger > 30 ? '#22c55e' : '#ef4444';
            happinessBar.style.backgroundColor = pet.happiness > 30 ? '#facc15' : '#ef4444';
            cleanlinessBar.style.backgroundColor = pet.cleanliness > 30 ? '#38bdf8' : '#a16207';
        }

        function showMessage(text, duration = 1500) {
            messageText.textContent = text;
            messageBox.classList.remove('hidden');
            setTimeout(() => { messageBox.classList.add('hidden'); }, duration);
        }

        // --- Game Logic ---
        function updatePetStats() {
            if (!pet.isAlive) return;
            pet.hunger = Math.max(0, pet.hunger - 1);
            pet.happiness = Math.max(0, pet.happiness - 1);
            pet.cleanliness = Math.max(0, pet.cleanliness - 1);
            if (pet.hunger < 30) pet.happiness = Math.max(0, pet.happiness - 1);
            if (pet.cleanliness < 40) pet.happiness = Math.max(0, pet.happiness - 1);
            if (pet.hunger <= 0 || pet.happiness <= 0) {
                pet.isAlive = false;
                showMessage("Your pet has gone on a long trip...", 60000);
            }
            dayCounter++;
            if (dayCounter >= 20) {
                pet.age++;
                dayCounter = 0;
            }
            updateUI();
            saveGame();
        }

        // --- Animation Logic ---
        function updateAnimation() {
            pet.stateTimer -= 1;
            if (pet.happiness < 20 && pet.state !== 'resting' && pet.state !== 'jumping') {
                pet.state = 'resting';
            } else if (pet.state === 'resting' && pet.happiness > 30) {
                pet.state = 'idle';
                pet.stateTimer = 120;
            }
            switch (pet.state) {
                case 'idle':
                    pet.breathPhase += 0.05;
                    pet.vx = 0;
                    if (pet.stateTimer <= 0) {
                        let nextState = Math.random();
                        if (nextState > 0.6) {
                            pet.state = 'walking';
                            pet.stateTimer = 180 + Math.random() * 120;
                            pet.walkDirection = Math.random() > 0.5 ? 1 : -1;
                        } else if (nextState > 0.5) {
                            pet.state = 'jumping';
                            pet.vy = -8;
                        } else {
                            pet.stateTimer = 120 + Math.random() * 120;
                        }
                    }
                    break;
                case 'walking':
                    pet.breathPhase += 0.05;
                    pet.vx = 0.5 * pet.walkDirection;
                    if ((pet.x > canvas.width - 30 && pet.walkDirection === 1) || (pet.x < 30 && pet.walkDirection === -1)) {
                        pet.walkDirection *= -1;
                    }
                    if (pet.stateTimer <= 0) {
                        pet.state = 'idle';
                        pet.stateTimer = 120;
                    }
                    break;
                case 'jumping':
                    pet.vy += pet.gravity;
                    pet.y += pet.vy;
                    if (pet.y >= pet.groundY) {
                        pet.y = pet.groundY;
                        pet.vy = 0;
                        pet.state = 'idle';
                        pet.stateTimer = 60;
                    }
                    break;
                case 'resting': break;
            }
            pet.x += pet.vx;
        }
        
        // --- Main Game Loop ---
        function gameLoop() {
            if (pet.isAlive) {
                updateAnimation();
            }
            drawScene();
            requestAnimationFrame(gameLoop);
        }

        // --- Action Functions ---
        function feedPet() { if (!pet.isAlive) return; pet.hunger = Math.min(100, pet.hunger + 15); pet.happiness = Math.min(100, pet.happiness + 5); showMessage("Yum!"); updateUI(); }
        function playWithPet() { if (!pet.isAlive) return; pet.happiness = Math.min(100, pet.happiness + 20); pet.hunger = Math.max(0, pet.hunger - 5); if (pet.state !== 'jumping') { pet.state = 'jumping'; pet.vy = -8; } showMessage("Wee!"); updateUI(); }
        function cleanPet() { if (!pet.isAlive) return; pet.cleanliness = 100; showMessage("Squeaky clean!"); updateUI(); }
        function petThePet() { if (!pet.isAlive || pet.isBeingPetted) return; pet.isBeingPetted = true; pet.happiness = Math.min(100, pet.happiness + 10); showMessage("❤️"); updateUI(); setTimeout(() => { pet.isBeingPetted = false; }, 1000); }

        // --- Event Handlers ---
        canvas.addEventListener('click', (event) => {
            if (!pet.isAlive) {
                resetGame();
                return;
            }
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            let iconClicked = false;
            for (const key in icons) {
                const icon = icons[key];
                const iconX = icon.x, iconY = icon.y - icon.size, iconWidth = icon.size, iconHeight = icon.size;
                if (x >= iconX && x <= iconX + iconWidth && y >= iconY && y <= iconY + iconHeight) {
                    iconClicked = true;
                    switch (key) {
                        case 'feed': feedPet(); break;
                        case 'play': playWithPet(); break;
                        case 'clean': cleanPet(); break;
                    }
                    return;
                }
            }
            if (!iconClicked) {
                const growth = 1 + (pet.age / 20);
                const size = pet.baseSize * growth;
                const fatness = 0.8 + (pet.hunger / 100) * 0.4; 
                const centerX = pet.x, centerY = pet.y - size, radiusX = size * fatness, radiusY = size;
                const dx = x - centerX, dy = y - centerY;
                if ((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1) {
                    petThePet();
                }
            }
        });

        // --- Game Initialization ---
        function init() {
            loadGame();
            resizeCanvas();
            updateUI();
            setInterval(updatePetStats, gameLogicSpeed);
            requestAnimationFrame(gameLoop);
        }

        window.addEventListener('beforeunload', saveGame);
        
        // Start the game after a short delay to ensure the widget is in the DOM
        setTimeout(init, 0);

    })(content); // Pass the widget's content element to the script

	//	do not forget to add this new child to our dashboard-container
	document.getElementById('dashboard-container').appendChild(widget);
}
