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
			version: '1.0.16',
			description: 'Adds a user\'s ID next to their name in chat, makes accessing a user ID simpler. Double-click to copy the ID.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/ChatUserIDsRedux/ChatUserIDsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: ['Loads settings again!']
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
		const { Toasts, Logger, Patcher, Settings, Utilities, ReactTools, DOMTools, DiscordModules, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, ColorPicker, RadioGroup } = Settings;
		const { React, ReactDOM } = DiscordModules;

		const has = Object.prototype.hasOwnProperty;
		const MessageClasses = {
			...WebpackModules.getByProps('message', 'groupStart'),
			...WebpackModules.getByProps('compact', 'cozy', 'username')
		};

		const MessageHeader = WebpackModules.getModule((m) => m && m.default && m.default.displayName && m.default.displayName === 'MessageHeader');

		const options = [
			{
				name: 'Before',
				desc: 'Place the tag before the username.',
				value: 0
			},
			{
				name: 'After',
				desc: 'Place the tag after the username.',
				value: 1
			}
		];

		const Tag = class Tag extends React.Component {
			constructor(props) {
				super(props);
				this.onDoubleClick = this.onDoubleClick.bind(this);
			}

			onDoubleClick(e) {
				if (this.props.onDoubleClick) this.props.onDoubleClick(e);
			}

			render() {
				const classes = Array.isArray(this.props.classes)
					? this.props.classes
					: [];
				classes.unshift('tagID');
				return React.createElement('span', {
					className: classes.join(' '),
					onDoubleClick: this.onDoubleClick
				}, this.props.text);
			}
		};
		
		return class ChatUserIDsRedux extends Plugin {
			constructor() {
				super();
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = {
					colors: [
						0x798AED,
						0x263239,
						0xC792EA, 0xF95479, 0xFFCB6B, 0x82AAFF,
						0x99DDF3, 0x718184, 0xF78C6A, 0xC3E88D
					],
					color: '#798AED',
					tagPosition: 0
				};
				this.settings = null;
				this._css;
				this.css = `
					@import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';
				
					.tagID {
						font-size: 10px;
						letter-spacing: 0.025rem;
						position: relative;
						top: 3px;
						height: 9px;
						line-height: 10px;
						text-shadow: 0 1px 3px black;
						background: {color};
						border-radius: 3px;
						font-weight: 500;
						padding: 3px 5px;
						color: #FFF;
						font-family: 'Roboto', 'Inconsolata', 'Whitney', sans-serif;
					}

					.tagID.before {
						margin-left: -4px;
						margin-right: 6px;
					}

					.tagID.after {
						margin-left: 4px;
						margin-right: 4px;
					}
		
					.${MessageClasses.groupStart.split(' ')[0]}.${MessageClasses.cozy.split(' ')[0]} h2.${MessageClasses.header.split(' ')[0]} {
						display: flex;
						position: relative;
					}

					.${MessageClasses.compact.split(' ')[0]} .tagID {
						padding: 2px 3px;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.settings = this.loadSettings(this.default);
				this.reinjectCSS();
				this.promises.restore();
				// this.patchMessages();
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				PluginUtilities.removeStyle(this.short);
				this.promises.cancel();
				this.clearTags();
				// Patcher.unpatchAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			patchMessages() {
				if (this.promises.state.cancelled) return;
				Patcher.after(MessageHeader, 'default', (that, args, value) => {
					const [{ message: { author } }] = args;
					const { props } = value;
					if (!props.children || !Array.isArray(props.children)) return value;
					const { extraClass, pos } = this.getPos(this.settings);
					const tag = React.createElement(Tag, {
						text: author.id,
						classes: [extraClass],
						onDoubleClick: (e) => this.double(e)
					});
					props.children.splice(pos + 2, 0, tag);
					return value;
				});
			}

			reinjectCSS() {
				PluginUtilities.removeStyle(this.short);
				PluginUtilities.addStyle(this.short, this.css.replace(/{color}/, this.settings.color));
			}

			double(e) {
				try {
					document.execCommand('copy');
					Toasts.info('Successfully copied!', { timeout: 2e3 });
					window.getSelection().removeAllRanges();
				} catch(err) {
					err(err);
					Toasts.error('Failed to copy! See console for error(s)!', { timeout: 2e3 });
				}
			}

			createTag(id) {
				const div = DOMTools.parseHTML(`<span class="tagID">${id}</span>`);
				return div;
			}

			processNode(node) {
				if (node.querySelector('.tagID')) return;
				const instance = ReactTools.getReactInstance(node);
				if (!instance) return;
				const props = this.getProps(instance, 'memoizedProps.children.0.props.children.1.props');
				if (!props || !this.getProps(props, 'message')) return;
				const { message: { author } } = props;
				const tag = this.createTag(author.id);
				const username = node.querySelector(`.${MessageClasses.username.split(' ')[0]}`);
				DOMTools.on(tag, `dblclick.${this.short}`, (e) => this.double(e));
				const { extraClass, pos } = this.getPos(this.settings);
				tag.classList.add(extraClass);
				username.insertAdjacentElement(pos, tag);
			}

			getPos(settings) {
				const value = !settings.tagPosition;
				return {
					extraClass: value
						? 'before'
						: 'after',
					pos: value 
						? 'beforebegin'
						: 'afterend'
				};
			}

			removeTag(node) {
				if (!node || !node.querySelector('.tagID')) return;
				const target = node.querySelector('.tagID');
				target.remove();
			}

			clearTags() {
				for (const node of document.querySelectorAll(`.${MessageClasses.groupStart.split(' ')[0]}`)) this.removeTag(node);
			}

			/**
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((obj, prop) => obj && obj[prop], obj);
			}

			/* Observer */
			observer({ addedNodes }) {
				for (const node of addedNodes.values()) {
					if (!node) continue;
					if (node.classList && node.classList.contains(MessageClasses.groupStart.split(' ')[0])) this.processNode(node);
				}
			}

			/* onSwitch */
			onSwitch() {
				for (const node of document.querySelectorAll(`.${MessageClasses.groupStart.split(' ')[0]}`)) this.processNode(node);
			}

			/* Settings Panel */

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new ColorPicker('ID Background Color', 'Determines what color the background for the IDs will be.', this.default.color, (i) => {
							this.settings.color = i;
							this.reinjectCSS();
						}, { colors: this.settings.colors }),
						new RadioGroup('Tag Placement', 'Decides whether the tag is placed before the username, or after it.', this.settings.tagPosition || 0, options, (i) => {
							this.settings.tagPosition = i;
							this.clearTags();
							this.onSwitch();
						})
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
				const title = 'Library Missing';
				const ModalStack = window.BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
				const TextElement = window.BdApi.findModuleByProps('Sizes', 'Weights');
				const ConfirmationModal = window.BdApi.findModule((m) => m.defaultProps && m.key && m.key() === 'confirm-modal');
				if (!ModalStack || !ConfirmationModal || !TextElement) return window.BdApi.getCore().alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
				ModalStack.push(function(props) {
					return window.BdApi.React.createElement(ConfirmationModal, Object.assign({
						header: title,
						children: [
							window.BdApi.React.createElement(TextElement, {
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
								await new Promise(r => require('fs').writeFile(require('path').join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
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
