async function initPetGame() {
	// 1. DEFINE WIDGET METADATA
	const icon = `<svg class="text-indigo-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8 8 8 0 0 0-8 8 8 8 0 0 0 8 8Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
	const {
		widget,
		content
	} = createWidget('tamagotchi-widget', icon, 'Digital Pal', ['w-80', 'h-96']);

	// 2. DEFINE THE GAME'S HTML & CSS STRUCTURE
	content.innerHTML = `
		<style>
			/* Animations for the pet */
			#pet-svg { transition: transform 0.2s ease-in-out; }
			.pet-idle { animation: bob 2s ease-in-out infinite; }
			@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
			.pet-happy { animation: happy-jiggle 0.5s ease; }
			@keyframes happy-jiggle { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.05) rotate(5deg); } 75% { transform: scale(0.95) rotate(-5deg); } }
			.pet-dirty-overlay { opacity: 0.6; }
			.interactive-item { cursor: pointer; transition: transform 0.2s ease; }
			.interactive-item:hover { transform: scale(1.1); }
		</style>
		<div id="game-container" class="flex flex-col h-full p-4 bg-gray-800 text-white rounded-lg select-none">
			<!-- Screen Area -->
			<div class="flex-grow bg-gray-900 rounded-md border-4 border-gray-700 flex flex-col items-center p-2 min-h-0">
				<div id="pet-age" class="text-sm text-gray-400 self-start">Age: 0 days</div>
				
				<!-- Pet and interactive items container -->
				<div class="relative w-full flex-grow flex items-center justify-center my-2">
					<div id="pet-visual" class="relative cursor-pointer">
						<svg id="pet-svg" class="pet-idle" width="120" height="120" viewBox="0 0 120 120">
							<defs>
								<filter id="dirty-texture" x="0" y="0" width="100%" height="100%">
									<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise"/>
									<feDiffuseLighting in="noise" lighting-color="#8B4513" surfaceScale="2">
										<feDistantLight azimuth="45" elevation="60"/>
									</feDiffuseLighting>
								</filter>
							</defs>
							<!-- Body -->
							<circle cx="60" cy="60" r="50" fill="#81e6d9"/>
							 <!-- Blush -->
							<circle cx="35" cy="65" r="10" fill="#fbb6ce" opacity="0.7"/>
							<circle cx="85" cy="65" r="10" fill="#fbb6ce" opacity="0.7"/>
							<!-- Eyes -->
							<g id="pet-eyes-happy">
								<circle cx="45" cy="50" r="8" fill="white"/>
								<circle cx="75" cy="50" r="8" fill="white"/>
								<circle cx="47" cy="52" r="4" fill="black"/>
								<circle cx="77" cy="52" r="4" fill="black"/>
							</g>
							 <!-- Mouth -->
							<path id="pet-mouth-happy" d="M 45 75 Q 60 90 75 75" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
							
							<!-- Sad Face (hidden by default) -->
							<g id="pet-face-sad" style="display: none;">
								<path d="M 40 55 Q 45 50 50 55" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
								<path d="M 70 55 Q 75 50 80 55" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
								<path d="M 45 80 Q 60 70 75 80" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
							</g>

							<rect id="dirty-overlay" width="120" height="120" filter="url(#dirty-texture)" class="pet-dirty-overlay" style="display: none;"/>
						</svg>
					</div>
					<div id="food-item" class="interactive-item absolute bottom-2 left-2 text-4xl">🍖</div>
					<div id="toy-item" class="interactive-item absolute bottom-2 right-2 text-4xl">🎾</div>
					<div id="shower-item" class="interactive-item absolute top-2 right-2 text-4xl">🚿</div>
				</div>

				<div id="pet-message" class="text-center text-xs h-8 flex-shrink-0">I'm happy!</div>
				
				<!-- Stats Bars -->
				<div class="w-full px-4 flex-shrink-0">
					<div class="mb-1">
						<span class="text-xs">HUNGER</span>
						<div class="w-full bg-gray-700 rounded-full h-3"><div id="hunger-bar" class="bg-green-500 h-3 rounded-full transition-all duration-500" style="width: 100%"></div></div>
					</div>
					<div class="mb-1">
						<span class="text-xs">HAPPINESS</span>
						<div class="w-full bg-gray-700 rounded-full h-3"><div id="happiness-bar" class="bg-blue-500 h-3 rounded-full transition-all duration-500" style="width: 100%"></div></div>
					</div>
					<div>
						<span class="text-xs">CLEANLINESS</span>
						<div class="w-full bg-gray-700 rounded-full h-3"><div id="cleanliness-bar" class="bg-yellow-500 h-3 rounded-full transition-all duration-500" style="width: 100%"></div></div>
					</div>
				</div>
			</div>
			 <div id="reset-container" class="hidden justify-around mt-4">
				<button id="reset-button" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">New Pal</button>
			</div>
		</div>
	`;

	// 3. GAME LOGIC AND STATE MANAGEMENT
	const MAX_STAT = 100;
	const STAT_DECAY_RATE = 3; // points per minute
	const CLEAN_DECAY_RATE = 1; // points per minute
	const AGE_RATE = 1000 * 60 * 5; // 1 day older every 5 minutes
	const SAVE_INTERVAL = 5000;

	let pet = {};

	// Get references to UI elements
	const petVisual = content.querySelector('#pet-visual');
	const petSvg = content.querySelector('#pet-svg');
	const dirtyOverlay = content.querySelector('#dirty-overlay');
	const petAge = content.querySelector('#pet-age');
	const petMessage = content.querySelector('#pet-message');
	const hungerBar = content.querySelector('#hunger-bar');
	const happinessBar = content.querySelector('#happiness-bar');
	const cleanlinessBar = content.querySelector('#cleanliness-bar');
	const resetContainer = content.querySelector('#reset-container');
	const allItems = content.querySelectorAll('.interactive-item');

	function initializeNewPet() {
		pet = {
			hunger: MAX_STAT,
			happiness: MAX_STAT,
			cleanliness: MAX_STAT,
			birthTime: Date.now(),
			lastUpdate: Date.now(),
			isAlive: true,
		};
	}

	function saveState() {
		if (pet) {
			localStorage.setItem('tamagotchiState', JSON.stringify(pet));
		}
	}

	function loadState() {
		const savedState = localStorage.getItem('tamagotchiState');
		if (savedState) {
			pet = JSON.parse(savedState);
			// Ensure cleanliness exists for older save files
			if (pet.cleanliness === undefined) {
				pet.cleanliness = MAX_STAT;
			}
			const timePassed = Date.now() - pet.lastUpdate;
			const minutesPassed = timePassed / (1000 * 60);
			const decayAmount = Math.floor(minutesPassed * STAT_DECAY_RATE);
			const cleanDecayAmount = Math.floor(minutesPassed * CLEAN_DECAY_RATE);

			pet.hunger = Math.max(0, pet.hunger - decayAmount);
			pet.happiness = Math.max(0, pet.happiness - decayAmount);
			pet.cleanliness = Math.max(0, pet.cleanliness - cleanDecayAmount);

			if (pet.hunger === 0 || pet.happiness === 0) {
				pet.isAlive = false;
			}
			pet.lastUpdate = Date.now();
		} else {
			initializeNewPet();
		}
	}

	function updateUI() {
		if (!pet.isAlive) {
			petSvg.style.display = 'none';
			petVisual.innerHTML += '<div class="text-6xl">💀</div>';
			petMessage.textContent = "I've gone to the digital beyond...";
			allItems.forEach(item => item.classList.add('hidden'));
			resetContainer.classList.remove('hidden');
			hungerBar.style.width = '0%';
			happinessBar.style.width = '0%';
			cleanlinessBar.style.width = '0%';
			return;
		}

		// Update stats bars
		hungerBar.style.width = `${pet.hunger}%`;
		happinessBar.style.width = `${pet.happiness}%`;
		cleanlinessBar.style.width = `${pet.cleanliness}%`;

		// Update age
		const ageInMs = Date.now() - pet.birthTime;
		const ageInDays = Math.floor(ageInMs / AGE_RATE);
		petAge.textContent = `Age: ${ageInDays} days`;

		// Update visual state
		dirtyOverlay.style.display = pet.cleanliness < 40 ? 'block' : 'none';

		// Update message based on state priority
		if (pet.hunger < 30) {
			petMessage.textContent = 'My tummy is rumbling...';
		} else if (pet.cleanliness < 40) {
			petMessage.textContent = 'I feel a bit grimy...';
		} else if (pet.happiness < 30) {
			petMessage.textContent = 'I feel so lonely...';
		} else if (pet.happiness > 80 && pet.hunger > 80) {
			petMessage.textContent = 'I love you!';
		} else {
			petMessage.textContent = "Everything's pretty good!";
		}
	}

	function triggerAnimation(animationClass) {
		petSvg.classList.remove('pet-idle');
		petSvg.classList.add(animationClass);
		setTimeout(() => {
			petSvg.classList.remove(animationClass);
			petSvg.classList.add('pet-idle');
		}, 500); // Animation duration
	}

	function feedPet() {
		if (!pet.isAlive) return;
		pet.hunger = Math.min(MAX_STAT, pet.hunger + 20);
		pet.cleanliness = Math.max(0, pet.cleanliness - 5); // Eating is messy
		petMessage.textContent = 'Yum! That was delicious!';
		triggerAnimation('pet-happy');
		updateUI();
	}

	function playWithPet() {
		if (!pet.isAlive) return;
		pet.happiness = Math.min(MAX_STAT, pet.happiness + 20);
		pet.hunger = Math.max(0, pet.hunger - 5); // Playing uses energy
		petMessage.textContent = 'Weee! That was fun!';
		triggerAnimation('pet-happy');
		updateUI();
	}

	function patPet() {
		if (!pet.isAlive) return;
		pet.happiness = Math.min(MAX_STAT, pet.happiness + 5);
		petMessage.textContent = 'Hehe, that tickles!';
		triggerAnimation('pet-happy');
		updateUI();
	}

	function cleanPet() {
		if (!pet.isAlive) return;
		pet.cleanliness = MAX_STAT;
		petMessage.textContent = 'So fresh and so clean!';
		triggerAnimation('pet-happy');
		updateUI();
	}

	function resetGame() {
		localStorage.removeItem('tamagotchiState');
		window.location.reload(); // Easiest way to reset the widget state
	}

	function gameLoop() {
		if (!pet.isAlive) {
			saveState();
			return;
		}

		const timeSinceLastUpdate = Date.now() - pet.lastUpdate;
		const minutesPassed = timeSinceLastUpdate / (1000 * 60);

		pet.hunger = Math.max(0, pet.hunger - (minutesPassed * STAT_DECAY_RATE));
		pet.happiness = Math.max(0, pet.happiness - (minutesPassed * STAT_DECAY_RATE));
		pet.cleanliness = Math.max(0, pet.cleanliness - (minutesPassed * CLEAN_DECAY_RATE));

		// Happiness decays faster if other stats are low
		if (pet.hunger < 50) pet.happiness = Math.max(0, pet.happiness - (minutesPassed * 0.5));
		if (pet.cleanliness < 50) pet.happiness = Math.max(0, pet.happiness - (minutesPassed * 0.5));


		if (pet.hunger === 0 || pet.happiness === 0) {
			pet.isAlive = false;
		}

		pet.lastUpdate = Date.now();
		updateUI();
	}

	// 4. INITIALIZE AND START THE GAME
	loadState();

	// Attach event listeners
	petVisual.addEventListener('click', patPet);
	content.querySelector('#food-item').addEventListener('click', feedPet);
	content.querySelector('#toy-item').addEventListener('click', playWithPet);
	content.querySelector('#shower-item').addEventListener('click', cleanPet);
	content.querySelector('#reset-button').addEventListener('click', resetGame);

	// Start game loops
	setInterval(gameLoop, 1000);
	setInterval(saveState, SAVE_INTERVAL);

	//	do not forget to add this new child to our dashboard-container
	document.getElementById('dashboard-container').appendChild(widget);
}