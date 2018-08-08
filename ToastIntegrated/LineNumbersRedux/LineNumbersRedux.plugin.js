//META{"name":"LineNumbersRedux","displayName":"LineNumbersRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/LineNumbersRedux/LineNumbersRedux.plugin.js"}*//

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

class LineNumbersRedux {
	constructor() {
		this.initialized = false;
		this.default = { ignoreNoLanguage: true, noStyle: false };
		this.settings = Object.assign({}, this.default);
		this.switchList = ['app', 'chat-3bRxxu', 'messagesWrapper-3lZDfY'];
		this.messageList = ['container-1YxwTf', 'message-1PNnaP'];
		this._css;
		this.css = `
			.hljs ol {
				list-style: none;
				counter-reset: linenumbers;
			}

			.hljs ol li {
				text-indent: -4ch;
				margin-left: 3.5ch;
				padding-left: 0.5ch;
				border-left: 1px solid rgba(0, 0, 0, 0.2);
			}

			.theme-dark .hljs ol li::before {
				color: rgba(127, 127, 127, 0.5);
			}

			.theme-light .hljs ol li::before {
				color: rgba(150, 150, 150, 0.5);
			}

			.hljs ol li::before {
				display: inline-block;
				width: 3ch;
				margin-right: 0.5ch;
				padding-right: 0.5ch;
				text-align: right;
				counter-increment: linenumbers;
				content: counter(linenumbers);
				-webkit-user-select: none;
				user-select: none;
			}
		`;
		this.mo = new MutationObserver((changes) => {
			for (const change of changes) {
				if (change.addedNodes.length) {
					for (const node of change.addedNodes.values()) {
						if (node.classList && this.messageList.includes(node.classList[node.classList.length - 1])) this.processCodeblocks();
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
	getSettingsPanel() { return this.settingsPanel; }

	/* Required Methods - Main */

	load() {
		this.log('Loaded');
	}

	stop() {
		this.handleCSS();
		this.unprocessCodeblocks();
		this.disconnect();
		PluginUtilities.showToast(`${this.name} ${this.version} has stopped.`, { type: 'info', icon: true, timeout: 2e3 });
	}

	start() {
		this.log('Started');
		let libraryScript = document.getElementById('zeresLibraryScript');
		
		if (!libraryScript) {
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		} else if (libraryScript && libraryScript.isOutdated) {
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
		PluginUtilities.loadSettings(this.name, this.settings);

		this.handleCSS();
		this.processCodeblocks();
		this.observe();
		this.initialized = true;

		PluginUtilities.showToast(`${this.name} ${this.version} has started.`, { type: 'info', icon: true, timeout: 2e3 });
	}

	disconnect() {
		this.mo.disconnect();
	}

	observe() {
		const app = document.querySelector('.app');
		if (!app) return;
		this.mo.observe(app, { childList: true, subtree: true });
	}

	wrap(parent, wrapper) {
		if (typeof wrapper === 'string') wrapper = document.createElement(wrapper);
		parent.appendChild(wrapper);
		while (parent.firstChild !== wrapper) wrapper.appendChild(parent.firstChild);
	}

	unwrap(wrapper) {
		const parent = wrapper.parentElement;
		while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
		parent.removeChild(wrapper);
	}

	mapLine(line) {
		const commentMarkers = ['/*', '*'];
		if (commentMarkers.includes(line.trim()[0])) {
			return `<li class="hljs-comment">${line}</li>`;
		} else {
			return `<li>${line}</li>`;
		}
	}

	hasOl(codeblock) {
		return !!codeblock.querySelector('ol');
	}

	noOl(codeblock) {
		return !codeblock.querySelector('ol');
	}

	addLines(codeblock) {
		codeblock.innerHTML = codeblock.innerHTML.split('\n').map((char) => this.mapLine(char)).join('');
		return codeblock;
	}

	codeblockFilter(codeblock) {
		return !(this.settings.ignoreNoLanguage && codeblock.className.endsWith('hljs'));
	}

	processCodeblocks() {
		const codeblocks = Array.from(document.querySelectorAll('.hljs')), filtered = codeblocks.filter((cb) => this.noOl(cb)).filter((cb) => this.codeblockFilter(cb));
		for (let i = 0, len = filtered.length; i < len; i++) {
			const ol = document.createElement('ol');
			ol.setAttribute('class', 'LineNumbers');
			this.wrap(this.addLines(filtered[i]), ol);
		}
	}

	unprocessCodeblocks() {
		const codeblocks = Array.from(document.querySelectorAll('.hljs')), filtered = codeblocks.filter((cb) => this.hasOl(cb));
		for (let i = 0, len = filtered.length; i < len; i++) {
			const ol = filtered[i].querySelector('ol');
			if (ol) this.unwrap(ol);
		}
	}

	handleCSS() {
		BdApi.clearCSS('LineNumbersCSS');
		if (!this.settings.noStyle) BdApi.injectCSS('LineNumbersCSS', this.css);
	}

	/* Observer */

	observer({ addedNodes }) {
		if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
			this.disconnect();
			this.observe();
			this.processCodeblocks();
		}
	}

	/* Utility */

	log(...e) {
		return console.log(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...e);
	}

	err(...e) {
		return console.error(`%c[${this.name}]`, 'color: #59F; font-weight: 700;', ...e);
	}

	revertSettings() {
		for (const key in this.default) {
			this.settings[key] = this.default[key];
		}
	}

	/* Settings Panel */

	generate(panel) {
		new PluginSettings.ControlGroup('Plugin Settings', () => PluginUtilities.saveSettings(this.name, this.settings)).appendTo(panel).append(
			new PluginSettings.PillButton('Ignore No-Language', 'Ignores codeblocks with no language specified.', 'Off', 'On', this.settings.ignoreNoLanguage, (i) => {
				this.settings.ignoreNoLanguage = i;
				this.processCodeblocks();
			}),
			new PluginSettings.PillButton('No Style', 'Doesn\'t add style rules, leaving it up to themes or customcss.', 'Off', 'On', this.settings.noStyle, (i) => {
				this.settings.noStyle = i;
				this.handleCSS();
			})
		);

		const resetButton = $('<button>', {
			type: 'button',
			text: 'Reset To Default',
			style: 'float: right;'
		}).on('click.reset', () => {
			this.revertSettings();
			PluginUtilities.saveSettings(this.name, this.settings);
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
		return this.name.split('').filter((char) => char === char.toUpperCase()).join('');
	}

	get link() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.name}/${this.name}.plugin.js`;
	}

	get name() {
		return 'LineNumbersRedux';
	}

	get author() {
		return 'Arashiryuu';
	}

	get version() {
		return '1.0.3';
	}

	get description() {
		return 'Adds line numbers to codeblocks.';
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
