//META{"name":"TitleForTitlebar","displayName":"TitleForTitlebar","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/TitleForTitlebar/TitleForTitlebar.plugin.js"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject('WScript.Shell');
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
	} else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec('explorer ' + pathPlugins);
		shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
	}
	WScript.Quit();

@else@*/

var TitleForTitlebar = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'TitleForTitlebar',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.9',
			description: 'Adds a title to the titlebar, dynamically changes as needed.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/TitleForTitlebar/TitleForTitlebar.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: ['Hide channel name opt-in works again.']
			}
		]
	};

	/* Utility */

	const log = function() {
		/**
		 * @type {Array}
		 */
		const args = Array.prototype.slice.call(arguments);
		args.unshift(`%c[${config.info.name}]`, 'color: #3A71C1; font-weight: 700;');
		return console.log.apply(this, args);
	};

	const err = function() {
		/**
		 * @type {Array}
		 */
		const args = Array.prototype.slice.call(arguments);
		args.unshift(`%c[${config.info.name}]`, 'color: #3A71C1; font-weight: 700;');
		return console.error.apply(this, args);
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Settings, DOMTools, DiscordModules, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { titleBar } = WebpackModules.getByProps('titleBar');
		const { children } = WebpackModules.getByProps('children', 'container', 'clickable', 'title');
		const { topic, expandable } = WebpackModules.getByProps('topic', 'expandable');
		
		return class TitleForTitlebar extends Plugin {
			constructor() {
				super();
				this.default = { hideChannelName: true };
				this.settings = Object.assign({}, this.default);
				this.getChannel;
				this.activeChannel;
				this.titlePrefix;
				this.titleText;
				this.target;
				this.title;
				this._css;
				this._optCSS;
				this.css = process.platform === 'win32'
					? `
					.typeWindows-1za-n7 {
						justify-content: center;
					}

					#TitleForTitlebar {
						color: #EEE;
						font-size: 13pt;
						font-family: 'Inconsolata', sans-serif;
						text-transform: capitalize;
						align-self: center;
					}

					.winButton-iRh8-Z {
						position: absolute;
						top: 0;
					}

					.typeWindows-1za-n7 .winButton-iRh8-Z:nth-child(2) {
						right: 0;
					}

					.typeWindows-1za-n7 .winButton-iRh8-Z + .winButton-iRh8-Z {
						right: 45px;
					}

					.typeWindows-1za-n7 .winButton-iRh8-Z + .winButton-iRh8-Z + .winButton-iRh8-Z {
						right: 90px;
					}
				`
					: `
					#TitleForTitlebar {
						position: absolute;
						top: 0;
						left: 26vw;
						color: #EEE;
						font-size: 13pt;
						font-family: 'Inconsolata', sans-serif;
						text-transform: capitalize;
					}
				`;
				this.optInCSS = `
					#app-mount ${DiscordSelectors.TitleWrap.chat.value.trim()} ${DiscordSelectors.TitleWrap.title.value.trim()} > .${children.replace(/\s+/g, '.')} > :not([class="${topic} ${expandable}"]) {
						visibility: hidden;
					}
				`;
				this.switchList = [
					WebpackModules.getByProps('app').app.split(' ')[0],
					DiscordSelectors.TitleWrap.chat.value.split('.')[1],
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper.split(' ')[0],
					WebpackModules.getByProps('chatContent').chatContent.split(' ')[0]
				];
			}

			/* Methods */

			onStart() {
				const { ChannelStore: { getChannel }, SelectedChannelStore: { getChannelId } } = DiscordModules;

				this.getChannel = getChannel;
				this.activeChannel = getChannelId;
				this.target = document.querySelector(`.${titleBar.replace(/\s/g, '.')}`);

				this.appendStyle();
				this.appendTitle();
				this.manageTitle();

				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				this.removeStyle();
				this.removeTitle();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			appendStyle() {
				const e = DOMTools.parseHTML(`<link href="https://fonts.googleapis.com/css?family=Roboto|Inconsolata" rel="preload stylesheet" as="font" crossorigin/>`);
				DOMTools.appendTo(e, document.head);
				PluginUtilities.addStyle('TitleForTitlebarCSS', !this.settings.hideChannelName ? this.css : this.css + this.optInCSS);
			}

			removeStyle() {
				const links = DOMTools.queryAll('link[href="https://fonts.googleapis.com/css?family=Roboto|Inconsolata"]', document);

				if (links.length) {
					for (const link of links) link.remove();
				}
				
				PluginUtilities.removeStyle('TitleForTitlebarCSS');
			}

			removeTitle() {
				if (document.contains(this.title)) this.title.remove();
			}

			handleTitle() {
				if (!document.contains(this.title)) this.appendTitle();
			}

			appendTitle() {
				this.title = document.createElement('span');
				this.title.id = 'TitleForTitlebar';
				this.title.textContent = 'Initialised';

				try {
					this.target.appendChild(this.title);
				} catch(r) {
					err(r);
				}

				return this.title;
			}

			manageTitle() {
				this.handleTitle();
				const curr = this.getChannel(this.activeChannel());
				this.title.textContent = this.getTitle(curr);
			}

			getTitle(channel) {
				if (!channel) return;

				let users = [];
				const { name, type, recipients } = channel;

				if (recipients && recipients.length) {
					const len = recipients.length;
					for (let i = 0; i < len; i++) users.push(DiscordModules.UserStore.getUser(recipients[i]).username);
				}

				const user = !name ? users.join(', ') : name;
				this.titleText = user;
				/**
				 * Channel Types:
				 * 0 - Guild Channel
				 * 1 - DM
				 * 2 - Voice Channel
				 * 3 - Group DM
				 * 4 - Categories
				 * 5 - Guild Channel - News
				 * 6 - Guild Channel - Store
				 */
				switch (type) {
					case 1:
						this.titlePrefix = '[DM]';
					break;
					case 3:
						this.titlePrefix = '[Group DM]';
					break;
					case 5:
						this.titlePrefix = '[News Channel]';
					break;
					case 6:
						this.titlePrefix = '[Store Channel]';
					break;
					default:
						this.titlePrefix = '[Guild Channel]';
					break;
				}

				return `${this.titlePrefix} ${this.titleText}`;
			}

			setTitle(prefix = '', name = '') {
				this.handleTitle();
				this.title.textContent = `${prefix} ${name}`;
			}

			/* Observer */

			observer({ addedNodes, removedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
					this.manageTitle();
				} else if (addedNodes.length && addedNodes[0].className && addedNodes[0].className.includes && addedNodes[0].className.includes('container-3gCOGc')) {
					this.setTitle('[UI]', 'Friends');
				} else if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('layer-3QrUeG')) {
					setTimeout(() => {
						const sidebar = document.getElementById('bd-settings-sidebar');
						if (!sidebar) this.setTitle('[UI]', 'Server Settings');
						else this.setTitle('[UI]', 'User Settings');
					}, 250);
				} else if (removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('layer-3QrUeG')) {
					const friends = document.querySelector('.container-3gCOGc');
					if (friends) this.setTitle('[UI]', 'Friends');
					else this.manageTitle();
				}
			}

			/* Settings Panel */

			getSettingsPanel() {
				return Settings.SettingPanel.build(() => this.saveSettings(this.settings),
					new Settings.SettingGroup('Plugin Settings').append(
						new Settings.Switch('Hide Channel Name', 'Default is enabled; hides the channel-name in the header.', this.settings.hideChannelName, (i) => {
							this.settings.hideChannelName = i;
							this.removeStyle();
							this.appendStyle();
						})
					)
				);
			}

			/* Setters */

			set css(style = '') {
				return this._css = style.split(/\s+/g).join(' ').trim();
			}

			set optInCSS(style = '') {
				return this._optCSS = style.split(/\s+/g).join(' ').trim();
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}
			
			get css() {
				return this._css;
			}

			get optInCSS() {
				return this._optCSS;
			}

			get name() {
				return config.info.name;
			}

			get short() {
				return config.info.name.split('').filter((char) => char === char.toUpperCase()).join('');
			}

			get author() {
				return config.info.authors.map((author) => author.name).join(', ');
			}

			get version() {
				return config.info.version;
			}

			get description() {
				return config.info.description;
			}
		};
	};

	/* Finalize */

	return !global.ZeresPluginLibrary 
		? class {
			getName() {
				return this.name.replace(/\s+/g, '');
			}

			getAuthor() {
				return this.author;
			}

			getVersion() {
				return this.version;
			}

			getDescription() {
				return this.description;
			}

			stop() {
				log('Stopped!');
			}

			load() {
				window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
			}

			start() {
				log('Started!');
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get name() {
				return config.info.name;
			}

			get short() {
				let string = '';

				for (let i = 0, len = config.info.name.length; i < len; i++) {
					const char = config.info.name[i];
					if (char === char.toUpperCase()) string += char;
				}

				return string;
			}

			get author() {
				return config.info.authors.map((author) => author.name).join(', ');
			}

			get version() {
				return config.info.version;
			}

			get description() {
				return config.info.description;
			}
		}
		: buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
})();

/*@end@*/
