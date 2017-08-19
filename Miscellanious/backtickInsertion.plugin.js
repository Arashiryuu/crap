//META{"name":"backtickInsertion"}*//

class backtickInsertion {
	constructor() {
		// construct global variables
	}
	start() {
		this.log('Started');
		this.init();
	}
	stop() {
		this.log('Stopped');
		$('.channel-text-area-default div textarea').off('keyup.backIn');
	}
	load() {
		this.log('Loaded');
	}
	log(text) {
		return console.log(`%c[${this.getName()}]%c ${text}`, 'color: hsla(192, 100%, 50%, 0.8)', '');
	}
	onSwitch() {
		this.init();
	}
	init() {
		const textArea = $('.channel-text-area-default div textarea');
		if(!textArea.length) return;
		textArea.off('keyup.backIn').on('keyup.backIn', (e) => {
			if(textArea.val().includes('\'\'\'')) {
				textArea.val(textArea.text().replace(/\'\'\'/g, '```'));
			}
		});
	}
	getName() {
		return 'backtickInsertion';
	}
	getAuthor() {
		return 'Arashiryuu';
	}
	getVersion() {
		return '1';
	}
	getDescription() {
		return 'Replace any consecutive triple apostrophies \'\'\' you may have input with \`\`\` consecutive triple backticks; AKA grave-accents, making markdown for codeblocks slightly simpler to achieve.';
	}
	getSettingsPanel() {
		return;
	}
};
