//META{"name":"hideUsers"}*//

class hideUsers {
	constructor() {
		this.hideUser = () => {
			if(!this.hidUsers.users[0]) return console.warn('%c[hideUsers]%c\tNo users found.', 'color: #9653AD', '');
			for(let user of this.hidUsers.users) {
				$(`[style*='${user}']`).parent().hide();
				$(`.avatarContainer-303pFz [style*='${user}']`).parent().parent().parent().hide();
 			}
		};

		this.hidUsers = {
			users: []
		};
	};

	userPush() {
		let nUser = $('#hUTEXT').val();
		if(isNaN(nUser)) return $('#hUTEXT').val('Invalid entry. (NaN)');
		if(nUser.length === 0 || nUser === undefined) return $('#hUTEXT').val('Invalid entry. (No-entry)');
		if(!nUser.match(/^\d{17,18}$/) || nUser.match(/^\d{17,18}$/) === null) return $('#hUTEXT').val('Invalid entry. (ID-length)');
		this.hidUsers.users.push(nUser);
		console.log(`%c[${this.getName()}]%c\t${this.hidUsers.users.join(', ')}`, 'color: #9653AD', '');
		this.hideUser();
	};
	
	userClear() {
		if(this.hidUsers.users.length !== 0) {
			this.hidUsers.users.pop();
			console.info(`%c[${this.getName()}]%c\t${this.hidUsers.users.join(', ')}`, 'color: #9653AD', '');
			alert('Successfully removed!');
			this.hideUser();
		}
		else
			return console.info(`%c[${this.getName()}]%c\t No users to remove.`, 'color: #9653AD', '');
	};

	saveSettings() {
		bdPluginStorage.set('hideUsers', 'users', JSON.stringify(this.hidUsers.users));
		console.log('%c[hideUsers]%c\tSaved settings.', 'color: #9653AD', '');
	};

	loadSettings() {
		this.hidUsers.users = JSON.parse(bdPluginStorage.get('hideUsers', 'users'));
		console.log('%c[hideUsers]%c\tLoaded settings.', 'color: #9653AD', '');
	};

	start() { 
		console.info('%c[hideUsers]%c\tWorking...', 'color: #9653AD', '');
		var settings = bdPluginStorage.get('hideUsers', 'users');
		if(settings === null) {
			console.info('%c[hideUsers]%c\tNo settings found.', 'color: #9653AD', '');
		}
		else {
			this.hidUsers.users = JSON.parse(settings);
			console.info('%c[hideUsers]%c\t' + this.hidUsers.users.join(', '), 'color: #9653AD', '');
		}
	 	this.hideUser();  
	};
	stop() { console.info('%c[hideUsers]%c\tStopped.', 'color: #9653AD', ''); };
	load() { console.info('%c[hideUsers]%c\tBooting-Up.', 'color: #9653AD', ''); };
	unload() {};
	observer(ex) { 
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('message-group'))
			this.hideUser();
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('markup'))
			this.hideUser();
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('channel-members-wrap'))
			this.hideUser();
		else 
			return; 
	};
	onMessage() {};
	onSwitch() { this.hideUser(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideUsers'; };
	getVersion() { return '1.2.3'; };
	getDescription() { return 'Hides any users listed in the array.'; };
	getSettingsPanel() { 
		let html = `
			<h3>hideUsers Plugin</h3><br/>

			<input id="hUTEXT" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>
			<br/><button class="hUBTNw" onclick=BdApi.getPlugin("${this.getName()}").userPush()>apply</button>
			<button class="hUBTNx" onclick=BdApi.getPlugin("${this.getName()}").userClear()>remove</button>
			<button class="hUBTNy" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>save</button>
			<button class="hUBTNz" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>load</button><br/>
			
			<br/>How to use:<br/>
			0) Go to user settings -> Appearance, and enable Developer Mode, then right-click a user and "Copy ID"<br/>
			1) Insert a user\'s ID.<br/>
			2) Click "apply."<br/>
			3) To remove the last-added user, click the "remove" button.<br/>`;
		return html;
	};
};
/*@end*/
