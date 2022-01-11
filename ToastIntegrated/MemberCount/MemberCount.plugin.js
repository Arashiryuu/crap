/**
 * @name MemberCount
 * @author Arashiryuu
 * @version 2.2.11
 * @description Displays a server's member-count at the top of the member-list, can be styled with the #MemberCount selector.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
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
			version: '2.2.11',
			description: 'Displays a server\'s member-count at the top of the member-list, can be styled with the #MemberCount selector.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MemberCount/MemberCount.plugin.js'
		},
		strings: {
			pl: {
				INCLUDE: 'Dołącz serwer',
				EXCLUDE: 'Wyklucz serwer',
				MEMBERS: 'Członkowie'
			},
			ru: {
				INCLUDE: 'Включить отображение участников',
				EXCLUDE: 'Отключить отображение участников',
				MEMBERS: 'Участники'
			},
			fr: {
				INCLUDE: 'Inclure le serveur',
				EXCLUDE: 'Exclure le serveur',
				MEMBERS: 'Membres'
			},
			de: {
				INCLUDE: 'Server einschließen',
				EXCLUDE: 'Server ausschließen',
				MEMBERS: 'Mitglieder'
			},
			en: {
				INCLUDE: 'Include Server',
				EXCLUDE: 'Exclude Server',
				MEMBERS: 'Members'
			}
		},
		changelog: [
			// {
			// 	title: 'Maintenance',
			// 	type: 'progress',
			// 	items: [
			// 		'General maintenance.'
			// 	]
			// }
			// {
			// 	title: 'Evolving?',
			// 	type: 'improved',
			// 	items: [
			// 		'Added Russian translations.'
			// 	]
			// }
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: [
					'Reflects recent class change.'
				]
			}
		]
	};
	
	const log = function() {
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

	const err = function() {
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
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ContextMenu, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, SettingField, Textbox, Switch } = Settings;
		const { React, ReactDOM, MemberCountStore, SelectedGuildStore, ContextMenuActions: MenuActions } = DiscordModules;

		const has = Object.prototype.hasOwnProperty;
		const LangUtils = WebpackModules.getByProps('getLocale', 'getLanguages');
		const Flux = WebpackModules.getByProps('connectStores');
		const Lists = WebpackModules.getByProps('ListThin');
		const Menu = WebpackModules.getByProps('MenuItem', 'MenuGroup', 'MenuSeparator');
		const GuildContextMenu = WebpackModules.find((mod) => mod && mod.default && mod.default.displayName === 'GuildContextMenu');

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
				if (this.state.hasError) return React.createElement('div', {
					className: `${config.info.name}-error`,
					children: [
						`${config.info.name} Component Error`
					]
				});
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

		const Counter = class Counter extends React.PureComponent {
			constructor(props) {
				super(props);
				this.ref = React.createRef();
			}

			static get strings() {
				const [lang] = LangUtils.getLocale().split('-');
				return config.strings[lang] ?? config.strings.en;
			}

			render() {
				return React.createElement('div', {
					id: 'MemberCount',
					role: 'listitem',
					ref: this.ref,
					children: [
						React.createElement('h2', {
							className: `${DiscordClasses.MemberList.membersGroup} container-q97qHp`,
							children: [
								React.createElement('span', {
									children: [
										Counter.strings.MEMBERS,
										' — ',
										this.props.count
									]
								})
							]
						})
					]
				});
			}
		};

		const MemberCounter = Flux.connectStores([MemberCountStore], () => ({
			count: MemberCountStore.getMemberCount(SelectedGuildStore.getGuildId())
		}))(Counter);

		const getHintSVG = () => React.createElement('svg', {
			xmlns: 'http://www.w3.org/2000/svg',
			width: '24px',
			height: '24px',
			viewBox: '0 0 300 300',
			fill: 'currentColor',
			style: {
				position: 'relative',
				top: '-1px'
			},
			children: [
				React.createElement('path', {
					d: `M89.452,123.229c5.185-6.581,8.109-14.79,8.109-23.34c0-20.808-16.932-37.735-37.74-37.735S22.08,79.082,22.08,99.889
					c0,8.688,3.006,17.009,8.331,23.627C11.887,136.099,0,159.854,0,185.836c0,3.957,3.213,7.168,7.169,7.168h105.938
					c3.958,0,7.168-3.211,7.168-7.168C120.275,159.602,108.218,135.726,89.452,123.229z M14.692,178.667
					c2.166-21.436,13.917-39.843,30.6-47.059c2.389-1.036,4.03-3.278,4.287-5.869c0.259-2.597-0.913-5.12-3.052-6.606
					c-6.338-4.387-10.118-11.584-10.118-19.25c0-12.905,10.501-23.398,23.403-23.398c12.905,0,23.403,10.494,23.403,23.398
					c0,7.575-3.712,14.72-9.931,19.112c-2.126,1.5-3.272,4.042-2.992,6.632c0.282,2.585,1.941,4.823,4.345,5.831
					c16.874,7.113,28.766,25.585,30.936,47.208H14.692z`.split(/\s+/g).join('').trim()
				}),
				React.createElement('path', {
					d: `M176.705,102.872c-2.801-2.8-7.337-2.8-10.137,0l-14.57,14.566l-14.562-14.566c-2.801-2.8-7.339-2.8-10.14,0
					c-2.8,2.8-2.8,7.337,0,10.137l14.563,14.566l-14.563,14.563c-2.8,2.8-2.8,7.337,0,10.137c1.4,1.4,3.234,2.101,5.071,2.101
					c1.834,0,3.668-0.7,5.068-2.101l14.57-14.562l14.562,14.562c1.4,1.4,3.238,2.101,5.073,2.101c1.834,0,3.673-0.7,5.073-2.101
					c2.8-2.8,2.8-7.337,0-10.137l-14.571-14.563l14.571-14.566C179.505,110.208,179.505,105.672,176.705,102.872z`.split(/\s+/g).join('').trim()
				}),
				React.createElement('path', {
					d: `M228.01,119.603c-3.593,0-6.646,0.467-9.143,1.396c-1.498,0.565-3.574,1.715-6.249,3.461l3.15-19.231h35.927V90.546
					h-48.402l-6.174,48.596l15.499,0.728c1.372-2.627,3.412-4.429,6.109-5.399c1.54-0.527,3.351-0.789,5.456-0.789
					c4.438,0,7.705,1.55,9.805,4.64c2.096,3.099,3.146,6.889,3.146,11.378c0,4.574-1.12,8.363-3.36,11.379
					c-2.24,3.015-5.498,4.518-9.773,4.518c-3.715,0-6.534-1.018-8.476-3.062c-1.932-2.045-3.248-4.947-3.93-8.709h-17.23
					c0.606,8.251,3.594,14.617,8.971,19.116c5.376,4.485,12.246,6.729,20.609,6.729c10.384,0,18.183-3.196,23.4-9.586
					c5.209-6.389,7.812-13.646,7.812-21.786c0-9.343-2.702-16.456-8.115-21.354C241.624,122.044,235.286,119.603,228.01,119.603z`.split(/\s+/g).join('').trim()
				})
			]
		});
		
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
						background: var(--background-secondary);
						position: absolute;
						display: flex;
						width: 240px;
						text-align: center;
						align-items: center;
						justify-content: center;
						padding: 0;
						z-index: 5;
						top: 0;
						margin-top: -10px;
					}

					${DiscordSelectors.MemberList.membersWrap}.hasCounter ${DiscordSelectors.MemberList.members} {
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
				this.patchGuildContextMenu(this.promises.state);
			}

			onStop() {
				this.promises.cancel();
				this.clearCSS();
				Patcher.unpatchAll();
				this.updateAll();
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
					const val = Array.isArray(value)
						? value.find((item) => item && !item.key)
						: value;
					const props = this.getProps(val, 'props');
					if (!props || !props['data-list-id'] || !props['data-list-id'].startsWith('members')) return value;
					
					const guildId = SelectedGuildStore.getGuildId();
					const list = document.querySelector(`${DiscordSelectors.MemberList.membersWrap}`);
					if (this.settings.blacklist.includes(guildId) || !guildId) {
						if (list && list.classList.contains('hasCounter')) list.classList.remove('hasCounter');
						return value;
					}

					const counter = React.createElement(WrapBoundary(MemberCounter), { key: `MemberCount-${guildId}` });
					const fn = (item) => item && item.key && item.key.startsWith('MemberCount');

					if (!Array.isArray(value)) value = [value];
					if (!value.some(fn)) {
						value.unshift(counter);
						if (list && !list.classList.contains('hasCounter')) list.classList.add('hasCounter');
					}

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

			patchGuildContextMenu(state) {
				if (state.cancelled || !GuildContextMenu) return;

				const fn = (item) => item && item.key && item.key === 'MemberCount-Group';

				Patcher.after(GuildContextMenu, 'default', (that, args, value) => {
					const [props] = args;
					if (value.props.navId !== 'guild-context') return value;

					const orig = this.getProps(value, 'props');
					const id = this.getProps(props, 'guild.id');
					if (!orig || !id) return;

					const data = this.parseId(id);
					const bottomSeparator = React.createElement(Menu.MenuSeparator, {});
					const item = React.createElement(Menu.MenuItem, data);
					const group = React.createElement(Menu.MenuGroup, {
						key: 'MemberCount-Group',
						children: [
							item,
							bottomSeparator
						]
					});

					if (!Array.isArray(orig.children)) orig.children = [orig.children];
					if (!orig.children.some(fn)) orig.children.splice(1, 0, group);

					return value;
				});

				PluginUtilities.forceUpdateContextMenus();
			}

			updateContextPosition(that) {
				if (!that) return;
				const height = this.getProps(that, 'updatePosition')
					|| this.getProps(that, 'props.onHeightUpdate')
					|| this.getProps(that, '_reactInternalFiber.return.memoizedProps.onHeightUpdate')
					|| this.getProps(that, '_reactInternalFiber.child.child.memoizedProps.onHeightUpdate');
				if (typeof height === 'function') height();
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
				elements.addEventListener('mouseenter', (e) => {
					if (elements.classList.contains(ctxMenuClasses.focused)) return;
					elements.classList.add(ctxMenuClasses.focused);
				});
				elements.addEventListener('mouseleave', (e) => {
					if (!elements.classList.contains(ctxMenuClasses.focused)) return;
					elements.classList.remove(ctxMenuClasses.focused);
				});
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				group.addItems(item);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}

			parseId(id) {
				const blacklisted = this.settings.blacklist.includes(id);
				return {
					id: 'membercount-toggle',
					hint: getHintSVG(),
					label: this.getLabel(blacklisted),
					action: this.getAction(id, blacklisted)
				};
			}

			getAction(id, blacklisted) {
				return blacklisted
					? () => this.unlistGuild(id)
					: () => this.blacklistGuild(id);
			}

			getLabel(blacklisted) {
				return blacklisted
					? this.strings.INCLUDE
					: this.strings.EXCLUDE;
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
			// observer({ addedNodes }) {
			// 	for (const node of addedNodes) {
			// 		if (!node) continue;
			// 		if (node.firstChild && node.firstChild.className && typeof node.firstChild.className === 'string' && node.firstChild.className.split(' ')[0] === ctxMenuClasses.menu.split(' ')[0]) {
			// 			this.processContextMenu(node.firstChild);
			// 		}
			// 	}
			// }

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
				if (!BdApi.showConfirmationModal) return BdApi.alert(title, children);
				BdApi.showConfirmationModal(title, [
						React.createElement(TextElement, {
							color: TextElement.Colors.STANDARD,
							children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
						})
					],
					{
						danger: false,
						confirmText: 'Download Now',
						cancelText: 'Cancel',
						onConfirm: () => {
							require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
								if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
								await new Promise(r => require('fs').writeFile(require('path').join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
							});
						}
					}
				);
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
