/**
 * @name HideServersChannelsRedux
 * @author Arashiryuu
 * @version 1.1.12
 * @description Adds buttons to the header for hiding the servers list and channels list.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js
 */

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
	/* global BdApi */

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
			version: '1.1.12',
			description: 'Adds buttons to the header for hiding the servers list and channels list.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: [
					'Working again.'
				]
			}
			// {
			// 	title: 'Maintenance!',
			// 	type: 'improved',
			// 	items: [
			// 		'Inverted button highlights to match member list button.',
			// 		'Moved plugin added buttons\' positions.'
			// 	]
			// }
		]
	};
	
	const log = function () {
		const parts = [
			`%c[${config.info.name}]%c \u2014 %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];
		console.group.apply(null, parts);
		console.log.apply(null, arguments);
		console.groupEnd();
	};

	const error = function () {
		const parts = [
			`%c[${config.info.name}]%c \u2014 %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];
		console.group.apply(null, parts);
		console.error.apply(null, arguments);
		console.groupEnd();
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, DOMTools, Settings, ReactTools, DiscordModules, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, Switch } = Settings;

		const has = Object.prototype.hasOwnProperty;
		const Header = WebpackModules.getByDisplayName('HeaderBarContainer');
		const TooltipWrapper = WebpackModules.getByPrototypes('renderTooltip');
		const icons = WebpackModules.getByProps('iconWrapper', 'clickable');
		const guilds = WebpackModules.getByProps('wrapper', 'unreadMentionsIndicatorTop');
		const channelBase = WebpackModules.getByProps('base', 'container', 'sidebar');
		const headerClasses = WebpackModules.getByProps('title', 'container', 'children', 'themed');

		const buttonStates = {
			channels: {
				active: true
			},
			guilds: {
				active: true
			}
		};

		const ServerButton = class ServerButton extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}

			onClick(e) {
				if (this.props.onClick) this.props.onClick(e);
			}

			render() {
				const active = buttonStates.guilds.active
					? icons.selected
					: '';
				return DiscordModules.React.createElement(TooltipWrapper, {
					color: TooltipWrapper.Colors.PRIMARY,
					position: TooltipWrapper.Positions.BOTTOM,
					text: 'Toggle Servers',
					children: (props) => DiscordModules.React.createElement('div', Object.assign({
						tabindex: 0,
						className: `${icons.iconWrapper} ${icons.clickable} ${active}`.trim(),
						role: 'button'
					}, props), 
						DiscordModules.React.createElement('svg', {
							name: 'ServerButton',
							className: icons.icon,
							onClick: this.onClick,
							width: 24,
							height: 24,
							viewBox: '-2 -2 28 28',
							fill: 'none'
						},
							DiscordModules.React.createElement('path', {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							}),
							DiscordModules.React.createElement('path', {
								d: 'M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
								fill: 'currentColor',
								fillRule: 'evenodd',
								clipRule: 'evenodd'
							})
						)
					)
				});
			}
		};

		const ChannelButton = class ChannelButton extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}

			onClick(e) {
				if (this.props.onClick) this.props.onClick(e);
			}

			render() {
				const active = buttonStates.channels.active
					? icons.selected
					: '';
				return DiscordModules.React.createElement(TooltipWrapper, {
					color: TooltipWrapper.Colors.PRIMARY,
					position: TooltipWrapper.Positions.BOTTOM,
					text: 'Toggle Channels',
					children: (props) => DiscordModules.React.createElement('div', Object.assign({
						tabindex: 0,
						className: `${icons.iconWrapper} ${icons.clickable} ${active}`.trim(),
						role: 'button'
					}, props),
						DiscordModules.React.createElement('svg', {
							name: 'ChannelButton',
							className: icons.icon,
							onClick: this.onClick,
							width: 24,
							height: 24,
							viewBox: '2 2 20 20',
							fill: 'none'
						},
							DiscordModules.React.createElement('path', {
								d: 'M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z',
								fill: 'currentColor',
								fillRule: 'evenodd',
								clipRule: 'evenodd'
							}),
							DiscordModules.React.createElement('path', {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							})
						)
					)
				});
			}
		};
		
		return class HideServersChannelsRedux extends Plugin {
			constructor() {
				super();
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = { keybinds: false, animations: true };
				this.settings = null;
				this._css;
				this.keyFns = {
					c: () => this.onChannelButtonClick(),
					g: () => this.onServerButtonClick()
				};
				this.animationCSS = `
					@keyframes close {
						to {
							width: 0;
						}
					}

					@keyframes close-guild {
						to {
							left: 0;
						}
					}

					@keyframes open {
						from {
							width: 0;
						}
					}

					@keyframes open-guild {
						from {
							left: 0;
						}
					}
				`;
				this.css = `
					.bd-minimal ._closed,
					._closed {
						visibility: hidden;
						width: 0;
						pointer-events: none;
					}

					.closing-guild {
						animation: close-guild 400ms linear;
					}

					.closing {
						animation: close 400ms linear;
					}

					.opening-guild {
						animation: open-guild 400ms linear;
					}

					.opening {
						animation: open 400ms linear;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.promises.restore();
				this.settings = this.loadSettings(this.default);
				this.handleCSS();
				this.patchHeader(this.promises.state);
				this.handleKeybinds();
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				this.promises.cancel();
				Patcher.unpatchAll();
				this.updateHeader();
				this.removeKeybinds();
				PluginUtilities.removeStyle(this.short);
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			handleCSS() {
				const css = this.settings.animations
					? [this.css.trim(), this.animationCSS.trim()].join('\n')
					: this.css;
				const sheet = document.getElementById(this.short);
				if (sheet) sheet.remove();
				PluginUtilities.addStyle(this.short, css);
			}

			removeKeybinds() {
				DOMTools.off(document, `keyup.${this.short}`);
			}

			handleKeybinds() {
				this.removeKeybinds();
				if (this.settings.keybinds) DOMTools.on(document, `keyup.${this.short}`, (e) => this.onKeyup(e));
			}

			onKeyup({ altKey, ctrlKey, key }) {
				const k = key.toLowerCase();
				
				if (!altKey || ctrlKey || !has.call(this.keyFns, k)) return;

				this.keyFns[k]();
			}

			isNotClosed(el) {
				return !DOMTools.hasClass(el, '_closed');
			}

			closeElement(el, guilds, base) {
				if (!this.settings.animations && guilds && base) {
					// base.style.setProperty('left', '0');
					return DOMTools.addClass(el, '_closed');
				} else if (guilds && base) {
					DOMTools.addClass(base, 'closing-guild');
					return setTimeout(() => {
						DOMTools.addClass(el, '_closed');
						// base.style.setProperty('left', '0');
						DOMTools.removeClass(base, 'closing-guild');
					}, 400);
				} else if (this.settings.animations && !guilds && !base) {
					DOMTools.addClass(el, 'closing');
					return setTimeout(() => {
						DOMTools.addClass(el, '_closed');
						DOMTools.removeClass(el, 'closing');
					}, 400);
				}
				DOMTools.addClass(el, '_closed');
			}

			openElement(el, guilds, base) {
				// if (guilds && base) base.style.setProperty('left', '0');
				if (!this.settings.animations && guilds && base) {
					// base.style.setProperty('left', '0');
					return DOMTools.removeClass(el, '_closed');
				} else if (guilds && base) {
					DOMTools.addClass(base, 'opening-guild');
					el.style.setProperty('width', '0');
					return setTimeout(() => {
						el.style.setProperty('width', '');
						DOMTools.removeClass(base, 'opening-guild');
						DOMTools.removeClass(el, '_closed');
					}, 400);
				}
				el.style.width = '0';
				DOMTools.replaceClass(el, '_closed', 'opening');
				el.style.width = '';
				setTimeout(() => DOMTools.removeClass(el, 'opening'), 400);
			}

			onServerButtonClick() {
				const [iconClass] = icons.icon.split(' ');
				const [guildsWrapper] = guilds.wrapper.split(' ');
				const button = document.querySelector(`.${iconClass}[name="ServerButton"]`);
				const element = document.querySelector(`.${guildsWrapper}`);
				const channelsBase = document.querySelector(`.${channelBase.base.split(' ')[0]}`);
				
				if (!button) return;

				buttonStates.guilds.active = !buttonStates.guilds.active;

				DOMTools.toggleClass(button.parentElement, icons.selected);

				if (this.isNotClosed(element)) return this.closeElement(element, true, channelsBase);

				this.openElement(element, true, channelsBase);
			}
			
			onChannelButtonClick() {
				const [iconClass] = icons.icon.split(' ');
				const button = document.querySelector(`.${iconClass}[name="ChannelButton"]`);
				const element = document.querySelector(`.${channelBase.sidebar.split(' ')[0]}`);
				
				if (!button) return;

				buttonStates.channels.active = !buttonStates.channels.active;

				DOMTools.toggleClass(button.parentElement, icons.selected);

				if (this.isNotClosed(element)) return this.closeElement(element);

				this.openElement(element);
			}

			patchHeader(state) {
				if (state.cancelled || !Header) return;

				Patcher.after(Header.prototype, 'render', (that, args, value) => {
					const children = this.getProps(value, 'props.toolbar.props.children.0');
					if (!children || !Array.isArray(children)) return value;

					const S = DiscordModules.React.createElement(ServerButton, { key: 'servers', onClick: (e) => this.onServerButtonClick(e) });
					const C = DiscordModules.React.createElement(ChannelButton, { key: 'channels', onClick: (e) => this.onChannelButtonClick(e) });
					const fn = (key) => (item) => item && item.key && item.key === key;

					if (!children.some(fn('servers')) && !children.some(fn('channels'))) children.splice(3, 0, S, C);

					return value;
				});

				this.updateHeader();
			}

			updateHeader() {
				const head = document.querySelector(`.${headerClasses.container}.${headerClasses.themed}`);
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
					new SettingGroup('Plugin Settings', { shown: true }).append(
						new Switch('Enable Keybinds', 'Guilds: Alt + G. Channels: Alt + C.', this.settings.keybinds, (i) => {
							this.settings.keybinds = i;
							this.handleKeybinds();
						}),
						new Switch('Use Animations', 'Whether or not to use the opening/closing animations.', this.settings.animations, (i) => {
							this.settings.animations = i;
							this.handleCSS();
						})
					)
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
		};
	};

	/* Finalize */

	return !global.ZeresPluginLibrary 
		? class {
			constructor() {
				this._config = config;
			}

			getName() {
				return config.info.name.replace(/\s+/g, '');
			}

			getAuthor() {
				return config.info.authors.map((author) => author.name).join(', ');
			}

			getVersion() {
				return config.info.version;
			}

			getDescription() {
				return config.info.description;
			}

			stop() {
				log('Stopped!');
			}

			load() {
				const { BdApi, BdApi: { React } } = window;
				const title = 'Library Missing';
				const TextElement = BdApi.findModuleByDisplayName('Text');
				const children = [];
				if (!TextElement) {
					children.push(
						React.createElement('span', {
							children: [`The library plugin needed for ${config.info.name} is missing.`]
						}),
						React.createElement('br', {}),
						React.createElement('a', {
							target: '_blank',
							href: 'https://betterdiscord.app/Download?id=9',
							children: ['Click here to download the library!']
						})
					);
					return BdApi.alert(title, React.createElement('span', { children }));
				}
				children.push(
					React.createElement(TextElement, {
						color: TextElement.Colors.STANDARD,
						children: [`The library plugin needed for ${config.info.name} is missing.`]
					}),
					React.createElement('br', {}),
					React.createElement('a', {
						target: '_blank',
						href: 'https://betterdiscord.app/Download?id=9',
						children: ['Click here to download the library!']
					})
				);
				try {
					BdApi.showConfirmationModal(title, [
						React.createElement(TextElement, {
							color: TextElement.Colors.STANDARD,
							children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
						})
					], {
						danger: false,
						confirmText: 'Download Now',
						cancelText: 'Cancel',
						onConfirm: () => {
							require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
								if (error) return require('electron').shell.openExternal('https://betterdiscord.app/Download?id=9');
								await new Promise((r) => require('fs').writeFile(require('path').join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
							});
						}
					});
				} catch (e) {
					error(e);
					BdApi.alert(title, children);
				}
			}

			start() {
				log('Started!');
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get short() {
				let string = '';

				for (let i = 0, len = config.info.name.length; i < len; i++) {
					const char = config.info.name[i];
					if (char === char.toUpperCase()) string += char;
				}

				return string;
			}
		}
		: buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
})();

module.exports = HideServersChannelsRedux;

/*@end@*/
