//META{"name":"KillXD","displayName":"KillXD","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap"}*//

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

class KillXD {
	constructor() {
		this.initialized = false;
		this.regex = /\bX(D){1,}\b/igm;
		this.switchList = ['app', 'chat', 'messages-wrapper'];
		this.messageList = ['message-1PNnaP', 'container-1YxwTf'];
		this.mo = new MutationObserver((changes) => {
			for (const change of changes) {
				if (change.addedNodes.length) {
					for (const node of change.addedNodes.values()) {
						if (node.classList && this.messageList.includes(node.classList[1])) this.process();
					}
				}
			}
		});
	}

	/* Required Methods - Plugin Info */

	getName() { return this.name; }
	getAuthor() { return this.author; }
	getVersion() { return this.version; }
	getDescription() { return this.description; }

	/* Required Methods - Main */

	load() {
		this.log('Loaded');
	}

	stop() {
		this.unwatch();
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		let libraryScript = window.zeresLibraryScript;
		
		if (!libraryScript) {
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		} else if (libraryScript instanceof HTMLCollection) {
			for (let i = libraryScript.length - 1, len = 0; i > len; i--) libraryScript[i].remove();
			libraryScript = window.zeresLibraryScript;
			libraryScript.remove();
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		} else if (window.ZeresLibrary && window.ZeresLibrary.isOutdated) {
			libraryScript.remove();
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		}

		if (typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.addEventListener('load', () => this.initialize());
	}

	/* Methods */

	initialize() {
		PluginUtilities.checkForUpdate(this.name, this.version, this.link);

		this.watch();
		this.process();
		this.onEdits();
		this.initialized = true;

		PluginUtilities.showToast(`${this.name} ${this.version} has started.`, { type: 'info', icon: true, timeout: 2e3 });
	}

	process() {
		const messages = document.querySelectorAll('.message-1PNnaP .markup-2BOw-j');
		for (const message of messages) {
			const html = message.innerHTML;
			if (this.regex.test(html)) {
				message.innerHTML = html.replace(this.regex, 'I\'m a retard lol.');
			}
		}
	}

	watch() {
		const app = document.querySelector('.app');
		if (!app) return;
		this.mo.observe(app, { childList: true, subtree: true });
	}

	unwatch() {
		this.mo.disconnect();
	}

	/* Observer */

	observer({ addedNodes }) {
		if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
			this.unwatch();
			this.watch();
			this.process();
		}
	}

	/* Utility */

	log() {
		return console.log(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...arguments);
	}

	err() {
		return console.error(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...arguments);
	}

	/* Getters */

	get [Symbol.toStringTag]() {
		return 'Plugin';
	}

	get short() {
		let string = '';

		for (let i = 0, len = this.name.length; i < len; i++) {
			const char = this.name[i];
			if (char === char.toUpperCase()) string += char;
		}

		return string;
	}

	get link() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.name}/${this.name}.plugin.js`;
	}

	get name() {
		return 'KillXD';
	}

	get author() {
		return 'Arashiryuu';
	}

	get version() {
		return '1.0.0';
	}

	get description() {
		return 'Removes shitty XDs.';
	}
};

/*@end@*/
