//META{"name":"MemberCount","displayName":"MemberCount","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/MemberCount/MemberCount.plugin.js"}*//

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

class MemberCount {
	constructor() {
		this.initialized = false;
		this.default = { blacklist: [], placeholder: 'Server ID' };
		this.defaultSettings();
		this._css;
		this.guildStore;
		this.memberStore;

		this.loadedGuilds = [];

		this.mo = new MutationObserver((changes) => {
			let reinject = false;
			let memberCount = false;
			for (const change of changes) {
				if (change.type === 'childList' && change.addedNodes.length) {
					for (const node of change.addedNodes.values()) {
						if (node.classList && node.classList.contains('membersWrap-2h-GB4')) {
							reinject = true;
						} else if (node.classList && ['chat-3bRxxu', 'messagesWrapper-3lZDfY'].includes(node.classList[0])) {
							reinject = true;
						} else if (node.classList && node.classList.contains('member-3W1lQa')) {
							memberCount = true;
						}
					}
				} else if (change.type === 'childList' && change.removedNodes.length) {
					for (const node of change.removedNodes.values()) {
						if (node.classList && node.classList.contains('member-3W1lQa')) {
							memberCount = true;
						}
					}
				}
				if (document.getElementById('MemberCount')) {
					memberCount = true;
				}
			}
			if (reinject) this.reinject();
			if (memberCount) this.memberCount();
		});

		this.css = `
			#MemberCount {
				position: absolute;
				font-size: 12px;
				letter-spacing: 0.08em;
				font-weight: 500;
				text-transform: uppercase;
				display: block;
				width: 100%;
				text-align: center;
				padding: 0.9vh 0;
				z-index: 5;
			}

			.theme-dark #MemberCount {
				color: hsla(0, 0%, 100%, 0.4);
				background: #2f3136;
			} 
			
			.theme-light #MemberCount {
				color: #99aab5;
				background: #f3f3f3;
			}

			.membersWrap-2h-GB4 .membersGroup-v9BXpm:nth-of-type(3) {
				margin-top: 2vh;
			}
		`;
	}

	/* Required Methods - Plugin Info */

	getName() { return this.name; }
	getAuthor() { return this.author; }
	getVersion() { return this.version; }
	getDescription() { return this.description; }
	getSettingsPanel() { return this.settingsPanel; }

	/* Required Methods - Main */

	load() {
		this.log('Loaded');
	}

	stop() {
		this.unwatch();
		this.remove();
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
		PluginUtilities.loadSettings(this.name, this.settings.blacklist);

		this.guildStore = DiscordModules.SelectedGuildStore;
		this.memberStore = DiscordModules.GuildMemberStore;

		this.inject();
		this.memberCount(this.guildStore.getGuildId());
		this.watch();

		this.initialized = true;
		// PluginUtilities.showToast(`${this.name} ${this.version} has started.`, { type: 'info', icon: true, timeout: 2e3 });
	}

	watch() {
		const app = document.querySelector('.app-2rEoOp');
		if (!app) return false;
		this.mo.observe(app, { childList: true, subtree: true, attributes: true });
		return true;
	}

	unwatch() {
		this.mo.disconnect();
		return true;
	}

	reinject() {
		const m = document.querySelector('.members-1998pB');
		if (!m) return false;

		const id = this.guildStore.getGuildId();
		if (this.settings.blacklist.includes(id) || !id) return false;

		this.inject();

		return this.memberCount(id);
	}

	inject() {
		const sheet = document.getElementById('MemberCountCSS');
		const counter = document.getElementById('MemberCount');
		const members = document.querySelector('.members-1998pB');
		if (!members) return false;

		if (!sheet) {
			const style = this.createElement('style', { id: 'MemberCountCSS', textContent: this.css });
			document.head.appendChild(style);
		}
		
		if (!counter) {
			const e = this.createElement('div', { id: 'MemberCount', className: 'membersGroup-v9BXpm', textContent: '&nbsp;' });
			members.prepend(e);
		}
	}

	remove() {
		const sheet = document.getElementById('MemberCountCSS');
		const counter = document.getElementById('MemberCount');
		if (sheet) sheet.remove();
		if (counter) counter.remove();
	}

	createElement(type = '', properties = {}) {
		const element = document.createElement(type);
		
		for (const prop in properties) element[prop] = properties[prop];

		return element;
	}

	memberCount(guildId) {
		const members = document.querySelector('.members-1998pB');
		if (!members) return false;

		if (guildId && !this.loadedGuilds.includes(guildId)) {
			try {
				DiscordModules.GuildActions.requestMembers([guildId], '', 0);
				this.loadedGuilds.push(guildId);
			} catch(e) {
				this.err(e);
			}
		}
		
		const total = this.memberStore.getMemberIds(this.guildStore.getGuildId()).length;
		const mCount = document.getElementById('MemberCount');

		if (mCount) {
			mCount.textContent = `Members—${total}`;
			return true;
		}

		return false;
	}

	/* Observer */

	observer({ addedNodes }) {
		if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('app-2rEoOp')) {
			this.unwatch();
			this.watch();
		}
	}

	/* Utility */

	log() {
		return console.log(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...arguments);
	}

	err() {
		return console.error(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...arguments);
	}

	/**
	 * @param {*} value
	 * @author Zerebos 
	 */
	deepClone(value) {
		if (typeof value !== 'object') return value;
		if (value instanceof Array) return value.map((i) => this.deepClone(i));

		const clone = Object.assign({}, value);

		for (const key in clone) clone[key] = this.deepClone(clone[key]);

		return clone;
	}

	defaultSettings() {
		this.settings = this.deepClone(this.default);
	}

	/* Settings Panel */

	async handleInput(e) {
		const input = $('.input-wrapper input[placeholder="Server ID"]');
		const isRemoval = (x) => (/^r$|^r\d{16,18}$/).test(x);
		const isID = (x) => (/^\d{16,18}$/).test(x);

		await new Promise((resolve) => setTimeout(resolve, 2e3));

		if (isRemoval(e)) {
			if (e.length > 1 && this.settings.blacklist.includes(e.slice(1))) this.settings.blacklist.splice(this.settings.blacklist.indexOf(e.slice(1)), 1);
			else this.settings.blacklist.pop();
			input.val('Removed from blacklist!');
			PluginUtilities.saveSettings(this.name, JSON.stringify(this.settings.blacklist));
			return setTimeout(() => input.val(''), 2e3);
		}

		if (!isID(e)) return;
		if (!this.settings.blacklist.includes(e)) this.settings.blacklist.push(e);
		if (!input) return;

		input.val('Added to blacklist!');
		PluginUtilities.saveSettings(this.name, JSON.stringify(this.settings.blacklist));
		setTimeout(() => input.val(''), 2e3);
	}

	generate(panel) {
		new PluginSettings.ControlGroup('Plugin Settings', () => PluginUtilities.saveSettings(this.name, JSON.stringify(this.settings.blacklist))).appendTo(panel).append(
			new PluginSettings.Textbox('Blacklist', 'Servers to disable the member-count on. Removals e.g. `r234780924003221506`, or `r`.', '', this.settings.placeholder, (i) => this.handleInput(i))
		);

		const resetButton = $('<button>', {
			type: 'button',
			text: 'Reset To Default',
			style: 'float: right;'
		}).on('click.reset', () => {
			this.defaultSettings();
			PluginUtilities.saveSettings(this.name, JSON.stringify(this.settings.blacklist));
			panel.empty();
			this.generate(panel);
		});

		panel.append(resetButton);
	}

	/* Setters */

	set css(style = '') {
		return this._css = style.split(/\s+/g).join(' ').trim();
	}

	/* Getters */

	get [Symbol.toStringTag]() {
		return 'Plugin';
	}

	get css() {
		return this._css;
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
		return 'MemberCount';
	}

	get author() {
		return 'Arashiryuu';
	}

	get version() {
		return '1.1.3';
	}

	get description() {
		return 'Displays a server\'s member-count at the top of the member-list, can be styled with the #MemberCount selector.';
	}

	/**
	 * @returns {HTMLElement}
	 */
	get settingsPanel() {
		const panel = $('<form>').addClass('form').css('width', '100%');
		if (this.initialized) this.generate(panel);
		return panel[0];
	}
};

/*@end@*/
