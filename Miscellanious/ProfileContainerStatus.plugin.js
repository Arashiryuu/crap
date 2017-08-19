//META{"name":"statusProfileContainer"}*//

class statusProfileContainer {
	constructor() {
		this.color = null;
		this.statuses = null;
		this.interval = null;
		this.id = null;
	}
	start() {
		this.log('Starting');
		this.interval = setInterval(function() {
			this.id = '238108500109033472'; // my user ID
			this.color = $(`.avatar-small[style*="${this.id}"] .status`).css('border-color');
			this.statuses = ['online', 'dnd', 'idle', 'invisible', 'streaming'];
			const self = this;
			self.color = this.color;
			self.id = this.id;
			this.statuses.some(
				(stat) => $(`.avatar-small[style*="${self.id}"] .status`).attr('class').includes(stat)) ? (
				$('.container-iksrDt').css({'background':self.color}) 
				) : ( 
				''
				);
		}, 1000);
	}
	stop() {
		clearInterval(this.interval);
		this.log('Stopped');
		this.color = null;
		this.statuses = null;
		this.interval = null;
		this.id = null;
	}
	load() {
		this.log('Loaded');
	}
	log(text) {
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
	getSettingsPanel() {
		return;
	}
}
