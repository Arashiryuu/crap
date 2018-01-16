//META{"name":"messageTimestamps"}*//

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

class messageTimestamps {
	constructor() {
		this.initialized = false;

		this.contextMarkup = `<div class="item-group messageTimestamps">
			<div class="item timestamp">
				<span>Show Timestamp</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.contextMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes && change.addedNodes.length) {
					for(const node of change.addedNodes.values()) {
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')
						|| node.nodeType === 1 && node.classList && node.classList.contains('contextMenu-uoJTbz')) {
							this.addContext(node);
						}
					}
				}
			}
		});
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		$('*').off('click.msgTimes');
		this.discon();
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		let libraryScript = document.querySelector('#zeresLibraryScript');
		if(!libraryScript) {
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		}

		if(typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.addEventListener('load', () => this.initialize());
	}

	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.downLink);
		this.appObs();
		this.initialized = true;
		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
	}

	appObs() {
		const app = document.querySelector('.app');
		this.contextMO.observe(app, { childList: true, subtree: true });
	}

	discon() {
		this.contextMO.disconnect();
	}

	addContext(node) {
		if(!node) return;
		const refNode = this.getReactInstance(node);
		if(refNode && refNode.return.memoizedProps.message && refNode.return.memoizedProps.type && refNode.return.memoizedProps.type.includes('MESSAGE')) {
			$(node).find('.item').first().before(this.contextMarkup);
			$(node).find('.item.timestamp')
				.off('click.msgTimes')
				.on('click.msgTimes', this.showTimestamp.bind(this));			
		}
	}

	showTimestamp() {
		if(process['argv0'].includes('DiscordCanary') || process['argv0'].includes('DiscordPTB')) {
			const menu = document.querySelector('.contextMenu-uoJTbz'), msg = this.getReactInstance(menu).return.memoizedProps.message;
			if(!menu || !msg) return;
			PluginUtilities.showToast(msg.timestamp._d);
		} else {
			const menu = document.querySelector('.context-menu'), msg = this.getReactInstance(menu).return.memoizedProps.message;
			if(!menu || !msg) return;
			PluginUtilities.showToast(msg.timestamp._d);
		}
	}
	
	/**
	 * @name getInternalInstance
	 * @description Function to return the react internal data of the element
	 * @param {Node} node - the element we want the internal data from
	 * @author noodlebox
	 * @returns {Node}
	 */
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	}

	log(text, ...extra) {
		if(typeof text !== 'string')
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text);
		if(!extra.length)
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '');
		else
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '', ...extra);
	}

	err(error) {
		return console.error(`[%c${this.getName()}%c] ${error}`, 'color: #59F;', '');
	}

	get downLink() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.getName()}/${this.getName()}.plugin.js`;
	}

	getName() {
		return 'messageTimestamps';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.4';
	}

	getDescription() {
		return 'Shows a message\'s timestamp. Simply right-click a message and click "Show Timestamp."';
	}
};

/*@end@*/
