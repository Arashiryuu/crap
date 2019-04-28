//META{"name":"KillXD","displayName":"KillXD","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/KillXD/KillXD.plugin.js"}*//

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

var KillXD = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'KillXD',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '2.0.0',
			description: 'Replaces XDs in messages.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/KillXD/KillXD.plugin.js'
		},
		changelog: [
			{
				title: 'What\'s New?',
				type: 'added',
				items: ['Moved to local library version.', 'Now patches into message rendering to alter message text.']
			}
		]
	};
	
	const log = function() {
		/**
		 * @type {Array}
		 */
		const args = Array.prototype.slice.call(arguments);
		args.unshift(`%c[${config.info.name}]`, 'color: #3A71C1; font-weight: 700;');
		return console.log.apply(this, args);
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, SettingField, RadioGroup, Textbox, Switch } = Settings;
		const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');
		
		const messagesWrapper = WebpackModules.getByProps('messages', 'messagesWrapper');
		
		return class KillXD extends Plugin {
			constructor() {
				super();
				this._css;
				this.patchFunctions = {
					async patchMessages() {
						const { component: Message } = await ReactComponents.getComponentByName('Messages', `.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);

						Patcher.after(Message.prototype, 'render', (that, args, value) => {
							const children = this.getProps(value, 'props.children.1.props.children');
							if (!children || !Array.isArray(children)) return value;

							outer: for (const child of children) {
								const propChildren = this.getProps(child, 'props.children');
								if (!propChildren) continue outer;
								const messages = this.getProps(propChildren, 'props.messages');
								if (!messages || !messages.length) continue outer;
								inner: for (const m of messages) {
									if (!Array.isArray(m.contentParsed)) continue inner;
									m.contentParsed = m.contentParsed.map((msg) => {
										if (typeof msg !== 'string') {
											if (msg.type === 'code') {
												const i = this.getProps(msg, 'props.children');
												if (!i) return msg;
												if (!Array.isArray(i)) return (msg.props.children = i.replace(this.regex, 'I\'m a retard lol.')), msg;
											} else if (msg.type === 'pre') {
												const i = this.getProps(msg, 'props.children.props.children');
												if (!i) return msg;
												if (!Array.isArray(i)) return (msg.props.children.props.children = i.replace(this.regex, 'I\'m a retard lol.'), msg);
											}
											return msg;
										}
										const matches = msg.match(this.regex);
										if (!matches || !matches.length) return msg;
										return msg.replace(this.regex, 'I\'m a retard lol.');
									});
								}
							}

							return value;
						});

						this.updateMessages();
					}
				};
				this.bindPatches();
				this.regex = /\bX(D){1,}\b/igm;
			}

			/* Methods */

			onStart() {
				this.patchAll();
				Toasts.info(`${config.info.name} ${config.info.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				Patcher.unpatchAll();
				Toasts.info(`${config.info.name} ${config.info.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			bindPatches() {
				for (const fn of Object.keys(this.patchFunctions)) this.patchFunctions[fn] = this.patchFunctions[fn].bind(this);
			}

			patchAll() {
				const patches = Object.values(this.patchFunctions);
				if (!patches.length) return;
				for (const patch of patches) patch();
			}

			updateMessages() {
				const messages = document.querySelector(`.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);
				if (messages) ReactTools.getOwnerInstance(messages).forceUpdate();
			}

			/* Utility */

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

				for (let i = 0, len = config.info.name.length; i < len; i++) {
					const char = config.info.name[i];
					if (char === char.toUpperCase()) string += char;
				}

				return string;
			}
		};
	};

	/* Finalize */

	return !global.ZeresPluginLibrary 
		? class {
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
				const title = 'Library Missing';
				const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
				const TextElement = BdApi.findModuleByProps('Sizes', 'Weights');
				const ConfirmationModal = BdApi.findModule((m) => m.defaultProps && m.key && m.key() === 'confirm-modal');
				if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
				ModalStack.push(function(props) {
					return BdApi.React.createElement(ConfirmationModal, Object.assign({
						header: title,
						children: [
							TextElement({
								color: TextElement.Colors.PRIMARY,
								children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
							})
						],
						red: false,
						confirmText: 'Download Now',
						cancelText: 'Cancel',
						onConfirm: () => {
							require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
								if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
								await new Promise(r => require('fs').writeFile(require('path').join(ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
							});
						}
					}, props));
				});
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

/*@end@*/
