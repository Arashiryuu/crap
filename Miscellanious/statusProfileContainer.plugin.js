//META{"name":"statusProfileContainer"}*//

class statusProfileContainer {
	constructor() {
		this.initialized = false;
		this.o = 1;
		this.id = '';
		this.e = '';
		this.statuses = {
			'online': 'rgb(67, 181, 129)',
			'idle': 'rgb(250, 166, 26)',
			'dnd': 'rgb(240, 71, 71)',
			'offline': 'rgb(116, 127, 141)',
			'invisible': 'rgb(116, 127, 141)',
			'streaming': 'rgb(89, 54, 149)'
		};
	}

	start() {
		this.log('Starting');
		let libraryScript = document.getElementById('zeresLibraryScript');
		if(!libraryScript) {
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		}

		if(typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.addEventListener('load', () => this.initialize());
	}

	initialize() {
		this.id = PluginUtilities.getCurrentUser().id;
		this.e = `.avatar-small[style*="${this.id}"] .status`;
		const status = $(this.e).attr('class');
		this.o = 1;
		
		this.initialized = true;
		
		this.colorize();
		this.run(status);
	}

	run(o) {
		if(this.o) {
			const status = $(this.e).attr('class');
	
			if(status === o) {
				return setTimeout(() => this.run(o), 250);
			}
	
			this.colorize();
			return this.run(status);
		}

		return;
	}

	colorize() {
		const color = this.statuses[$(this.e).attr('class').split('-')[1]];
		$('.container-iksrDt').css('background', color);
	}

	revert() {
		$('.container-iksrDt').attr('style', '');
	}

	stop() {
		this.o = 0;
		this.revert();
		this.log('Stopped');
	}

	load() {
		this.log('Loaded');
	}

	log(...t) {
		return console.log(`%c[${this.getName()}]%c`, 'color: hsl(12, 100%, 50%);', '', ...t);
	}

	getName() {
		return 'statusProfileContainer';
	}
	
	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.0';
	}

	getDescription() {
		return 'Changes the profile area container to be the same colour as your status!';
	}
};
