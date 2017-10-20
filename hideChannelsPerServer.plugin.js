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

		this.contextItem = `<div class="item-group hideChannelsPerServer">
			<div class="item hideChannelItem">
				<span>Hide Channel</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.mo = new MutationObserver((changes, _) => {
			changes.forEach((change, i) => {
				if(change.addedNodes) {
					change.addedNodes.forEach((node) => {
						if(node.className !== undefined && node.className === 'containerDefault-7RImuF') {
							this.hideChannel();
						}
					});
				}
			});
		});

		this.contmo = new MutationObserver((changes, p) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
							this.appendContext(node);
						}
					}
				}
			}
		});
	};

	hideChannel() {
		if(!this.hidChannels.chans.length) {
			$('.channels-wrap [class*="containerDefault-7RImuF"]').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
			return this.log('No channels found');
		}
		else {
			const self = this;
			$('.channels-wrap [class*="containerDefault-7RImuF"]').each(function() {
				self.hidChannels.chans.some(ii => ii === self.getReactInstance($(this)[0]).return.stateNode.props.channel.id) ? $(this).hide() : $(this).show()
			});
		}
	};

	appendContext(context) {
		if(!context) return;
    	if(!this.getReactInstance(context).return.memoizedProps.message && this.getReactInstance(context).return.memoizedProps.channel && (this.getReactInstance(context).return.memoizedProps.channel.type === 0 || this.getReactInstance($('.context-menu')[0]).return.memoizedProps.channel.type === 2)) {
			$(context).find('.item').first().after(this.contextItem);
			$(context).find('.item.hideChannelItem')
				.off('click.hideChannels')
				.on('click.hideChannels', this.contextClick.bind(this));
    	}
	};

	contextClick() {
		if(!$('.context-menu').length) return;
		if(!this.getReactInstance($('.context-menu')[0]).return.memoizedProps.channel) return;
		if(!this.hidChannels.chans.includes(this.getReactInstance($('.context-menu')[0]).return.memoizedProps.channel.id)) {
			this.hidChannels.chans.push(this.getReactInstance($('.context-menu')[0]).return.memoizedProps.channel.id);
			this.saveSettings();
			this.hideChannel();
		}
	};

	/**
     * @name getInternalInstance
     * @description returns the react internal instance of the element
     * @param {Node} node - the element we want the internal data from
     * @author noodlebox
     * @returns {Node}
     */
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	};

	chanPush() {
		const nChan = $('#ChanblockField').val();
		if(isNaN(nChan)) return $('#ChanblockField').val('Invalid entry. (ID-only)');
		if(!nChan) return $('#ChanblockField').val('Invalid entry. (No-entry)');
		if(!nChan.match(/^\d{16,18}$/)) return $('#ChanblockField').val('Invalid entry. (Invalid-length-or-characters)');
		this.hidChannels.chans.push(nChan);
		this.saveSettings();
		this.hideChannel();
	};

	chanClear() {
	  const oChan = $('#ChanblockField').val();
		if(oChan.match(/^\d{16,18}$/)) {
			this.hidChannels.chans.splice(this.hidChannels.chans.indexOf(oChan), 1);
			this.saveSettings();
			alert('Successfully removed!');
			this.hideChannel();
		} else {
			this.hidChannels.chans.pop();
			this.saveSettings();
			alert('Successfully removed!');
			this.hideChannel();	
		}
	};

	saveSettings() {
		bdPluginStorage.set('hideChannelsPerServer', 'channelsss', JSON.stringify(this.hidChannels.chans));
		this.log('Saved settings\n' + this.hidChannels.chans.join(', '));
	};

	loadSettings() {
		this.hidChannels.chans = JSON.parse(bdPluginStorage.get('hideChannelsPerServer', 'channelsss'));
		this.log('Loaded settings\n' + this.hidChannels.chans.join(', '));
	};

	start() {
		this.log('Started');
		const settings = bdPluginStorage.get('hideChannelsPerServer', 'channelsss');
		if(!settings) {
			this.log('No settings found');
		}
		else {
			this.hidChannels.chans = JSON.parse(settings);
			this.log('Loaded settings\n' + this.hidChannels.chans.join(', '));
		}
		this.contmo.observe(document.querySelector('.app'), {childList: true, subtree: true});
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
		$('*').off('click.hideChannels');
		this.contmo.disconnect();
		this.mo.disconnect();
		this.log('Stopped');
	};

	load() {
		this.log('Loaded');
	};

	log(text, extra) {
		if(typeof text !== 'string')
			return console.log(`[%c${this.getName()}%c]`, 'color: #F2F;', '', text);
		if(!extra)
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #F2F;', '');
		else
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #F2F;', '', extra);
	}

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
		return '1.4'; 
	};

	getDescription() {
		 return 'Hides any channels listed in the array of IDs.'; 
	};

	getSettingsPanel() { 
		return `<h3>hideChannelsPerServer Plugin</h3><br/> 
		<input id="ChanblockField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>
		<br/><button class="ChU-btn0" onclick=BdApi.getPlugin("${this.getName()}").chanPush()>apply</button>
		<button class="ChU-btn1" onclick=BdApi.getPlugin("${this.getName()}").chanClear()>remove</button>
		<button class="ChU-btn2" onclick=BdApi.getPlugin("'${this.getName()}").saveSettings()>save</button>
		<button class="ChU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>load</button><br/>
		<br/>How to use:
		<br/>1) Insert a channel\'s ID.<br/>
		2) Click "apply."<br/>
		3) To remove the last-added channel, click the "remove" button.<br/>
		<span class="hCPS-Footnote" style="font-size: 12px;">Note: You can remove a specific channel by entering its ID to the textarea and clicking "remove".\nAlso channels can be hidden by right-clicking them.</span><br/>`;
	};
};

/*@end*/
