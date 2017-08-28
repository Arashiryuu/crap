//META{"name":"hideServers"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

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
		if (nServer.match(/^[0-9]{16,18}$/) === null) return $('#ServerHideField').val('Invalid entry. (Invalid length or non digit)');
		this.hidServers.servers.push(nServer);
		console.info(`%c[${this.getName()}]%c\t${this.hidServers.servers.join(', ')}`, 'color: #AAF', '');
		this.hideServer();
	};
	servClear() {
		if (this.hidServers.servers.length !== 0)
			this.servRemove(this.hidServers.servers[this.hidServers.servers.length-1]);
		else
			console.info('%c[hideServers]%c There are no servers to remove', 'color: #AAF', '');
	};
	servRemove(servId) {
		this.hidServers.servers.splice(this.hidServers.servers.indexOf(servId), 1);
		$(`[href*='${servId}']`).parent().parent().parent().show();
		console.info(`%c[${this.getName()}]%c\t${this.hidServers.servers.join(', ')}`, 'color: #AAF', '');
		alert('Successfully removed!');
		this.hideServer();		
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
	updateSettingsPanel() {
		let pluginName = this.getName();
		if ($('#hsplugin-settings-div').length === 0) {
			var that = this;
			setTimeout(function() { that.updateSettingsPanel(); }, 500); // try again later
			return;
		}
		let stff = `<h3>hideServers Plugin</h3><br/>
		<div id="hsplugin-subcontainer" style="display: flex; flex: 1 1 auto; flex-flow: wrap row; position: relative; margin-bottom: 4ex; width: 70%;">`;
		for(let server of this.hidServers.servers) {
			let style = $(`[href*='${server}']`).attr('style');
			stff += `<button class='avatar-small' onclick='BdApi.getPlugin("${pluginName}").servRemove(${server})' style='${style}; background-size: cover; background-position: center; flex: 1 0 20%; margin-left: 1px; max-width: 13%; min-height: 4vh;'></button>`;
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
	};
	start() { 
		console.info('%c[hideServers]%c\tWorking...', 'color: #AAF', '');
		var settings = bdPluginStorage.get('hideServers', 'servers');
		if(settings === null || settings === undefined) {
			console.info('%c[hideServers]%c\t' + 'No settings found.', 'color: #AAF', '');
		}
		else {
			this.hidServers.servers = JSON.parse(settings);
			console.info('%c[hideServers]%c\t' + this.hidServers.servers.join(', '), 'color: #AAF', '');
		}
		this.hideServer(); 
		this.updateSettingsPanel(); 
	};
	stop() {
		for(let server of this.hidServers.servers) {
			$(`[href*='${server}']`).parent().parent().parent().show();
		}
		console.info('%c[hideServers]%c\tStopped.', 'color: #AAF', '');
	};
	load() { 
		console.info('%c[hideServers]%c\tBooting-Up.', 'color: #AAF', ''); 
	};
	onSwitch() {
		this.hideServer();
	};
	getAuthor() {
		return 'Arashiryuu';
	};
	getName() {
		return 'hideServers';
	};
	getVersion() {
		return '2';
	};
	getDescription() {
		return 'Hides any servers listed in the array of IDs.';
	};
	getSettingsPanel() { 
		let pluginName = this.getName();
		let stff = `<div id='hsplugin-settings-div'>
			<h3>hideServers Plugin</h3><br/>
			Loading...
			</div>`;
		var that = this;
		setTimeout(function() { that.updateSettingsPanel(); }, 1000);
		return stff;
	};
};
/*@end*/
