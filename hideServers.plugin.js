//META{"name":"hideServers"}*//

class hideServers {
	constructor() {
		this.hideServer = () => {
			if(!this.hidServers.servers[0]) return console.warn('%c[hideServers]%c\tNo servers found.', 'color: #AAF', '');
			for(let server of this.hidServers.servers) {
  			$(`[href*='${server}']`).parent().parent().parent().hide();
 			}
		};

		this.hidServers = {
			servers: []
		};
	};

	servPush() {
		let nServer = $('#ServerHideField').val();
		if(isNaN(nServer)) return $('#ServerHideField').val('Invalid entry.');
		if(nServer.length === 0 || nServer === undefined) return $('#ServerHideField').val('Invalid entry.');
		if(nServer.length < 18) return $('#ServerHideField').val('Invalid entry.');
		this.hidServers.servers.push(nServer);
		console.info(`%c[${this.getName()}]%c\t${this.hidServers.servers.join(', ')}`, 'color: #AAF', '');
		this.start();
	};
	
	servClear() {
		this.hidServers.servers.pop();
		console.info(`%c[${this.getName()}]%c\t${this.hidServers.servers.join(', ')}`, 'color: #AAF', '');
		alert('Successfully removed!');
		this.start();		
	};

	saveSettings() {
		bdPluginStorage.set('hideServers', 'servers', JSON.stringify(this.hidServers.servers));
		console.info('%c[hideServers]%c\tSaved settings.', 'color: #AAF', '');
		console.info('%c[hideServers]%c\t' + this.hidServers.servers.join(', '), 'color: #AAF', '');
	};

	loadSettings() {
		this.hidServers.servers = JSON.parse(bdPluginStorage.get('hideServers', 'servers'));
		console.info('%c[hideServers]%c\tLoaded settings.', 'color: #AAF', '');
		console.info('%c[hideServers]%c\t' + this.hidServers.servers.join(', '), 'color: #AAF', '');
	};

	start() { console.info('%c[hideServers]%c\tWorking...', 'color: #AAF', ''); this.hideServer();  };
	stop() { console.info('%c[hideServers]%c\tStopped.', 'color: #AAF', ''); };
	load() { console.info('%c[hideServers]%c\tBooting-Up.', 'color: #AAF', ''); };
	unload() {};
	onMessage() {};
	onSwitch() { this.hideServer(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideServers'; };
	getVersion() { return '1.0.1'; };
	getDescription() { return 'Hides any servers listed in the array of IDs.'; };
	getSettingsPanel() { 
		let stff = '<h3>hideServers Plugin</h3><br/>'; 
		stff += '<input id="ServerHideField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>';
		stff += '<br/><button class="ShU-btn0" onclick=BdApi.getPlugin("'+ this.getName() +'").servPush()>apply</button>';
		stff += '<button class="ShU-btn1" onclick=BdApi.getPlugin("'+ this.getName() +'").servClear()>remove</button>';
		stff += '<button class="ShU-btn2" onclick=BdApi.getPlugin("'+ this.getName() +'").saveSettings()>save</button>';
		stff += '<button class="ShU-btn3" onclick=BdApi.getPlugin("'+ this.getName() +'").loadSettings()>load</button><br/>';
		stff += '<br/>How to use:<br/>';
		stff += '0) Go to user settings -> Appearance, and enable Developer Mode, then right-click a server and "Copy ID"<br/>';
		stff += '1) Insert a server\'s ID.<br/>';
		stff += '2) Click "apply."<br/>';
		stff += '3) To remove the last-added server, click the "remove" button.<br/>';
		return stff;
	};
};
/*@end*/
