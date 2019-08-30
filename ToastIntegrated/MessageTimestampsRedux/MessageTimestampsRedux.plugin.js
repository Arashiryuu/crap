//META{"name":"MessageTimestampsRedux","displayName":"MessageTimestampsRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/MessageTimestampsRedux/MessageTimestampsRedux.plugin.js"}*//

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

var MessageTimestampsRedux = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'MessageTimestampsRedux',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.6',
			description: 'Displays the timestamp for a message, simply right-click and select "Show Timestamp."',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MessageTimestampsRedux/MessageTimestampsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'What\'s New?',
				type: 'improved',
				items: ['Now uses the local version of ZeresPluginLibrary.']
			},
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: [
					'Renders in the message context menu again.',
					'Tooltips now available again.',
					'Fix multiple active instances.'
				]
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
		const { Toasts, Logger, Tooltip, Patcher, Settings, Utilities, ReactTools, DOMTools, EmulatedTooltip, ReactComponents, DiscordModules, WebpackModules, DiscordClassModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, RadioGroup, Slider, Switch } = Settings;

		const Item = class Item extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}

			onClick() {
				if (this.props.onClick) this.props.onClick();
			}

			render() {
				return DiscordModules.React.createElement('div', {
					className: DiscordClassModules.ContextMenu.item,
					onClick: this.onClick
				}, 'Show Timestamp');
			}
		};
		
		return class MessageTimestampsRedux extends Plugin {
			constructor() {
				super();
				this._css;
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = {
					tooltips: false,
					shortened: false,
					displayTime: 2000
				};
				this.settings = Utilities.deepclone(this.default);
			}

			/* Methods */

			/**
			 * Called when the plugin instance starts.
			 * @returns {Void}
			 */
			onStart() {
				this.promises.restore();
				this.loadSettings(this.settings);
				this.getContextMenu(this.promises.state).catch((err) => this.didError(err));
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			/**
			 * Called when the plugin instance stops.
			 * @returns {Void}
			 */
			onStop() {
				this.promises.cancel();
				Patcher.unpatchAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			/**
			 * @param {Error} error
			 * @returns {Void}
			 */
			didError(error) {
				Toasts.error(error.message, { timeout: 2e3 });
				Logger.err(error);
			}
			
			/**
			 * Asynchronously gets the MessageContextMenu component as it renders, then patches it.
			 * @returns {Promise<Void>}
			 */
			async getContextMenu(promiseState) {
				const ContextMenu = await ReactComponents.getComponentByName('MessageContextMenu', DiscordSelectors.ContextMenu.contextMenu.toString());
				if (promiseState.cancelled) return;
				this.patchContextMenu(ContextMenu);
			}

			/**
			 * Patches the render of the MessageContextMenu react component which is passed to it.
			 * @param {ReactComponent} ContextMenu
			 * @returns {Void}
			 */
			patchContextMenu(ContextMenu) {
				if (!ContextMenu || !ContextMenu.component) return;

				const { component: Menu } = ContextMenu;

				Patcher.after(Menu.prototype, 'render', (that, args, value) => {
					if (!that.props.message) return value;
					
					const { message } = that.props, children = this.getProps(value, 'props.children');

					if (!Array.isArray(children)) return value;

					const item = DiscordModules.React.createElement(Item, {
						onClick: () => {
							!this.settings.tooltips ? this.showTimestamp(message, that) : this.showTooltip(message, that);
						}
					});

					children.unshift(item);
					
					setImmediate(() => this.updateContextPosition(that));

					return value;
				});

				return ContextMenu.forceUpdateAll();
			}

			/**
			 * Manually hide the context menu on our context menu item being clicked.
			 * @param {HTMLElement} node The context menu element.
			 * @returns {Boolean}
			 */
			hideMenu(node) {
				if (!node) return;

				return Boolean(node.style.display = 'none');
			}

			/**
			 * Displays a tooltip over the message that was right-clicked with its timestamp.
			 * @param {Object} message 
			 * @param {ReactComponent} that
			 * @returns {Boolean}
			 */
			showTooltip(message, that) {
				/**
				 * @type {HTMLElement}
				 */
				const node = DiscordModules.ReactDOM.findDOMNode(that);
				const { target } = that.props;

				if (!node) return Toasts.error('Unable to find the context-menu.', { timeout: 2e3 });
				if (!target) return Toasts.error('Unable to find the message.', { timeout: 2e3 });

				/**
				 * @type {String}
				 */
				const ts = this.getProps(message, 'timestamp._d');
				const tip = new EmulatedTooltip(target, !this.settings.shortened ? String(ts) : String(ts).split(' ').slice(0, 5).join(' '), { side: 'top', disabled: true });

				tip.show();
				setTimeout(() => tip.hide(), this.settings.displayTime);

				return this.hideMenu(node);
			}

			/**
			 * Displays a toast notification of the clicked message's timestamp.
			 * @param {Object} message 
			 * @param {ReactComponent} that
			 * @returns {Boolean}
			 */
			showTimestamp(message, that) {
				if (!message) return;
				/**
				 * @type {String}
				 */
				const ts = this.getProps(message, 'timestamp._d');
				/**
				 * @type {HTMLElement}
				 */
				const node = DiscordModules.ReactDOM.findDOMNode(that);

				if (!node) return Toasts.error('Unable to find the context-menu.', { timeout: 2e3 });

				if (!this.settings.shortened) Toasts.show(ts, { timeout: this.settings.displayTime });
				else Toasts.show(String(ts).split(' ').slice(0, 5).join(' '), { timeout: this.settings.displayTime });

				return this.hideMenu(node);
			}

			/**
			 * Forces the react component for our Context Menu to update.
			 * @returns {Void}
			 */
			updateContextMenu() {
				const menu = document.querySelectorAll(DiscordSelectors.ContextMenu.contextMenu.toString());
				if (!menu.length) return;
				for (let i = 0, len = menu.length; i < len; i++) ReactTools.getOwnerInstance(menu[i]).forceUpdate();
			}

			/**
			 * Uses the component's own onHeightUpdate function to manage screen position after being newly rendered post-patch.
			 * @param {ReactComponent} that The Context Menu's react component.
			 */
			updateContextPosition(that) {
				that.props.onHeightUpdate();
			}

			/**
			 * Safely traverses or accesses an object's properties via the provided path.
			 * @name safelyGetNestedProps
			 * @param {Object} obj
			 * @param {String} path
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
			}

			/* Settings Panel */

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new Switch('Short Timestamps', 'Use shorter timestamps.', this.settings.shortened, (i) => {
							this.settings.shortened = i;
						}),
						new RadioGroup('Display Setting', 'Which method shall be used to display the timestamp.', this.settings.tooltips, [
							{ name: 'Toasts', value: false, desc: 'Displays the timestamps using toasts.' },
							{ name: 'Tooltips', value: true, desc: 'Displays the timestamps using tooltips.' }
						], (i) => {
							this.settings.tooltips = i;
						}),
						new Slider('Timestamp Display Length', 'How long to display the timestamps for. Default is 2000ms which is 2 seconds. Minimum is 1000ms, maximum is 10000ms.', 1000, 10000, this.settings.displayTime, (i) => {
							this.settings.displayTime = i;
						}, {
							markers: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
							stickToMarkers: true
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
