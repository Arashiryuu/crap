//META{"name":"staticEmojis"}*//

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

class staticEmojis {
	constructor() {
		this.initialized = false;

		this.emoteMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.type === 'attributes' && change.target.classList && change.target.classList.contains('emoji')) {
					this.scan();
				}
			}
		});
	}

	load() {
		this.log('Loaded');
	}

	stop() {
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
		this.initialized = true;
		this.observeC();
		this.scan();
		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
	}

	scan() {
		const emojis = document.querySelectorAll('.emoji');
		if(!emojis.length) return;
		try {
			for(const emoji of emojis) {
				if(emoji.src.includes('gif')) {
					emoji.src = emoji.src.replace('gif', 'png');
				}
			}
		} catch(e) {
			this.err(e.stack);
		}
	}

	observeC() {
		const chat = document.querySelector('.chat');
		if(!chat) return;
		this.emoteMO.observe(chat, { attributes: true, childList: true, subtree: true });
	}

	discon() {
		this.emoteMO.disconnect();
	}

	observer({ addedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.discon();
			this.observeC();
			this.scan();
		}
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')) {
			this.scan();
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
		return 'staticEmojis';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.0';
	}

	getDescription() {
		return 'Stops Nitro users\' animated emojis from animating.';
	}
};

/*@end@*/
