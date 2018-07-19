//META{"name":"ChatUserIDsRedux","displayName":"ChatUserIDsRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/ChatUserIDsRedux/ChatUserIDsRedux.plugin.js"}*//

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

var ChatUserIDsRedux = (() => {

	/* Setup */

	if (!global.ZLibrary && !global.ZLibraryPromise) global.ZLibraryPromise = new Promise((resolve, reject) => {
		require('request').get({ url: 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/ZLibrary.js', timeout: 1e4 }, (err, res, body) => { // https://zackrauen.com/BetterDiscordApp/ZLibrary.js | https://rauenzi.github.io/BetterDiscordAddons/Plugins/ZLibrary.js
			if (err || res.statusCode !== 200) reject(err || res.statusMessage);
			try {
				const vm = require('vm'), script = new vm.Script(body, { displayErrors: true });
				resolve(script.runInThisContext());
			} catch(err) {
				reject(err);
			}
		});
	});

	const config = {
		main: 'index.js',
		info: {
			name: 'ChatUserIDsRedux',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.3',
			description: 'Adds a user\'s ID next to their name in chat, makes accessing a user ID simpler. Double-click to copy the ID.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/ChatUserIDsRedux/ChatUserIDsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'What\'s New',
				type: 'added',
				items: ['Compatibility with Quoter plugin.']
			},
			{
				title: 'Bugs Squashed',
				type: 'fixed',
				items: ['Adapted to internal restructuring.']
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
		const { Toasts, Logger, Patcher, Settings, ReactTools, DiscordModules, WebpackModules } = Api;

		const ID = class ID extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onDoubleClick = this.onDoubleClick.bind(this);
			}

			onDoubleClick(e) {
				if (this.props.onDoubleClick) this.props.onDoubleClick(e);
			}

			render() {
				return DiscordModules.React.createElement('span', { className: 'tagID', onDoubleClick: this.onDoubleClick }, this.props.id);
			}
		}
		
		return class ChatUserIDsRedux extends Plugin {
			constructor() {
				super();
				this.default = {
					colors: [
						0x798AED,
						0x263239,
						0xC792EA, 0xF95479, 0xFFCB6B, 0x82AAFF,
						0x99DDF3, 0x718184, 0xF78C6A, 0xC3E88D
					],
					color: '#798AED'
				};
				this.settings = Object.assign({}, this.default);
				this._css;
				this.css = `
					@import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';
				
					.tagID {
						font-size: 10px;
						letter-spacing: 0.025rem;
						position: relative;
						top: 0;
						height: 9px;
						margin-left: -4px;
						margin-right: 6px;
						text-shadow: 0 1px 3px black;
						background: {color};
						border-radius: 3px;
						font-weight: 500;
						padding: 3px 5px;
						color: #FFF;
						font-family: 'Roboto', 'Inconsolata', 'Whitney', sans-serif;
					}
		
					.message-group:not(.compact) h2 {
						display: flex;
						position: relative;
					}
					
					.message-group .comment .message.first ~ div > .edit-message .edit-container-inner .old-h2 {
						display: none;
					}

					.message-group.compact .markup .tagID {
						order: 0;
					}
		
					.message-group.compact .markup .timestamp {
						order: 1;
						width: 35px;
					}
		
					.message-group.compact .markup .username-wrapper {
						order: 2;
						display: initial;
					}
		
					.message-group.compact .markup .message-content {
						order: 3;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.loadSettings(this.settings);
				this.reinjectCSS();
				this.patchMessages();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				BdApi.clearCSS(this.short);
				this.updateMessages();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
				Patcher.unpatchAll();
			}

			reinjectCSS() {
				BdApi.clearCSS(this.short);
				BdApi.injectCSS(this.short, this.css.replace(/{color}/, this.settings.color));
			}

			double(e) {
				try {
					document.execCommand('copy');
					Toasts.info('Successfully copied!', { icon: true, timeout: 2e3 });
				} catch(e) {
					err(e);
					Toasts.error('Failed to copy! See console for error(s)!', { icon: true, timeout: 2e3 });
				}
			}

			/**
			 * @name patchMessageComponent
			 * @author Zerebos
			 */
			async patchMessages() {
				const Message = await new Promise((resolve) => {
					const message = document.querySelector('.message');
					if (message) return resolve(ReactTools.getOwnerInstance(message).constructor);

					const MessageGroup = WebpackModules.find((m) => m.defaultProps && m.defaultProps.renderReactions);
					const unpatch = Patcher.after(MessageGroup.prototype, 'componentDidMount', (that) => {
						const elem = DiscordModules.ReactDOM.findDOMNode(that);
						if (!elem) return;
						unpatch();
						const msg = elem.querySelector('.message');
						resolve(ReactTools.getOwnerInstance(msg).constructor);
					});
				});

				Patcher.after(Message.prototype, 'render', (that, args, value) => {
					const props = this.getProps(value, '_owner.return.memoizedProps');

					if (!props.first || props.message.type !== 0) return value;

					const children = this.getProps(value, 
						!props.compact
							? 'props.children.0.props.children.0.props.children'
							: window.pluginCookie['Quoter']
								? 'props.children.0.props.children.2.1.props.children'
								: 'props.children.0.props.children.2.props.children'
					);

					if (!children || !Array.isArray(children)) return value;

					const id = DiscordModules.React.createElement(ID, {
						id: this.getProps(props, 'message.author.id'),
						onDoubleClick: (e) => this.double(e)
					});

					children.unshift(id);

					return value;
				});

				this.updateMessages();
			}

			/**
			 * @name forceUpdateMessages
			 * @author Zerebos
			 */
			updateMessages() {
				const messages = document.querySelectorAll('.message');
				for (let i = 0, len = messages.length; i < len; i++) ReactTools.getOwnerInstance(messages[i]).forceUpdate();
			}

			/**
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((obj, prop) => obj && obj[prop], obj);
			}

			/* Utility */

			revertSettings() {
				for (const key in this.default) this.settings[key] = this.default[key];
			}

			/* Settings Panel */

			getSettingsPanel() {
				return Settings.SettingPanel.build(() => this.saveSettings(this.settings),
					new Settings.SettingGroup('Plugin Settings').append(
						new Settings.ColorPicker('ID Background Color', 'Determines what color the background for the IDs will be.', this.default.color, (i) => {
							this.settings.color = i;
							this.reinjectCSS();
						}, { colors: this.settings.colors })
					)
				);
			}
			
			/* Setters */
			
			set css(styles = '') {
				return this._css = styles.split(/\s+/g).join(' ').trim();
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
				//
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
			showAlert() {
				window.mainCore.alert('Loading Error', 'Something went wrong trying to load the library for the plugin. Try reloading?');
			}
			async load() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				const vm = require('vm'), plugin = buildPlugin(global.ZLibrary.buildPlugin(config));
				try {
					new vm.Script(plugin, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.getName(),
						file: `${this.getName()}.plugin.js`,
						reason: 'Plugin could not be compiled.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				global[this.getName()] = plugin;
				try {
					new vm.Script(`new global["${this.getName()}"]();`, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.getName(),
						file: `${this.getName()}.plugin.js`,
						reason: 'Plugin could not be constructed.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				bdplugins[this.getName()].plugin = new global[this.getName()]();
				bdplugins[this.getName()].plugin.load();
			}
			async start() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				bdplugins[this.getName()].plugin.start();
			}
			stop() {}
			get [Symbol.toStringTag]() {
				return 'Plugin';
			}
		}
		: buildPlugin(global.ZLibrary.buildPlugin(config));
})();
