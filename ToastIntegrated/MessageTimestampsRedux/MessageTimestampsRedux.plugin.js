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
			version: '1.0.13',
			description: 'Displays the timestamp for a message, simply right-click and select "Show Timestamp."',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MessageTimestampsRedux/MessageTimestampsRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: [
					'Displays in the context-menu again.'
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
		const { Toasts, Logger, Tooltip, Patcher, Settings, Utilities, ReactTools, DOMTools, ContextMenu, DiscordContextMenu, EmulatedTooltip, ReactComponents, DiscordModules, WebpackModules, DiscordClassModules, DiscordClasses, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, RadioGroup, Slider, Switch } = Settings;
		const { React, ReactDOM, ContextMenuActions: MenuActions } = DiscordModules;
		
		const MenuItem = WebpackModules.getByString('disabled', 'danger', 'brand');

		const ErrorBoundary = class ErrorBoundary extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = { hasError: false };
			}

			static getDerivedStateFromError(error) {
				return { hasError: true };
			}

			componentDidCatch(error, info) {
				console.group(`%c[${config.info.name}]`, 'color: #3A71C1; font-weight: 700;');
				console.error(error);
				console.groupEnd();
			}

			render() {
				if (this.state.hasError) return React.createElement('div', { className: 'react-error' }, 'Component Error!');
				return this.props.children;
			}
		};

		const WrapBoundary = (Original) => class Boundary extends React.PureComponent {
			render() {
				return React.createElement(ErrorBoundary, null, React.createElement(Original, this.props));
			}
		};

		const ItemGroup = class ItemGroup extends React.PureComponent {
			constructor(props) {
				super(props);
			}

			render() {
				return React.createElement('div', {
					role: 'group',
					children: this.props.children || []
				});
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
				this.settings = null;
			}

			/* Methods */

			/**
			 * Called when the plugin instance starts.
			 * @returns {Void}
			 */
			onStart() {
				this.promises.restore();
				this.settings = this.loadSettings(this.default);
				// this.getContextMenu(this.promises.state).catch(this.didError);
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
				const ContextMenu = await ReactComponents.getComponent('MessageContextMenu', DiscordSelectors.ContextMenu.value.trim(), (n) => {
					return n.displayName && n.displayName === 'MessageContextMenu';
				});
				if (promiseState.cancelled) return;
				log(ContextMenu);
				// this.patchContextMenu(ContextMenu);
			}

			/**
			 * Patches the render of the MessageContextMenu react component which is passed to it.
			 * @param {ReactComponent} ContextMenu
			 * @returns {Void}
			 */
			patchContextMenu(ContextMenu) {
				if (!ContextMenu) return;

				const key = 'MessageTimestampsRedux-GroupItem';
				Patcher.after(ContextMenu, 'default', (that, args, value) => {
					const [props] = args;
					if (!props.message) return value;
					
					const { message, target } = props, children = this.getProps(value, 'props.children');

					if (!Array.isArray(children)) return value;

					const item = new MenuItem({
						label: 'Show Timestamp',
						action: () => this.action(message, target)
					});

					const group = React.createElement(WrapBoundary(ItemGroup), {
						children: [item],
						key
					});

					const fn = (item) => item && item.key && item.key === key;
					if (!children.find(fn)) children.unshift(group);
					
					setImmediate(() => this.updateContextPosition(that));

					return value;
				});

				return PluginUtilities.forceUpdateContextMenus();
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
			 * @param {object} message 
			 * @param {ReactComponent} that
			 * @returns {void}
			 */
			showTooltip(message, target) {
				if (!target) return Toasts.error('Unable to find the message.', { timeout: 2e3 });

				/**
				 * @type {String}
				 */
				const ts = String(this.getProps(message, 'timestamp._d'));
				const time = !this.settings.shortened
					? ts
					: ts.split(' ').slice(0, 5).join(' ');
				const tip = new EmulatedTooltip(target, time, { side: 'top', disabled: true });

				tip.show();
				setTimeout(() => tip.hide(), this.settings.displayTime);
			}

			/**
			 * Displays a toast notification of the clicked message's timestamp.
			 * @param {object} message 
			 * @param {ReactComponent} that
			 * @returns {void}
			 */
			showTimestamp(message, target) {
				if (!message) return;
				/**
				 * @type {String}
				 */
				const ts = String(this.getProps(message, 'timestamp._d'));

				if (!this.settings.shortened) Toasts.show(ts, { timeout: this.settings.displayTime });
				else Toasts.show(ts.split(' ').slice(0, 5).join(' '), { timeout: this.settings.displayTime });
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
			updateContextPosition(m) {
				if (!m) return;
	
				let height = this.getProps(m, 'props.onHeightUpdate');
				if (!height) height = this.getProps(m, '_reactInternalFiber.return.memoizedProps.onHeightUpdate');
				if (!height) height = this.getProps(m, '_reactInternalFiber.child.child.memoizedProps.onHeightUpdate');
	
				height && height();
			}

			addContextMenuItem(menu, instance, owner, props) {
				const { message, target } = props;
				const group = new ContextMenu.ItemGroup();
				const item = new ContextMenu.TextItem('Show Timestamp', { callback: () => this.action(message, target) });
				const elements = item.getElement();
				group.getElement().setAttribute('role', 'group');
				elements.classList.add(
					...DiscordClasses.ContextMenu.labelContainer.value.split(' '),
					...DiscordClasses.ContextMenu.colorDefault.value.split(' ')
				);
				elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
				group.addItems(item);
				menu.querySelector('div[role="group"]').insertAdjacentElement('afterend', group.getElement());
				setImmediate(() => this.updateContextPosition(owner));
			}

			action(message, target) {
				MenuActions.closeContextMenu();
				!this.settings.tooltips ? this.showTimestamp(message, target) : this.showTooltip(message, target);
			}

			processContextMenu(cm) {
				if (!cm) return;
				const inst = ReactTools.getReactInstance(cm);
				const own = ReactTools.getOwnerInstance(cm);
				const props = this.getProps(inst, 'return.memoizedProps');
				if (!own || !props.navId || props.navId !== 'message') return;
				const ref = own.props.children({ position: own.props.reference() }, own.updatePosition);
				this.addContextMenuItem(cm, inst, own, ref.props);
			}

			/* Observer */
			observer({ addedNodes }) {
				for (const node of addedNodes.values()) {
					if (!node) continue;
					if (node.firstChild && node.firstChild.className && typeof node.firstChild.className === 'string' && node.firstChild.className.split(' ')[0] === DiscordClasses.ContextMenu.menu.value.split(' ')[0]) {
						this.processContextMenu(node.firstChild);
					}
				}
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

module.exports = MessageTimestampsRedux;
