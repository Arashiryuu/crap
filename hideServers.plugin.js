//META{"name":"hideServers"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
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
		this.hidServers = {
			servers: []
		}

		this.contextItem = `<div class="item-group hideServers">
			<div class="item hideServer-item-hide">
				<span>Hide Server</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.contextmo = new MutationObserver((changes, p) => {
			changes.forEach((change, i) => {
				if(change.addedNodes) {
					change.addedNodes.forEach((node) => {
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
							this.appendContext(node);
						}
					});
				}
			});
		});
	}

	hideServer() {
		if(!this.hidServers.servers[0]) {
			$('.guild').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
		}
		else {
			$('.guild').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
			for(const server of this.hidServers.servers) {
				$(`[href*='${server}']`).parent().parent().parent().hide();
			}
		}
	}

	appendContext(context) {
		if(!context) return;
		if(this.getReactInstance(context).return.memoizedProps.type === 'GUILD_ICON_BAR' && this.getReactInstance(context).return.memoizedProps.guild && !this.getReactInstance(context).return.memoizedProps.channel) {
      		$(context).find('.item').first().after(this.contextItem);
      		$(context).find('.item.hideServer-item-hide')
       			.off('click.hideServers')
				.on('click.hideServers', this.contextHide.bind(this));
    	}
	}

	contextHide() {
    	if(!$('.context-menu').length) return;
    	if(!this.getReactInstance($('.context-menu')[0]).return.memoizedProps.guild) return;
    	if(!this.hidServers.servers.includes(this.getReactInstance($('.context-menu')[0]).return.memoizedProps.guild.id)) {
      		this.hidServers.servers.push(this.getReactInstance($('.context-menu')[0]).return.memoizedProps.guild.id);
      		this.saveSettings();
      		this.hideServer();
		}
	}

	servPush() {
		const nServer = $('#ServerHideField').val();
		if(isNaN(nServer)) return $('#ServerHideField').val('Invalid entry. (NaN)');
		if(!nServer) return $('#ServerHideField').val('Invalid entry. (empty server)');
		if(!nServer.match(/^[0-9]{16,18}$/)) return $('#ServerHideField').val('Invalid entry. (Invalid length or non digit)');
		this.hidServers.servers.push(nServer);
		this.log('Server added\n' + this.hidServers.servers.join(', '));
		this.hideServer();
	}

	servClear() {
		if(this.hidServers.servers.length !== 0)
			this.servRemove(this.hidServers.servers[this.hidServers.servers.length-1]);
		else
			this.log('No servers found');
	}

	servRemove(servId) {
		this.hidServers.servers.splice(this.hidServers.servers.indexOf(servId), 1);
		$(`[href*='${servId}']`).parent().parent().parent().show();
		this.log('Server removed\n' + this.hidServers.servers.join(', '));
		alert('Successfully removed!');
		this.hideServer();		
	}

	saveSettings() {
		bdPluginStorage.set('hideServers', 'servers', JSON.stringify(this.hidServers.servers));
		this.log('Saved settings\n' + this.hidServers.servers.join(', '));
	}

	loadSettings() {
		this.hidServers.servers = JSON.parse(bdPluginStorage.get('hideServers', 'servers'));
		this.log('Loaded settings\n' + this.hidServers.servers.join(', '));
		this.hideServer();
	}

	updateSettingsPanel() {
		const pluginName = this.getName();
		if($('#hsplugin-settings-div').length === 0) {
			var that = this;
			setTimeout(() => that.updateSettingsPanel(), 500); // try again later
			return;
		}
		let stff = `<h3>hideServers Plugin</h3><br/>
		<div id="hsplugin-subcontainer" style="display: flex; flex: 1 1 auto; flex-flow: wrap row; position: relative; margin-bottom: 4ex; width: 70%;">`;
		for(const server of this.hidServers.servers) {
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
				0) Go to user settings \u21D2 Appearance, and enable Developer Mode, then right-click a server and "Copy ID"<br/>
				1) Insert a server's ID.<br/>
				2) Click "apply."<br/>
				3) To remove the last-added server, click the "remove" button.<br/><br/>
				<span style="font-size: 12px;">Note: You can right-click a server to hide it also.</span><br/><br/>
		`;
		$('#hsplugin-settings-div').html(stff);
	}

	/**
     * @name getInternalInstance
     * @description returns the react internal instance of the element
     * @param {Node} node - the element we want the internal data from
     * @author noodlebox
     * @returns {Node}
     */
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	}
	
	observer({addedNodes, removedNodes}) { // replacing onSwitch
		if(addedNodes.length && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.hideServer();
		}
	}

	start() { 
		this.log('Started');
		const settings = bdPluginStorage.get('hideServers', 'servers');
		if(!settings) {
			this.log('No settings available');
		}
		else {
			this.hidServers.servers = JSON.parse(settings);
			this.log('Settings loaded\n' + this.hidServers.servers.join(', '));
		}
		this.hideServer();
		this.updateSettingsPanel();
		this.contextmo.observe($('.app')[0], {childList: true, subtree: true});
	}

	stop() {
		if(!this.hidServers.servers[0]) {
			$('.guild').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
		}
		else {
			for(const server of this.hidServers.servers) {
				$(`[href*='${server}']`).parent().parent().parent().show();
			}
		}
		$('*').off('click.hideServers');
		this.contextmo.disconnect();
		this.log('Stopped');
	}

	load() { 
		this.log('Loaded');
	}

	log(text) {
		return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #AAF', '');
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getName() {
		return 'hideServers';
	}

	getVersion() {
		return '2ƒ';
	}

	getDescription() {
		return 'Hides any servers listed in the array of IDs.';
	}

	getSettingsPanel() { 
		let stff = `<div id='hsplugin-settings-div'>
			<h3>hideServers Plugin</h3><br/>
			Loading...
			</div>`;
		const that = this;
		setTimeout(() => that.updateSettingsPanel(), 1000);
		return stff;
	}
};

/*@end*/
