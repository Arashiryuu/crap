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

	if (!global.ZLibrary && !global.ZLibraryPromise) global.ZLibraryPromise = new Promise((resolve, reject) => {
		require('request').get({ url: 'https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js', timeout: 1e4 }, (err, res, body) => {
			if (err || res.statusCode !== 200) return reject(err || res.statusMessage);
			try {
				const { Script } = require('vm'), script = new Script(body, { displayErrors: true });
				resolve(script.runInThisContext());
			} catch(err) {
				reject(err);
			}
		});
	});

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
			version: '1.0.0',
			description: 'Adds buttons to the header for hiding the servers list and channels list.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Upgrades',
				type: 'improved',
				items: ['Now renders alongside the natural elements via React!']
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
		const { Toasts, Patcher, DOMTools, ReactTools, DiscordModules, WebpackModules, DiscordSelectors } = Api;
		const TooltipWrapper = WebpackModules.getByPrototypes('showDelayed');

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
						className: 'iconInactive-g2AXfB icon-1R19_H iconMargin-2YXk4F',
						onClick: this.onClick,
						width: 24,
						height: 24,
						viewBox: '-2 -2 28 28'
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
						className: 'iconInactive-g2AXfB icon-1R19_H iconMargin-2YXk4F',
						onClick: this.onClick,
						width: 24,
						height: 24,
						viewBox: '2 2 20 20'
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
				this._css;
				this.switchList = [
					'app',
					DiscordSelectors.TitleWrap.chat.value.slice(2),
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper
				];
				this.css = `
					.icon-1R19_H[name="ServerButton"], .icon-1R19_H[name="ChannelButton"] {
						fill: #FFF;
					}
				`;
			}

			/* Methods */

			onStart() {
				BdApi.injectCSS(this.short, this.css);
				this.patchHeader();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				Patcher.unpatchAll();
				this.updateHeader();
				BdApi.clearCSS(this.short);
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			onServerButtonClick() {
				const button = document.querySelector('.icon-1R19_H[name="ServerButton"]');
				const element = document.querySelector('.' + WebpackModules.getByProps('guildsWrapper').guildsWrapper);
				
				if (button) {
					DOMTools.toggleClass(button, 'iconInactive-g2AXfB');
					DOMTools.toggleClass(button, 'iconActive-AKd_jq')
				}

				element.style.display = element.style.display === 'none' ? '' : 'none';
			}
			
			onChannelButtonClick() {
				const button = document.querySelector('.icon-1R19_H[name="ChannelButton"]');
				const element = document.querySelector(DiscordSelectors.ChannelList.channels.value.trim());
				
				if (button) {
					DOMTools.toggleClass(button, 'iconInactive-g2AXfB');
					DOMTools.toggleClass(button, 'iconActive-AKd_jq')
				}

				element.style.display = element.style.display === 'none' ? '' : 'none';
			}

			async patchHeader() {
				const Header = await new Promise((resolve) => {
					const head = document.querySelector(DiscordSelectors.TitleWrap.title.value.trim());
					if (head) return resolve(ReactTools.getOwnerInstance(head).constructor);

					const header = WebpackModules.getModule((m) => m.hasOwnProperty('Icon') && m.hasOwnProperty('Title'));
					if (header) resolve(header);
				});

				Patcher.after(Header.prototype, 'render', (that, args, value) => {
					const children = this.getProps(value, 'props.children.2.props.children.0');

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
			 * @name safelyGetNestedProp
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
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

	return !global.ZLibrary 
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

			showAlert() {
				window.mainCore.alert('Loading Error', 'Something went wrong trying to load the library for the plugin. Try reloading?');
			}

			stop() {
				log('Stopped!');
			}

			async load() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				const { Script } = require('vm'), plugin = buildPlugin(global.ZLibrary.buildPlugin(config));
				try {
					new Script(plugin, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.name,
						file: `${this.name}.plugin.js`,
						reason: 'Plugin could not be compiled.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				global[this.name] = plugin;
				try {
					new Script(`new global["${this.name}"]();`, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.name,
						file: `${this.name}.plugin.js`,
						reason: 'Plugin could not be constructed.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				bdplugins[this.name].plugin = new global[this.name]();
				bdplugins[this.name].plugin.load();
			}

			async start() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				bdplugins[this.name].plugin.start();
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
		: buildPlugin(global.ZLibrary.buildPlugin(config));
})();

/*@end@*/
