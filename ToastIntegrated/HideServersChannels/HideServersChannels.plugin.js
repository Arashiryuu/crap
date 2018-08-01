//META{"name":"HideServersChannels","displayName":"HideServersChannels","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this diButtonly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me diButtonly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the corButton folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
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

class HideServersChannels {
	constructor() {
		this.initialized = false;
		this.switchList = ['app', 'chat', 'messages-wrapper'];
		this.buttonS;
		this.buttonC;
		this.tipS;
		this.tipC;
	}

	/* Required Methods - Info */

	getName() { return this.name; }
	getAuthor() { return this.author; }
	getVersion() { return this.version; }
	getDescription() { return this.description }

	/* Required Methods - Main */

	load() {
		this.log('Loaded');
	}

	stop() {
		for (const button of [this.buttonS, this.buttonC]) {
			if (document.contains(button[0])) button.remove();
		}
		this.log('Stopped');
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
		}

		if (typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.addEventListener('load', () => this.initialize());
	}

	/* Methods */

	initialize() {
		PluginUtilities.checkForUpdate(this.name, this.version, this.link);

		this.inject();
		this.initialized = true;

		PluginUtilities.showToast(`${this.name} ${this.version} has started.`);
	}

	inject() {
		const toolbar = $('div[class^="titleText"] ~ div[class^="flex"]');
		if (!toolbar[0] || toolbar.find('.HideServers, .HideChannels').length > 0) return false;
		toolbar.prepend('<svg class="iconInactive-g2AXfB icon-1R19_H iconMargin-2YXk4F HideServers" name="HideServers" width="24" height="24" viewBox="-2 -2 28 28" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path class="iconForeground-2c7s3m" d="M0 0h24v24H0z" fill="none"/><path class="ServerPath" d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>');

		this.buttonS = $('.HideServers');
		this.buttonS.after('<svg class="iconInactive-g2AXfB icon-1R19_H iconMargin-2YXk4F HideChannels" name="HideChannels" width="24" height="24" viewBox="2 2 20 20" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path class="ChannelPath" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/><path class="iconForeground-2c7s3m" d="M0 0h24v24H0z" fill="none"/></svg>');

		this.buttonC = $('.HideChannels');

		this.tipS = $('<div/>', { id: 'HideServersChannelsTooltip', class: 'tooltip tooltip-bottom tooltip-black', text: 'Toggle Servers' });
		this.tipC = $('<div/>', { id: 'HideServersChannelsTooltip', class: 'tooltip tooltip-bottom tooltip-black', text: 'Toggle Channels' });

		const tooltips = $('.tooltips');
		const utils = {
			server: {
				button: this.buttonS,
				tooltip: this.tipS
			},
			channels: {
				button: this.buttonC,
				tooltip: this.tipC
			}
		};

		for (const type in utils) {
			const { button, tooltip } = utils[type];
			button.on('click.HSCT', (e) => this.click(e))
			.on('mouseenter.HSCT', () => {
				setTimeout(() => {
					const center = (button.offset().left + (button.outerWidth() / 2)) - (tooltip.outerWidth() / 2);
					tooltip.attr('style', `left: ${center}px; top: ${button.offset().top + button.outerHeight()}px; white-space: nowrap;`);
				}, 10);
				tooltips.append(tooltip);
			})
			.on('mouseleave.HSCT', () => tooltip.remove());
		}

		return true;
	}

	click(e) {
		const clicked = e.target;

		if (!this.buttonS.length || !this.buttonC.length) return;

		const buttons = {
			servers: {
				button: this.buttonS[0],
				$elem: this.buttonS,
				$toggle: $('.guildsWrapper-5TJh6A'),
				$classList: this.buttonS.attr('class')
			},
			channels: {
				button: this.buttonC[0],
				$elem: this.buttonC,
				$toggle: $('.channels-Ie2l6A'),
				$classList: this.buttonC.attr('class')
			}
		};

		for (const buttonType in buttons) {
			const { button, $elem, $toggle } = buttons[buttonType];
			let { $classList } = buttons[buttonType];
			if (clicked === button || clicked.parentNode === button) {
				$toggle.toggle();
				const $display = $toggle.css('display');
				if ($display === 'none') {
					$classList = $classList.replace('iconInactive-g2AXfB', 'iconActive-AKd_jq');
					$elem.attr('class', $classList);
				} else {
					$classList = $classList.replace('iconActive-AKd_jq', 'iconInactive-g2AXfB');
					$elem.attr('class', $classList);
				}
			}
		}
	}

	/* Observer */

	observer({ addedNodes }) {
		if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
			this.inject();
		}
	}

	/* Utility */

	log(...extra) {
		return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', ...extra);
	}

	err(...errors) {
		return console.error(`[%c${this.getName()}%c] `, 'color: #59F;', '', ...errors);
	}

	/* Getters */

	get link() {
		return 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideServersChannels/HideServersChannels.plugin.js';
	}

	get name() {
		return 'Hide Servers and Channels';
	}

	get author() {
		return 'Arashiryuu';
	}

	get version() {
		return '1.0.5';
	}

	get description() {
		return 'Adds a button for hiding the servers list, and a button for hiding the channels list.';
	}
};

/*@end@*/
