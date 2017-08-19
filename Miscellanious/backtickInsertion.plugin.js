//META{"name":"backtickInsertion"}*//

class backtickInsertion {
	start() {
		this.log('Started');
		const textArea = $('.channel-text-area-default div textarea');
		if(!textArea.length) return;
		textArea.off('keyup.backIn').on('keyup.backIn', (e) => {
			if(textArea.val().includes('\'\'\'')) {
				textArea.val(textArea.text().replace(/\'\'\'/g, '```'));
			}
		});
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
		return 'Replace any consecutive triple apostrophies <em>\'\'\'</em> with <em>\`\`\`</em> consecutive triple backticks; AKA grave-accents, making markdown for codeblocks slightly simpler to achieve.';
	}
	getSettingsPanel() {
		return;
	}
};
