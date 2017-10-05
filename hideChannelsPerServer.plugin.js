//META{"name":"hideChannelsPerServer"}*//

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

class hideChannelsPerServer {
	constructor() {
		this.hidChannels = {
			chans: []
		};
		this.mo = new MutationObserver((changes, _) => {
			changes.forEach((change, i) => {
				if(change.addedNodes) {
					change.addedNodes.forEach((node) => {
						if(node.className != undefined && node.className === 'containerDefault-7RImuF') {
							this.hideChannel();
						}
					});
				}
			});
		});
	};
	hideChannel() {
		if(!this.hidChannels.chans[0]) {
			$('.channels-wrap [class*="containerDefault-7RImuF"]').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
			return console.warn('%c[hideChannelsPerServer]%c\tNo channels found.', 'color: #F2F', '');
		}
		const self = this;
		$('.channels-wrap [class*="containerDefault-7RImuF"]').each(function() {
			self.hidChannels.chans.some(ii => ii === self.getReactInstance($(this)[0]).return.stateNode.props.channel.id) ? $(this).hide() : $(this).show()
		});
	};
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	};
	chanPush() {
		let nChan = $('#ChanblockField').val();
		if(isNaN(nChan)) return $('#ChanblockField').val('Invalid entry. (ID-only)');
		if(!nChan) return $('#ChanblockField').val('Invalid entry. (No-entry)');
		if(!nChan.match(/^\d{16,18}$/)) return $('#ChanblockField').val('Invalid entry. (Invalid-length-or-characters)');
		this.hidChannels.chans.push(nChan);
		console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
		this.hideChannel();
	};
	chanClear() {
	  let oChan = $('#ChanblockField').val();
		if(oChan.match(/^\d{16,18}$/)) {
			this.hidChannels.chans.splice(this.hidChannels.chans.indexOf(oChan), 1);
			console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
			alert('Successfully removed!');
			this.hideChannel();
		} else {
			this.hidChannels.chans.pop();
			console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
			alert('Successfully removed!');
			this.hideChannel();	
		}
	};
	saveSettings() {
		bdPluginStorage.set('hideChannelsPerServer', 'channelsss', JSON.stringify(this.hidChannels.chans));
		console.info('%c[hideChannelsPerServer]%c\tSaved settings.', 'color: #F2F', '');
		console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};
	loadSettings() {
		this.hidChannels.chans = JSON.parse(bdPluginStorage.get('hideChannelsPerServer', 'channelsss'));
		console.info('%c[hideChannelsPerServer]%c\tLoaded settings.', 'color: #F2F', '');
		console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};
	start() {
		console.info('%c[hideChannelsPerServer]%c\tWorking...', 'color: #F2F', '');
		var settings = bdPluginStorage.get('hideChannelsPerServer', 'channelsss');
		if(settings === null) {
			console.info('%c[hideChannelsPerServer]%c\tNo settings found.', 'color: #F2F', '');
		}
		else {
			this.hidChannels.chans = JSON.parse(settings);
			console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
		}
		this.hideChannel();
		const self = this;
		if($('.channels-wrap div[class^="container-"]').length > 0) {
			$('.channels-wrap div[class^="container-"]').each(function() {
				self.mo.observe($(this)[0], {childList: true, subtree: true});
			});
		}
	};
	stop() {
		$('.channels-wrap [class*="containerDefault-7RImuF"]').each(function() {
			if($(this).css('display') === 'none') $(this).show();
		});
		this.mo.disconnect();
		console.info('%c[hideChannelsPerServer]%c\tStopped.', 'color: #F2F', ''); 
	};
	load() { 
		console.info('%c[hideChannelsPerServer]%c\tBooting-Up.', 'color: #F2F', ''); 
	};
	onSwitch() { 
		this.hideChannel(); 
	};
	getAuthor() { 
		return 'Arashiryuu'; 
	};
	getName() { 
		return 'hideChannelsPerServer'; 
	};
	getVersion() { 
		return '1.3'; 
	};
	getDescription() {
		 return 'Hides any channels listed in the array of IDs.'; 
	};
	getSettingsPanel() { 
		let htmls = `<h3>hideChannelsPerServer Plugin</h3><br/> 
		<input id="ChanblockField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>
		<br/><button class="ChU-btn0" onclick=BdApi.getPlugin("${this.getName()}").chanPush()>apply</button>
		<button class="ChU-btn1" onclick=BdApi.getPlugin("${this.getName()}").chanClear()>remove</button>
		<button class="ChU-btn2" onclick=BdApi.getPlugin("'${this.getName()}").saveSettings()>save</button>
		<button class="ChU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>load</button><br/>
		<br/>How to use:
		<br/>1) Insert a channel\'s ID.<br/>
		2) Click "apply."<br/>
		3) To remove the last-added channel, click the "remove" button.<br/>`;
		return htmls;
	};
};

/*@end*/
