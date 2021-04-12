/**
 * @name ChatUserIDsRedux
 * @author Arashiryuu
 * @version 1.0.20
 * @description Adds a user's ID next to their name in chat, makes accessing a user ID simpler. Double-click to copy the ID.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/ChatUserIDsRedux/ChatUserIDsRedux.plugin.js
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
			version: '1.0.20',
			description: 'Adds a user\'s ID next to their name in chat, makes accessing a user ID simpler. Double-click to copy the ID.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/ChatUserIDsRedux/ChatUserIDsRedux.plugin.js'
		},
		changelog: [
			{
				// title: 'Bugs Squashed!',
				// type: 'fixed',
				// items: ['Works again.']
				title: 'Evolving?',
				type: 'improved',
				items: ['Re-enabled hover tooltip setting. We\'re back using React.']
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
		const { SettingPanel, SettingGroup, ColorPicker, RadioGroup, Switch } = Settings;
		const { React, ReactDOM } = DiscordModules;

		const queryStrings = ['ANIMATE_CHAT_AVATAR', 'showUsernamePopout'];
		const MessageHeader = WebpackModules.find((mod) => {
			if (!mod || !mod.default) return false;
			let s = '';
			try {
				s = mod.default.toString([]);
			} catch (e) {
				s = JSON.stringify(mod.default);
			}
			return queryStrings.every((n) => s.includes(n));
		});

		const has = Object.prototype.hasOwnProperty;
		const MessageClasses = {
			...WebpackModules.getByProps('message', 'groupStart'),
			...WebpackModules.getByProps('compact', 'cozy', 'username')
		};

		const TextElement = WebpackModules.getByDisplayName('Text');
		// const MessageHeader = WebpackModules.getByProps('MessageTimestamp');
		const TooltipWrapper = WebpackModules.getByPrototypes('renderTooltip');

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

		const ErrorBoundary = class ErrorBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { hasError: false };
			}

			static getDerivedStateFromError(error) {
				return { hasError: true };
			}

			componentDidCatch(error, info) {
				err(error);
			}

			render() {
				if (this.state.hasError) return React.createElement('div', {
					className: `${config.info.name}-error`,
					children: [
						React.createElement(TextElement, {
							color: TextElement.Colors.ERROR,
							children: [
								`${config.info.name} Component Error!`
							]
						})
					]
				});
				return this.props.children;
			}
		};

		const WrapBoundary = (Original) => class Boundary extends React.Component {
			render() {
				return React.createElement(ErrorBoundary, null, React.createElement(Original, this.props));
			}
		};

		const Tag = class Tag extends React.Component {
			constructor(props) {
				super(props);
				this.onDoubleClick = this.onDoubleClick.bind(this);
			}

			static getClasses(instance) {
				return Array.isArray(instance.props.classes)
					? instance.props.classes
					: [];
			}

			static getRenderProps(instance, classes) {
				return {
					className: instance.props.hover
						? `tooltip-wrapper ${classes.join(' ')}`.trim()
						: classes.join(' ').trim(),
					children: [
						React.createElement('span', {
							className: 'tag',
							onDoubleClick: instance.onDoubleClick
						}, instance.props.id)
					]
				};
			}

			static getRenderElement(instance, props, classes) {
				const renderProps = Tag.getRenderProps(instance, classes);
				return instance.props.hover
					? React.createElement('span', Object.assign(renderProps, props))
					: React.createElement('span', renderProps);
			}

			onDoubleClick(e) {
				if (this.props.onDoubleClick) this.props.onDoubleClick(e);
			}

			render() {
				const classes = Tag.getClasses(this);
				if (!classes.includes('tagID')) classes.unshift('tagID');
				return React.createElement(TooltipWrapper, {
					position: TooltipWrapper.Positions.TOP,
					color: TooltipWrapper.Colors.BLACK,
					text: this.props.text,
					children: (props) => Tag.getRenderElement(this, props, classes)
				});
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
					tagPosition: 0,
					hoverTip: false
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
						width: fit-content;
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

					#app-mount :-webkit-any(.tooltip-2QfLtc, .bd-tooltip, .toolbar-2bjZV7, .bubble-3we2d) {
						white-space: break-spaces;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.settings = this.loadSettings(this.default);
				this.reinjectCSS();
				this.promises.restore();
				this.patchMessages(this.promises.state);
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				PluginUtilities.removeStyle(this.short);
				this.promises.cancel();
				// this.clearTags();
				Patcher.unpatchAll();
				this.updateMessages();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			onHeader() {
				const headers = document.querySelectorAll(`.${MessageClasses.header.split(' ')[0]}`);
				if (!headers.length) return;
				for (const header of headers) this.processNode(header);
			}

			patchMessages(state) {
				if (state.cancelled || !MessageHeader) return;
				Patcher.after(MessageHeader, 'default', (that, [props], value) => {
					const { message: { id, author }, subscribeToGroupId } = props;
					if (id !== subscribeToGroupId) return value;

					const children = this.getProps(value, 'props.children.1.props.children');
					if (!children || !Array.isArray(children)) return value;

					const { extraClass, pos } = this.getPos(this.settings);
					const date = author.createdAt.toString().replace(/\([\w\d].+\)/g, '').split(' ');
					const gmt = date.pop();
					const tag = React.createElement(WrapBoundary(Tag), {
						id: author.id,
						key: `ChatUserID-${author.id}`,
						text: `${date.join(' ').trim()}\n${gmt.trim()}`,
						hover: this.settings.hoverTip,
						classes: [extraClass],
						onDoubleClick: (e) => this.double(e, author)
					});

					const fn = (child) => child && child.key && child.key.startsWith('ChatUserID');
					if (!children.find(fn)) children.splice(pos === 'beforebegin' ? 0 : 2, 0, tag);
					
					return value;
				});
				this.updateMessages();
			}

			updateMessages() {
				const messages = document.querySelectorAll(`.${MessageClasses.message}`);
				if (!messages.length) return;
				for (let i = 0, len = messages.length; i < len; i++) ReactTools.getOwnerInstance(messages[i]).forceUpdate();
			}

			reinjectCSS() {
				PluginUtilities.removeStyle(this.short);
				PluginUtilities.addStyle(this.short, this.css.replace(/{color}/, this.settings.color));
			}

			async double(e, author) {
				try {
					await window.navigator.clipboard.writeText(author.id);
					Toasts.info('Successfully copied!', { timeout: 2e3 });
				} catch(error) {
					err(error);
					Toasts.error('Failed to copy! See console for error(s)!', { timeout: 2e3 });
				}
				if (e.target) e.target.blur();
				setImmediate(() => window.getSelection().removeAllRanges());
			}

			createTag(id) {
				const div = DOMTools.parseHTML(`<span class="tagID">${id}</span>`);
				return div;
			}

			processNode(node) {
				if (node.querySelector('.tagID')) return;
				const instance = ReactTools.getReactInstance(node);
				if (!instance) return;
				const props = this.getProps(instance, 'memoizedProps.children.1.props.children.props.children.0.props');
				if (!props || !this.getProps(props, 'message')) return;
				const { message: { author } } = props;
				const tag = this.createTag(author.id);
				const username = node.querySelector(`.${MessageClasses.username.split(' ')[0]}`);
				DOMTools.on(tag, `dblclick.${this.short}`, (e) => this.double(e, author));
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
			// observer({ addedNodes }) {
			// 	if (!addedNodes || !addedNodes.length) return;
			// 	this.onHeader();
			// }

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
							// this.clearTags();
							// this.onHeader();
							this.updateMessages();
						}),
						new Switch('Hover Tooltip', 'Decides whether or not the account creation date tooltip is displayed.', this.settings.hoverTip, (i) => {
							this.settings.hoverTip = i;
							this.updateMessages();
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
				const { BdApi, BdApi: { React } } = window;
				const title = 'Library Missing';
				const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
				const TextElement = BdApi.findModuleByDisplayName('Text');
				const ConfirmationModal = BdApi.findModule((m) => m.defaultProps && m.key && m.key() === 'confirm-modal');
				const children = [];
				if (!TextElement) {
					children.push(
						React.createElement('span', {
							children: [`The library plugin needed for ${config.info.name} is missing.`]
						}),
						React.createElement('br', {}),
						React.createElement('a', {
							target: '_blank',
							href: 'https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js',
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
						href: 'https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js',
						children: ['Click here to download the library!']
					})
				);
				if (!ModalStack || !ConfirmationModal) return BdApi.alert(title, children);
				ModalStack.push(function(props) {
					return React.createElement(ConfirmationModal, Object.assign({
						header: title,
						children: [
							React.createElement(TextElement, {
								color: TextElement.Colors.STANDARD,
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

module.exports = ChatUserIDsRedux;

/*@end@*/
