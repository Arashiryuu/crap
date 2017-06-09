//META{"name":"hideUsers"}*//

class hideUsers {
	constructor() {
		this.hideUser = () => {
			let users = [];
			// edit user array to suit your needs, only accepts user IDs such as '140188899585687552' for example
			if(!users[0]) return console.warn('%c[hideUsers]%c\tNo users found.', 'color: #9653AD', '');
			for(let user of users) {
				return $(`[style*='${user}']`).parent().hide();
 			}
		}
	};

	start() { console.log('%c[hideUsers]%c\tWorking...', 'color: #9653AD', ''); return this.hideUser(); };
	stop() { console.log('%c[hideUsers]%c\tStopped.', 'color: #9653AD', ''); };
	load() { console.log('%c[hideUsers]%c\tBooting up.', 'color: #9653AD', ''); };
	unload() {};
	onMessage() { this.hideUser(); };
	onSwitch() { this.hideUser(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideUsers'; };
	getVersion() { return '0.1.0'; };
	getDescription() { return 'Hides any users listed in the array of words.'; };
	getSettingsPanel() { return 'soon™'; };
};
/*@end*/
