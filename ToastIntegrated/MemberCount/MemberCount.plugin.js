/**
 * @name MemberCount
 * @author Arashiryuu
 * @version 2.2.0
 * @description Displays a server's member-count at the top of the member-list, can be styled with the #MemberCount selector.
 * @website https://github.com/Arashiryuu
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/MemberCount/MemberCount.plugin.js
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

var MemberCount = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'MemberCount',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '2.2.0',
			description: 'Displays a server\'s member-count at the top of the member-list, can be styled with the #MemberCount selector.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MemberCount/MemberCount.plugin.js'
		},
		changelog: [
			{
				title: 'Evolving?',
				type: 'improved',
				items: [
					'Improved positioning of the counter in the DOM.',
					'Reworked styling rules.'
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
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ContextMenu, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, SettingField, Textbox, Switch } = Settings;
		const { React, MemberCountStore, SelectedGuildStore, ContextMenuActions: MenuActions } = DiscordModules;

		const has = Object.prototype.hasOwnProperty;
		const Flux = WebpackModules.getByProps('connectStores');
		const MenuItem = WebpackModules.getByString('disabled', 'danger', 'brand');
		const Lists = WebpackModules.getByProps('ListThin');

		const ctxMenuClasses = WebpackModules.getByProps('menu', 'scroller');

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
				if (this.state.hasError) return React.createElement('div', { className: `${config.info.name}-error` }, 'Component Error');
				return this.props.children;
			}
		};

		const WrapBoundary = (Original) => {
			return class Boundary extends React.PureComponent {
				render() {
					return React.createElement(ErrorBoundary, null, React.createElement(Original, this.props));
				}
			};
		};

		const ItemGroup = class ItemGroup extends React.Component {
			constructor(props) {
				super(props);
			}

			render() {
				return React.createElement('div', {
					className: DiscordClasses.ContextMenu.itemGroup.toString(),
					children: this.props.children || []
				});
			}
		};

		const Counter = class Counter extends React.PureComponent {
			constructor(props) {
				super(props);
				this.ref = React.createRef();
			}

			render() {
				return React.createElement('div', {
					id: 'MemberCount',
					role: 'listitem',
					ref: this.ref,
					children: [
						React.createElement('h2', {
							className: `${DiscordClasses.MemberList.membersGroup} container-2ax-kl`,
							children: [
								React.createElement('span', {
									children: ['Members', '—', this.props.count]
								})
							]
						})
					]
				});
			}
		};

		const MemberCounter = Flux.connectStores([MemberCountStore], () => ({ count: MemberCountStore.getMemberCount(SelectedGuildStore.getGuildId()) }))(Counter);
		
		return class MemberCount extends Plugin {
			constructor() {
				super();
				this._css;
				this._optIn;
				this.default = { blacklist: [] };
				this.settings = Utilities.deepclone(this.default);
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.css = `
					#MemberCount {
						position: absolute;
						display: flex;
						width: 240px;
                        background-color: var(--background-secondary-alt);
						text-align: center;
						align-items: center;
						justify-content: center;
						padding: 0;
						z-index: 5;
						top: 0;
						margin-top: -10px;
					}

					${DiscordSelectors.MemberList.membersWrap} ${DiscordSelectors.MemberList.members} {
						margin-top: 30px;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.promises.restore();
				this.loadSettings();
				this.addCSS();
				this.patchMemberList(this.promises.state);
				// this.patchGuildContextMenu(this.promises.state);
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				this.promises.cancel();
				this.clearCSS();
				Patcher.unpatchAll();
				this.updateAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			addCSS() {
				PluginUtilities.addStyle(this.short, this.css);
			}

			clearCSS() {
				PluginUtilities.removeStyle(this.short);
			}

			patchMemberList(state) {
				if (!Lists || state.cancelled) return;
				
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const val = Array.isArray(value) ? value[0] : value;
					const props = this.getProps(val, 'props');
					if (!props || !props.id || !props.id.startsWith('members')) return value;

					// const children = this.getProps(props, 'children.props.children.props.children');
					// if (!children || !Array.isArray(children)) return value;
					
					const guildId = SelectedGuildStore.getGuildId();
					if (this.settings.blacklist.includes(guildId) || !guildId) return value;

					const counter = React.createElement(WrapBoundary(MemberCounter), { key: `MemberCount-${guildId}` });
					const fn = (item) => item && item.key && item.key.startsWith('MemberCount');

					if (!Array.isArray(value)) value = [value];
					if (!value.find(fn)) value.unshift(counter);
					// if (!children.find(fn)) children.unshift(counter);

					return value;
				});

				this.updateMemberList();
			}

			updateMemberList(scroll) {
				const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
				if (!memberList) return;
				const inst = ReactTools.getOwnerInstance(memberList);
				if (!inst) return;
				inst.forceUpdate && inst.forceUpdate();
				if (scroll) inst.handleOnScroll && inst.handleOnScroll();
			}

			// async patchGuildContextMenu(state) {
			// 	const Component = await ReactComponents.getComponent('GuildContextMenu', `.${ctxMenuClasses.menu}`, (m) => 
			// 		m.prototype && m.prototype.constructor && m.prototype.constructor.displayName && m.prototype.constructor.displayName === 'GuildContextMenu'
			// 	);
			// 	if (state.cancelled) return;

			// 	Patcher.after(Component, 'default', (that, args, value) => {
			// 		const [props] = args;
			// 		const orig = this.getProps(value, 'props.children.0.props');
			// 		const id = this.getProps(props, 'guild.id');

			// 		if (!orig || !id) return;

			// 		const data = this.parseId(id);
			// 		const item = new MenuItem(data);
			// 		const group = React.createElement(ItemGroup, { children: [item] });

			// 		if (Array.isArray(orig.children)) orig.children.splice(1, 0, group);
			// 		else orig.children = [orig.children], orig.children.splice(1, 0, group);

			// 		setImmediate(() => this.updateContextPosition(that));
			// 		return value;
			// 	});

			// 	this.updateContextMenus();
			// }

			updateContextPosition(that) {
				if (!that) return;
				const height = this.getProps(that, 'props.onHeightUpdate') || this.getProps(that, '_reactInternalFiber.return.memoizedProps.onHeightUpdate') || this.getProps(that, '_reactInternalFiber.child.child.memoizedProps.onHeightUpdate');
				height && height();
			}

			updateContextMenus() {
				const menus = document.querySelectorAll(`.${ctxMenuClasses.menu}`);
				if (!menus.length) return;
				for (const menu of menus) ReactTools.getOwnerInstance(menu).forceUpdate();
			}

			processContextMenu(cm) {
				if (!cm) return;
				const inst = ReactTools.getReactInstance(cm);
				const own = ReactTools.getOwnerInstance(cm);
				const props = this.getProps(inst, 'memoizedProps');
				const childProps = this.getProps(props, 'children.props');
				if (!own || !props || !Array.isArray(childProps.children)) return;
				const readItem = this.getProps(childProps, 'children.0.props.children');
				if (!readItem || Array.isArray(readItem) || readItem.props.id === 'mark-folder-read') return;
				if (readItem.props.id === 'mark-guild-read') return this.addGuildContextItems(inst, own, cm);
			}

			addGuildContextItems(instance, owner, context) {
				const group = new ContextMenu.ItemGroup();
				const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
				const guild = this.getProps(ref, 'props.guild');
				const data = this.parseId(guild.id);
				const item = new ContextMenu.TextItem(data.label, {
					hint: data.hint,
					callback: data.action
				});
				const elements = item.getElement();
				const groupEl = group.getElement();
				elements.className = `${ctxMenuClasses.item} ${ctxMenuClasses.labelContainer} ${ctxMenuClasses.colorDefault}`;
				elements.setAttribute('role', 'menuitem');
				elements.setAttribute('tabindex', '-1');
				elements.firstChild.classList.add(ctxMenuClasses.label);
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
				// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
				group.addItems(item);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}

			parseId(id) {
				const blacklisted = this.settings.blacklist.includes(id);
				return { label: this.getLabel(blacklisted), hint: 'MCount', action: this.getAction(id, blacklisted) };
			}

			getAction(id, blacklisted) {
				return blacklisted ? () => this.unlistGuild(id) : () => this.blacklistGuild(id);
			}

			getLabel(blacklisted) {
				return blacklisted ? 'Include Server' : 'Exclude Server';
			}

			blacklistGuild(id) {
				if (!id) return;
				MenuActions.closeContextMenu();
				this.settings.blacklist.push(id);
				this.saveSettings(this.settings);
				this.updateAll(true);
			}

			unlistGuild(id) {
				if (!id) return;
				MenuActions.closeContextMenu();
				this.settings.blacklist.splice(this.settings.blacklist.indexOf(id), 1);
				this.saveSettings(this.settings);
				this.updateAll(true);
			}

			updateAll(t) {
				this.updateMemberList(t);
			}

			updateCSS() {
				this.clearCSS();
				this.addCSS();
			}

			/* Observer */
			observer({ addedNodes }) {
				for (const node of addedNodes) {
					if (!node) continue;
					if (node.firstChild && node.firstChild.className && typeof node.firstChild.className === 'string' && node.firstChild.className.split(' ')[0] === ctxMenuClasses.menu.split(' ')[0]) {
						this.processContextMenu(node.firstChild);
					}
				}
			}

			/* Load Settings */

			loadSettings() {
				const data = super.loadSettings(this.default);
				if (!data) return (this.settings = Utilities.deepclone(this.default));

				if (Array.isArray(data)) return (this.settings = { blacklist: [...data] });

				if (data.blacklist && !Array.isArray(data.blacklist)) {
					data.blacklist = [...Object.values(data.blacklist)];
					return (this.settings = Utilities.deepclone(data));
				}

				return this.settings = Utilities.deepclone(data);
			}

			/* Utility */

			/**
			 * Function to access properties of an object safely, returns false instead of erroring if the property / properties do not exist.
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 * @param {object} obj The object we are accessing.
			 * @param {string} path The properties we want to traverse or access.
			 * @returns {*}
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
			}

			/* Settings Panel */

			// getSettingsPanel() {
			// 	return SettingPanel.build(() => this.saveSettings(this.settings),
			// 		new SettingGroup('Plugin Settings').append(
			// 			new Switch('Sticky Counter', 'Adds CSS to always position the counter atop the member list, regardless of scroll.', this.settings.sticky, (i) => {
			// 				this.settings.sticky = i;
			// 				this.updateCSS();
			// 			})
			// 		)
			// 	);
			// }

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

module.exports = MemberCount;

/*@end@*/
