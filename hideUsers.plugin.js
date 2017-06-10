//META{"name":"hideUsers"}*//

class hideUsers {
	constructor() {
		this.hideUser = () => {
			if(!this.hidUsers.users[0]) return console.warn('%c[hideUsers]%c\tNo users found.', 'color: #9653AD', '');
			for(let user of this.hidUsers.users) {
				$(`[style*='${user}']`).parent().hide();
 			}
		};

		this.hidUsers = {
			users: [] /* Users must be set by ID such as '252456997457231873' */
		};
	};

	userPush() {
		let nUser = $('#hUTEXT').val();
		if(isNaN(nUser)) return $('#hUTEXT').val('Invalid entry.');
		if(nUser.length === 0 || nUser === undefined) return $('#hUTEXT').val('Invalid entry.');
		if(nUser.length < 18) return $('#hUTEXT').val('Invalid entry.');
		this.hidUsers.users.push(nUser);
		console.log(`%c[${this.getName()}]%c\t${this.hidUsers.users.join(', ')}`, 'color: #9653AD', '');
		this.start();
	};
	
	userClear() {
		this.hidUsers.users.pop();
		console.log(`%c[${this.getName()}]%c\t${this.hidUsers.users.join(', ')}`, 'color: #9653AD', '');
		alert('Successfully removed!');
		this.start();		
	};

	saveSettings(save) {
		bdPluginStorage.set('hideUsers', 'users', JSON.stringify(this.hidUsers.users));
		save = true;
		console.log('%c[hideUsers]%c\tSaved settings.', 'color: #9653AD', '');
	};

	loadSettings() {
		this.hidUsers.users = JSON.parse(bdPluginStorage.get('hideUsers', 'users'));
		console.log('%c[hideUsers]%c\tLoaded settings.', 'color: #9653AD', '');
	};

	start() { console.log('%c[hideUsers]%c\tWorking...', 'color: #9653AD', ''); this.hideUser(); };
	stop() { console.log('%c[hideUsers]%c\tStopped.', 'color: #9653AD', ''); };
	load() { console.log('%c[hideUsers]%c\tBooting-Up.', 'color: #9653AD', ''); };
	unload() {};
	onMessage() { this.hideUser(); };
	onSwitch() { this.hideUser(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideUsers'; };
	getVersion() { return '1.0.1'; };
	getDescription() { return 'Hides any users listed in the array of words.'; };
	getSettingsPanel() { 
		let html = '<h3>hideUsers Plugin</h3><br/>'; 
		html += '<input id="hUTEXT" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>';
		html += '<br/><button class="hUBTNw" onclick=BdApi.getPlugin("'+ this.getName() +'").userPush()>apply</button>';
		html += '<button class="hUBTNx" onclick=BdApi.getPlugin("'+ this.getName() +'").userClear()>remove</button>';
		html += '<button class="hUBTNy" onclick=BdApi.getPlugin("'+ this.getName() +'").saveSettings()>save</button>';
		html += '<button class="hUBTNz" onclick=BdApi.getPlugin("'+ this.getName() +'").loadSettings()>load</button><br/>';
		html += '<br/>How to use:';
		html += '<br/>1) Insert a user\'s ID.<br/>';
		html += '2) Click "apply."<br/>';
		html += '3) To remove the last-added user, click the "remove" button.<br/>';
		return html;
	};
};
/*@end*/
