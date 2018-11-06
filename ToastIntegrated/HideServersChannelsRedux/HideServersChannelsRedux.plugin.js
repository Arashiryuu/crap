//META{"name":"HideServersChannelsRedux","displayName":"HideServersChannelsRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js"}*//

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

var HideServersChannelsRedux = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'HideServersChannelsRedux',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.5',
			description: 'Adds buttons to the header for hiding the servers list and channels list.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Evolving?',
				type: 'improved',
				items: ['Now uses the local library of ZeresPluginLibrary.']
			},
			{
				title: 'What\'s New?',
				type: 'added',
				items: ['Compatibility with the normalized classes option of BBD\'s Bandages settings.']
			}
		]
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, DOMTools, Settings, ReactTools, DiscordModules, WebpackModules, DiscordSelectors } = Api;
		const { SettingPanel, Switch } = Settings;
		const TooltipWrapper = WebpackModules.getByPrototypes('showDelayed');

		const icons = WebpackModules.getByProps('iconMargin');

		const ServerButton = class ServerButton extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}

			onClick(e) {
				if (this.props.onClick) this.props.onClick(e);
			}

			render() {
				return DiscordModules.React.createElement(TooltipWrapper, {
					color: 'black',
					position: 'bottom',
					text: 'Toggle Servers'
				},
					DiscordModules.React.createElement('svg', {
						name: 'ServerButton',
						className: `${icons.iconInactive} ${icons.iconMargin}`,
						onClick: this.onClick,
						width: 24,
						height: 24,
						viewBox: '-2 -2 28 28',
						fill: '#FFF'
					},
						DiscordModules.React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' }),
						DiscordModules.React.createElement('path', { d: 'M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' })
					)
				);
			}
		}

		const ChannelButton = class ChannelButton extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}

			onClick(e) {
				if (this.props.onClick) this.props.onClick(e);
			}

			render() {
				return DiscordModules.React.createElement(TooltipWrapper, {
					color: 'black',
					position: 'bottom',
					text: 'Toggle Channels'
				},
					DiscordModules.React.createElement('svg', {
						name: 'ChannelButton',
						className: `${icons.iconInactive} ${icons.iconMargin}`,
						onClick: this.onClick,
						width: 24,
						height: 24,
						viewBox: '2 2 20 20',
						fill: '#FFF'
					},
						DiscordModules.React.createElement('path', { d: 'M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z' }),
						DiscordModules.React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' })
					)
				);
			}
		}
		
		return class HideServersChannelsRedux extends Plugin {
			constructor() {
				super();
				this.default = { keybinds: false };
				this.settings = Object.assign({}, this.default);
				this._css;
				this.switchList = [
					'app',
					DiscordSelectors.TitleWrap.chat.value.slice(2),
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper
				];
				this.keys = ['c', 'g'];
				this.keyFns = {
					c: () => this.onChannelButtonClick(),
					g: () => this.onServerButtonClick()
				};
				this.css = `
					._closed {
						display: none;
					}

					.closing {
						animation: close 400ms linear;
					}

					.opening {
						animation: open 400ms linear;
					}

					/* Animations */

					@keyframes close {
						to {
							width: 0;
						}
					}

					@keyframes open {
						from {
							width: 0;
						}
					}
				`;
			}

			/* Methods */

			onStart() {
				this.loadSettings(this.settings);
				BdApi.injectCSS(this.short, this.css);
				this.patchHeader();
				this.handleKeybinds();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				Patcher.unpatchAll();
				this.updateHeader();
				this.removeKeybinds();
				BdApi.clearCSS(this.short);
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			removeKeybinds() {
				DOMTools.off(document, `keyup.${this.short}`);
			}

			handleKeybinds() {
				this.removeKeybinds();
				if (this.settings.keybinds) DOMTools.on(document, `keyup.${this.short}`, (e) => this.onKeyup(e));
			}

			onKeyup({ altKey, ctrlKey, key }) {
				key = key.toLowerCase();
				
				if (!altKey || ctrlKey || !this.keys.includes(key)) return;

				this.keyFns[key]();
			}

			isNotClosed(el) {
				return !DOMTools.hasClass(el, '_closed');
			}

			closeElement(el) {
				DOMTools.addClass(el, 'closing');
				setTimeout(() => {
					DOMTools.addClass(el, '_closed');
					DOMTools.removeClass(el, 'closing');
				}, 400);
			}

			openElement(el) {
				el.style.width = '0';
				DOMTools.removeClass(el, '_closed');
				DOMTools.addClass(el, 'opening');
				el.style.width = '';
				setTimeout(() => DOMTools.removeClass(el, 'opening'), 400);
			}

			onServerButtonClick() {
				const iconClass = icons.icon.split(' ').join('.');
				const guildsWrapper = WebpackModules.getByProps('guildsWrapper').guildsWrapper.split(' ').join('.');
				const button = document.querySelector(`.${iconClass}[name="ServerButton"]`);
				const element = document.querySelector(`.${guildsWrapper}`);
				
				if (!button) return;

				const [inactive] = icons.iconInactive.split(' ');
				const [active] = icons.iconActive.split(' ');

				DOMTools.toggleClass(button, inactive);
				DOMTools.toggleClass(button, active);

				if (this.isNotClosed(element)) return this.closeElement(element);

				this.openElement(element);
			}
			
			onChannelButtonClick() {
				const iconClass = icons.icon.split(' ').join('.');
				const button = document.querySelector(`.${iconClass}[name="ChannelButton"]`);
				const element = document.querySelector(DiscordSelectors.ChannelList.channels.value.trim());
				
				if (!button) return;

				const [inactive] = icons.iconInactive.split(' ');
				const [active] = icons.iconActive.split(' ');

				DOMTools.toggleClass(button, inactive);
				DOMTools.toggleClass(button, active);

				if (this.isNotClosed(element)) return this.closeElement(element);

				this.openElement(element);
			}

			async patchHeader() {
				const Header = await new Promise((resolve) => {
					const head = document.querySelector(DiscordSelectors.TitleWrap.title.value.trim());
					if (head) return resolve(ReactTools.getOwnerInstance(head).constructor);

					const header = WebpackModules.getModule((m) => m.hasOwnProperty('Icon') && m.hasOwnProperty('Title'));
					if (header) resolve(header);
				});

				Patcher.after(Header.prototype, 'render', (that, args, value) => {
					const children = this.getProps(value, 'props.children.3.props.children.0');

					if (!children || !Array.isArray(children)) return value;

					const S = DiscordModules.React.createElement(ServerButton, { key: 'servers', onClick: (e) => this.onServerButtonClick(e) });
					const C = DiscordModules.React.createElement(ChannelButton, { key: 'channels', onClick: (e) => this.onChannelButtonClick(e) });

					children.unshift(S, C);

					return value;
				});

				this.updateHeader();
			}

			updateHeader() {
				const head = document.querySelector(DiscordSelectors.TitleWrap.title.value.trim());
				if (head) ReactTools.getOwnerInstance(head).forceUpdate();
			}

			/**
			 * Function to access properties of an object safely, returns false instead of erroring if the property / properties do not exist.
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 * @param {Object} obj The object we are accessing.
			 * @param {String} path The properties we want to traverse or access.
			 * @returns {*}
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
			}

			/* Settings Panel */

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new Switch('Enable Keybinds', 'Guilds: Alt + G. Channels: Alt + C.', this.settings.keybinds, (i) => {
						this.settings.keybinds = i;
						this.handleKeybinds();
					})
				);
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
	};

	/* Finalize */

	return !global.ZeresPluginLibrary
		? class {
			constructor() {
				this.initialized = false;
			}

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
				Logger.log('Stopped!');
			}

			load() {
				window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js">Click here to download the library!</a>`);
			}

			start() {
				Logger.log('Started!');
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
