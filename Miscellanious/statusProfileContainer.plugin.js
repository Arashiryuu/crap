//META{"name":"statusProfileContainer"}*//

class statusProfileContainer {
	constructor() {
		this.o = 1;
		this.id = '238108500109033472';
		this.e = `.avatar-small[style*="${this.id}"] .status`;
		this.statuses = {
			'online': 'rgb(67, 181, 129)',
			'idle': 'rgb(250, 166, 26)',
			'dnd': 'rgb(240, 71, 71)',
			'invisible': 'rgb(116, 127, 141)',
			'streaming': 'rgb(89, 54, 149)'
		};
	}
	start() {
		this.log('Starting');
		this.o = 1;
		const status = $(this.e).attr('class');
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
		$('.container-iksrDt').css('background', 'rgba(32,34,37,.3)');
	}
	stop() {
		this.o = 0;
		this.revert();
		this.log('Stopped');
	}
	load() {
		this.log('Loaded');
	}
	log(text) {
		if(typeof text !== 'string') return;
		return console.log(`%c[${this.getName()}]%c ${text}`, 'color: hsl(12, 100%, 50%);', '');
	}
	getName() {
		return 'statusProfileContainer';
	}
	getAuthor() {
		return 'Arashiryuu';
	}
	getVersion() {
		return '1';
	}
	getDescription() {
		return 'Changes the profile area container to be the same colour as your status!';
	}
};
