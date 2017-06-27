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
		if(isNaN(nServer)) return $('#ServerHideField').val('Invalid entry. (NaN)');
		if(nServer.length === 0 || nServer === undefined) return $('#ServerHideField').val('Invalid entry. (empty server)');
		if (nServer.match(/^[0-9]{16,18}$/) == null) return $('#ServerHideField').val('Invalid entry. (Invalid length or non digit)');
		this.hidServers.servers.push(nServer);
		console.info(`%c[${this.getName()}]%c\t${this.hidServers.servers.join(', ')}`, 'color: #AAF', '');
		this.start();
	};
	
	servClear() {
		if (this.hidServers.servers.length != 0)
			this.servRemove(this.hidServers.servers[this.hidServers.servers.length-1]);
		else
			console.info("There are no servers to remove");
	};

	servRemove(servId) {
		this.hidServers.servers.splice(this.hidServers.servers.indexOf(servId), 1);
		$(`[href*='${servId}']`).parent().parent().parent().show();
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
		this.hideServer();
	};

	start() { 
		console.info('%c[hideServers]%c\tWorking...', 'color: #AAF', ''); 
		this.hideServer();
		this.updateSettingsPanel();
	};
	stop() { console.info('%c[hideServers]%c\tStopped.', 'color: #AAF', ''); };
	load() { console.info('%c[hideServers]%c\tBooting-Up.', 'color: #AAF', ''); this.loadSettings();};
	unload() {};
	onMessage() {};
	onSwitch() { this.hideServer(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideServers'; };
	getVersion() { return '1.0.1'; };
	getDescription() { return 'Hides any servers listed in the array of IDs.'; };

	getSettingsPanel() { 
		let pluginName = this.getName();
		let stff = `<div id='hsplugin-settings-div'>
			<h3>hideServers Plugin</h3><br/>
			Loading...
		</div>`;
		var that = this;
		setTimeout(function() {that.updateSettingsPanel();}, 500);
		return stff;
	};
	updateSettingsPanel() {
		let pluginName = this.getName();
		if ($('#hsplugin-settings-div').length == 0) {
			var that = this;
			setTimeout(function() {that.updateSettingsPanel();}, 500); //try again latter
			return;
		}
		let stff = `<h3>hideServers Plugin</h3><br/>
		<div>`;
		for(let server of this.hidServers.servers) {
			let style = $(`[href*='${server}']`).attr('style');
			stff += `<button class='avatar-small' onclick='BdApi.getPlugin("${pluginName}").servRemove(${server})' style='${style}'></button>`;
 		}
		stff += `</div>
		<input id="ServerHideField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>
			<br/><button class="ShU-btn0" onclick=BdApi.getPlugin("${pluginName}").servPush()>apply</button>
			<button class="ShU-btn1" onclick=BdApi.getPlugin("${pluginName}").servClear()>remove</button>
			<button class="ShU-btn2" onclick=BdApi.getPlugin("${pluginName}").saveSettings()>save</button>
			<button class="ShU-btn3" onclick=BdApi.getPlugin("${pluginName}").loadSettings()>load</button><br/>

			<br/>How to use:<br/>
				0) Go to user settings -> Appearance, and enable Developer Mode, then right-click a server and "Copy ID"<br/>
				1) Insert a server's ID.<br/>
				2) Click "apply."<br/>
				3) To remove the last-added server, click the "remove" button.<br/>
		`;
		$('#hsplugin-settings-div').html(stff);
	}
};
/*@end*/
