//META{"name":"HideServersChannels"}*//

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

class HideServersChannels {
	constructor() {
		this.initialized = false;
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		$('.HideServers, .HideChannels').remove();
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		let libraryScript = document.getElementById('zeresLibraryScript');
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

		this.inject();
		this.initialized = true;

		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
	}

	inject() {
		const toolbar = $('div[class^="titleText"] ~ div[class^="flex"]');
		if(!toolbar[0] || toolbar.find('.HideServers, .HideChannels').length > 0) return false;
		toolbar.prepend('<svg class="iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9 HideServers" name="HideServers" width="24" height="24" viewBox="-2 -2 28 28" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path class="iconForeground-2c7s3m" d="M0 0h24v24H0z" fill="none"/><path class="ServerPath" d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>');

		const serverButton = $('.HideServers');
		serverButton.after('<svg class="iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9 HideChannels" name="HideChannels" width="24" height="24" viewBox="2 2 20 20" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path class="ChannelPath" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/><path class="iconForeground-2c7s3m" d="M0 0h24v24H0z" fill="none"/></svg>');

		const channelButton = $('.HideChannels');
		const tooltips = $('.tooltips');

		const serverTooltip = $('<div/>', { id: 'HideServersChannelsTooltip', class: 'tooltip tooltip-bottom tooltip-black', text: 'Toggle Servers' });
		const channelTooltip = $('<div/>', { id: 'HideServersChannelsTooltip', class: 'tooltip tooltip-bottom tooltip-black', text: 'Toggle Channels' });

		serverButton.on('click.HSCT', this.constructor.click.bind(this));
		channelButton.on('click.HSCT', this.constructor.click.bind(this));

		serverButton.on('mouseenter.HSCT', () => {
			const rect = serverButton[0].getBoundingClientRect();
			setTimeout(() => {
				const center = (rect.left + (rect.width / 2)) - (serverTooltip.outerWidth() / 2);
				serverTooltip.attr('style', `left: ${center}px; top: ${rect.top + rect.height}px; white-space: nowrap;`);
			}, 10);
			serverTooltip.attr('style', `left: -1000vw; top: -1000vh;`);
			tooltips.append(serverTooltip);
		});
		channelButton.on('mouseenter.HSCT', () => {
			const rect = channelButton[0].getBoundingClientRect();
			setTimeout(() => {
				const center = (rect.left + (rect.width / 2)) - (channelTooltip.outerWidth() / 2);
				channelTooltip.attr('style', `left: ${center}px; top: ${rect.top + rect.height}px; white-space: nowrap;`);
			}, 10);
			channelTooltip.attr('style', `left: -1000vw; top: -1000vh;`);
			tooltips.append(channelTooltip);
		});

		serverButton.on('mouseleave.HSCT', () => {
			$('#HideServersChannelsTooltip').remove();
		});
		channelButton.on('mouseleave.HSCT', () => {
			$('#HideServersChannelsTooltip').remove();
		});

		return true;
	}

	static click(e) {
		const clicked = e.target;
		const serverButton = document.querySelector('.HideServers');
		const channelButton = document.querySelector('.HideChannels');

		if(!serverButton || !channelButton) return;

		if(clicked === serverButton || clicked.parentNode === serverButton) {
			const $elem = $('.HideServers');
			const $toggle = $('.guilds-wrapper');
			let $classList = $('.HideServers').attr('class');
	
			$toggle.toggle();
	
			const $display = $toggle.css('display');
	
			if($display === 'none') {
				$classList = $classList.replace('iconInactive-WWHQEI', 'iconActive-3K4uxh');
				$elem.attr('class', $classList);
			} else {
				$classList = $classList.replace('iconActive-3K4uxh', 'iconInactive-WWHQEI');
				$elem.attr('class', $classList);
			}
		}
		else if(clicked === channelButton || clicked.parentNode === channelButton) {
			const $elem = $('.HideChannels');
			const $toggle = $('.channels-3g2vYe');
			let $classList = $('.HideChannels').attr('class');
	
			$toggle.toggle();
	
			const $display = $toggle.css('display');
	
			if($display === 'none') {
				$classList = $classList.replace('iconInactive-WWHQEI', 'iconActive-3K4uxh');
				$elem.attr('class', $classList);
			} else {
				$classList = $classList.replace('iconActive-3K4uxh', 'iconInactive-WWHQEI');
				$elem.attr('class', $classList);
			}
		}
	}

	observer({ addedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && (addedNodes[0].classList.contains('app') || (addedNodes[0].id && addedNodes[0].id.toLowerCase() === 'friends') || addedNodes[0].classList.contains('chat'))) {
			this.inject();
		}
	}

	log(text, ...extra) {
		if(!extra.length)
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text);
		else
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text, ...extra);
	}

	err(error, ...errors) {
		if(typeof error === 'string' && !errors.length)
			return console.error(`[%c${this.getName()}%c] ${error}`, 'color: #59F;', '');
		else
			return console.error(`[%c${this.getName()}%c] `, 'color: #59F;', '', error, ...errors);
	}

	get downLink() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.getName()}/${this.getName()}.plugin.js`;
	}

	getName() {
		return 'Hide Servers and Channels';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.0';
	}

	getDescription() {
		return 'Adds a button for hiding the servers list, and a button for hiding the channels list.';
	}
};

/*@end@*/
