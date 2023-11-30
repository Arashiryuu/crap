/**
 * @name MemberCount
 * @author Arashiryuu
 * @version 2.2.18
 * @description Displays a server's member-count at the top of the member-list, can be styled with the #MemberCount selector.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/MemberCount/MemberCount.plugin.js
 */

// @ts-check
/// <reference path="../types.d.ts" />

/**
 * @typedef i18nStrings
 * @type {import('./MemberCount').i18nStrings}
 */

/**
 * @typedef MetaData
 * @type {import('../types').MetaData}
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

/* global globalThis, BdApi */
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
		version: '2.2.18',
		description: 'Displays a server\'s member-count at the top of the member-list, can be styled with the #MemberCount selector.',
		github: 'https://github.com/Arashiryuu',
		github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MemberCount/MemberCount.plugin.js'
	},
	strings: {
		pl: {
			INCLUDE: 'Dołącz serwer',
			EXCLUDE: 'Wyklucz serwer',
			MEMBERS: 'Członkowie',
			ONLINE: 'Online'
		},
		ru: {
			INCLUDE: 'Включить отображение участников',
			EXCLUDE: 'Отключить отображение участников',
			MEMBERS: 'Участники',
			ONLINE: 'онлайн'
		},
		fr: {
			INCLUDE: 'Inclure le serveur',
			EXCLUDE: 'Exclure le serveur',
			MEMBERS: 'Membres',
			ONLINE: 'En ligne'
		},
		de: {
			INCLUDE: 'Server einschließen',
			EXCLUDE: 'Server ausschließen',
			MEMBERS: 'Mitglieder',
			ONLINE: 'Online'
		},
		en: {
			INCLUDE: 'Include Server',
			EXCLUDE: 'Exclude Server',
			MEMBERS: 'Members',
			ONLINE: 'Online'
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
		// 		'Added setting to toggle online count displaying.',
		// 		'Added new display style setting.',
		// 		'Added setting for the extra spacing below the counter in the list.'
		// 	]
		// }
		{
			title: 'Bugs Squashed!',
			type: 'fixed',
			items: [
				'Fix library missing links.'
			]
		}
	]
};

if (!globalThis.ZeresPluginLibrary) {
	// @ts-ignore
	BdApi.showConfirmationModal('Library Missing', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
		danger: false,
		confirmText: 'Download Now',
		cancelText: 'Cancel',
		onConfirm: () => {
			// @ts-ignore
			require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
				// @ts-ignore
				if (error) return require('electron').shell.openExternal('https://betterdiscord.app/Download?id=9');
				// @ts-ignore
				await new Promise((r) => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
			});
		}
	});
}

module.exports = (() => {

	/* Setup */
	
	const [log, info, warn, debug, error] = (() => {
		const levels = ['log', 'info', 'warn', 'debug', 'error'];
		const getParts = () => [
			`%c[${config.info.name}]%c \u2014 %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];
		return levels.map((type) => (function () {
			console.groupCollapsed(...getParts());
			console[type](...arguments);
			console.groupEnd();
		}));
	})();

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ContextMenu, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, SettingField, Textbox, Switch, RadioGroup } = Settings;
		const { React, ReactDOM, Dispatcher, UserStore, DiscordConstants, GuildMemberStore, MemberCountStore, SelectedGuildStore, ContextMenuActions: MenuActions } = DiscordModules;
		const { PureComponent, createElement, useRef, useMemo, useState, useEffect, useCallback, useReducer } = React;
		const { useStateFromStores, useStateFromStoresArray } = WebpackModules.getByProps('Dispatcher', 'Store', 'useStateFromStores');

		const has = Object.prototype.hasOwnProperty;
		const LangUtils = WebpackModules.getByProps('getLocale', 'getLanguages');
		const Flux = WebpackModules.getByProps('connectStores');
		const Lists = WebpackModules.getByProps('ListThin');
		const Menu = WebpackModules.getByProps('MenuItem', 'MenuGroup', 'MenuSeparator');
		const GuildPopoutActions = WebpackModules.getByProps('fetchGuildForPopout');
		const GuildPopoutStore = WebpackModules.getByProps('getGuild', 'isFetchingGuild');
		const TextElement = WebpackModules.getByDisplayName('LegacyText');

		const ctxMenuClasses = WebpackModules.getByProps('menu', 'scroller');
		const dispatchKey = 'MEMBERCOUNT_COUNTER_UPDATE';

		const options = {
			style: [
				{
					name: 'Classic',
					desc: 'Use the classic display style - matches Discord\'s role headers in the member list.',
					value: 0
				},
				{
					name: 'New',
					desc: 'Use the new display style.',
					value: 1
				}
			],
			margin: [
				{
					name: 'Compact',
					desc: 'Old style spacing which cuts off part of the scrollbar in the memberlist.',
					value: 0
				},
				{
					name: 'Cozy',
					desc: 'New style spacing which accomodates the scrollbar properly.',
					value: 1
				}
			]
		};

		const ErrorBoundary = class ErrorBoundary extends PureComponent {
			constructor(props) {
				super(props);
				this.state = { hasError: false };
			}

			static getDerivedStateFromError() {
				return { hasError: true };
			}

			componentDidCatch(e) {
				error(e);
			}

			render() {
				if (this.state.hasError) return createElement('div', {
					className: `${config.info.name}-error`,
					children: [
						createElement(TextElement, {
							color: TextElement.Colors.ERROR,
							size: TextElement.Sizes.SIZE_14
						}, `${config.info.name} Error`)
					],
					style: {
						position: 'absolute',
						top: '2vh'
					}
				});
				return this.props.children;
			}
		};

		const WrapBoundary = (Original) => (props) => createElement(ErrorBoundary, null, createElement(Original, props));

		const Person = (props) => createElement('svg', {
			className: 'membercount-icon',
			xmlns: 'http://www.w3.org/2000/svg',
			width: '12px',
			height: '12px',
			viewBox: '0 0 20 20',
			fill: props.fill ?? 'currentColor',
			style: {
				marginRight: '1px'
			},
			children: [
				createElement('path', {
					d: 'M0 0h24v24H0z',
					fill: 'none'
				}),
				createElement('path', {
					d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
				})
			]
		});

		const Row = (props) => createElement('span', {
			className: 'membercount-row',
			children: [
				...(
					props.displayType === 1
						? [
							createElement(Person, { fill: props.fill ?? null }),
							String.fromCodePoint(160),
							props.count,
							String.fromCodePoint(160),
							props.string
						]
						: [
							props.string,
							' — ',
							props.count
						]
				)
			]
		});
		
		/**
		 * @returns {i18nStrings}
		 */
		const useStrings = () => {
			const [lang] = LangUtils.getLocale().split('-');
			return config.strings[lang] ?? config.strings.en;
		};

		/**
		 * @returns {React.DispatchWithoutAction}
		 */
		const useForceUpdate = () => useReducer((x) => x + 1, 0).pop();

		// const useStateFromStores = (stores, updater) => {
		// 	const [value, setValue] = useState(updater, stores);
		// 	const listener = useCallback(() => setValue(updater), []);

		// 	useEffect(() => {
		// 		for (const store of stores) {
		// 			store.addChangeListener(listener);
		// 		}
		// 		return () => {
		// 			for (const store of stores) {
		// 				store.removeChangeListener(listener);
		// 			}
		// 		};
		// 	}, stores);

		// 	return value;
		// };

		const Counter = (props) => {
			const forceUpdate = useForceUpdate();
			const listener = useCallback(() => forceUpdate(), []);

			const ref = useRef();
			const strings = useStrings();
			const online = useStateFromStores([GuildPopoutStore], () => GuildPopoutStore.getGuild(props.id)?.presenceCount);

			useEffect(() => {
				if (!/*props.*/online && !GuildPopoutStore.isFetchingGuild(props.id)) {
					GuildPopoutActions.fetchGuildForPopout(props.id);
				}
				Dispatcher.subscribe(dispatchKey, listener);
				return () => Dispatcher.unsubscribe(dispatchKey, listener);
			}, [/*props.*/online]);

			return createElement('div', {
				id: 'MemberCount',
				role: 'listitem',
				ref: ref,
				children: [
					createElement('h3', {
						className: `${DiscordClasses.MemberList.membersGroup} container-q97qHp`,
						children: [
							createElement(Row, {
								string: strings.MEMBERS,
								count: props.count || 'Loading',
								displayType: props.displayType
							}),
							props.online && createElement(Row, {
								fill: 'hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)',
								string: strings.ONLINE,
								count: /*props.*/online ?? 'Loading',
								displayType: props.displayType
							})
						]
					})
				]
			});
		};

		const MemberCounter = Flux.connectStores([MemberCountStore, GuildPopoutStore], () => ({
			count: MemberCountStore.getMemberCount(SelectedGuildStore.getGuildId()),
			online: GuildPopoutStore.getGuild(SelectedGuildStore.getGuildId())?.presenceCount
		}))(Counter);

		const getHintSVG = () => createElement('svg', {
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
				createElement('path', {
					d: `M89.452,123.229c5.185-6.581,8.109-14.79,8.109-23.34c0-20.808-16.932-37.735-37.74-37.735S22.08,79.082,22.08,99.889
					c0,8.688,3.006,17.009,8.331,23.627C11.887,136.099,0,159.854,0,185.836c0,3.957,3.213,7.168,7.169,7.168h105.938
					c3.958,0,7.168-3.211,7.168-7.168C120.275,159.602,108.218,135.726,89.452,123.229z M14.692,178.667
					c2.166-21.436,13.917-39.843,30.6-47.059c2.389-1.036,4.03-3.278,4.287-5.869c0.259-2.597-0.913-5.12-3.052-6.606
					c-6.338-4.387-10.118-11.584-10.118-19.25c0-12.905,10.501-23.398,23.403-23.398c12.905,0,23.403,10.494,23.403,23.398
					c0,7.575-3.712,14.72-9.931,19.112c-2.126,1.5-3.272,4.042-2.992,6.632c0.282,2.585,1.941,4.823,4.345,5.831
					c16.874,7.113,28.766,25.585,30.936,47.208H14.692z`.split(/\s+/g).join('').trim()
				}),
				createElement('path', {
					d: `M176.705,102.872c-2.801-2.8-7.337-2.8-10.137,0l-14.57,14.566l-14.562-14.566c-2.801-2.8-7.339-2.8-10.14,0
					c-2.8,2.8-2.8,7.337,0,10.137l14.563,14.566l-14.563,14.563c-2.8,2.8-2.8,7.337,0,10.137c1.4,1.4,3.234,2.101,5.071,2.101
					c1.834,0,3.668-0.7,5.068-2.101l14.57-14.562l14.562,14.562c1.4,1.4,3.238,2.101,5.073,2.101c1.834,0,3.673-0.7,5.073-2.101
					c2.8-2.8,2.8-7.337,0-10.137l-14.571-14.563l14.571-14.566C179.505,110.208,179.505,105.672,176.705,102.872z`.split(/\s+/g).join('').trim()
				}),
				createElement('path', {
					d: `M228.01,119.603c-3.593,0-6.646,0.467-9.143,1.396c-1.498,0.565-3.574,1.715-6.249,3.461l3.15-19.231h35.927V90.546
					h-48.402l-6.174,48.596l15.499,0.728c1.372-2.627,3.412-4.429,6.109-5.399c1.54-0.527,3.351-0.789,5.456-0.789
					c4.438,0,7.705,1.55,9.805,4.64c2.096,3.099,3.146,6.889,3.146,11.378c0,4.574-1.12,8.363-3.36,11.379
					c-2.24,3.015-5.498,4.518-9.773,4.518c-3.715,0-6.534-1.018-8.476-3.062c-1.932-2.045-3.248-4.947-3.93-8.709h-17.23
					c0.606,8.251,3.594,14.617,8.971,19.116c5.376,4.485,12.246,6.729,20.609,6.729c10.384,0,18.183-3.196,23.4-9.586
					c5.209-6.389,7.812-13.646,7.812-21.786c0-9.343-2.702-16.456-8.115-21.354C241.624,122.044,235.286,119.603,228.01,119.603z`.split(/\s+/g).join('').trim()
				})
			]
		});

		const getSpacing = (settings) => {
			let min = 30;
			let max = 40;
			
			if (settings.marginSpacing === 0) {
				min = 30;
				max = 40;
			} else {
				min = 40;
				max = 60;
			}

			return !settings.online
				? `${min}px`
				: `${max}px`;
		};
		
		return class MemberCount extends Plugin {
			#config;
			#meta;

			/**
			 * @param {MetaData} meta 
			 */
			constructor(meta) {
				super();
				this.#config = config;
				this.#meta = meta;
				this.default = { blacklist: [], online: false, displayType: 0, marginSpacing: 0 };
				this.settings = Utilities.deepclone(this.default);
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
			}

			/* Methods */

			onStart() {
				this.promises.restore();
				this.loadSettings();
				this.addCSS();
				this.patchMemberList(this.promises.state);
				this.patchGuildContextMenu(this.promises.state).catch(error);
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

				const isThread = (props) => {
					return !props['data-list-id'] && props.className.startsWith('members');
				};
				
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const val = Array.isArray(value)
						? value.find((item) => item && !item.key)
						: value;
					const props = this.getProps(val, 'props');
					if (!props || props.id === 'channels' || !props.className.startsWith('members')) return value;

					const guildId = SelectedGuildStore.getGuildId();
					if (!guildId) return value;

					const list = document.querySelector(`${DiscordSelectors.MemberList.membersWrap}`);
					const fn = (item) => item && item.key && item.key.startsWith('MemberCount');
					const counter = createElement(WrapBoundary(MemberCounter), {
						id: guildId,
						key: `MemberCount-${guildId}`,
						online: this.settings.online,
						displayType: this.settings.displayType
					});

					if (this.settings.blacklist.includes(guildId)) {
						if (list && (list.classList.contains('hasCounter') || list.classList.contains('hasCounter_thread'))) list.classList.remove('hasCounter', 'hasCounter_thread');
						return value;
					}

					if (isThread(props)) {
						const memberlist = this.getProps(props, 'children.0.props.children.props');
						if (!memberlist || !memberlist.children) return value;

						if (!Array.isArray(memberlist.children)) memberlist.children = [memberlist.children];
						if (!memberlist.children.some(fn)) {
							memberlist.children.unshift(counter);
							if (list && !list.classList.contains('hasCounter_thread')) list.classList.add('hasCounter_thread');
						}

						return value;
					}

					
					const valProps = this.getProps(val, 'props');
					if (!valProps['data-list-id']?.startsWith('members')) return value;

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

			async patchGuildContextMenu(state) {
				if (state.cancelled) return;

				const GuildContextMenu = await ContextMenu.getDiscordMenu('GuildContextMenu');
				if (!GuildContextMenu) return;

				const fn = (item) => item && item.key && item.key === 'MemberCount-Group';

				Patcher.after(GuildContextMenu, 'default', (that, args, value) => {
					const [props] = args;
					if (value.props.navId !== 'guild-context') return value;

					const orig = this.getProps(value, 'props');
					const id = this.getProps(props, 'guild.id');
					if (!orig || !id) return;

					const data = this.parseId(id);
					const bottomSeparator = createElement(Menu.MenuSeparator, {});
					const item = createElement(Menu.MenuItem, data);
					const group = createElement(Menu.MenuGroup, {
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

				ContextMenu.forceUpdateMenus();
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
				// @ts-ignore
				for (const menu of menus) ReactTools.getOwnerInstance(menu).forceUpdate();
			}

			// processContextMenu(cm) {
			// 	if (!cm) return;
			// 	const inst = ReactTools.getReactInstance(cm);
			// 	const own = ReactTools.getOwnerInstance(cm);
			// 	const props = this.getProps(inst, 'memoizedProps');
			// 	const childProps = this.getProps(props, 'children.props');
			// 	if (!own || !props || !Array.isArray(childProps.children)) return;
			// 	const readItem = this.getProps(childProps, 'children.0.props.children');
			// 	if (!readItem || Array.isArray(readItem) || readItem.props.id === 'mark-folder-read') return;
			// 	if (readItem.props.id === 'mark-guild-read') return this.addGuildContextItems(inst, own, cm);
			// }

			// addGuildContextItems(instance, owner, context) {
			// 	const group = new ContextMenu.ItemGroup();
			// 	const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
			// 	const guild = this.getProps(ref, 'props.guild');
			// 	const data = this.parseId(guild.id);
			// 	const item = new ContextMenu.TextItem(data.label, {
			// 		hint: data.hint,
			// 		callback: data.action
			// 	});
			// 	const elements = item.getElement();
			// 	const groupEl = group.getElement();
			// 	elements.className = `${ctxMenuClasses.item} ${ctxMenuClasses.labelContainer} ${ctxMenuClasses.colorDefault}`;
			// 	elements.setAttribute('role', 'menuitem');
			// 	elements.setAttribute('tabindex', '-1');
			// 	elements.firstChild.classList.add(ctxMenuClasses.label);
			// 	elements.addEventListener('mouseenter', (e) => {
			// 		if (elements.classList.contains(ctxMenuClasses.focused)) return;
			// 		elements.classList.add(ctxMenuClasses.focused);
			// 	});
			// 	elements.addEventListener('mouseleave', (e) => {
			// 		if (!elements.classList.contains(ctxMenuClasses.focused)) return;
			// 		elements.classList.remove(ctxMenuClasses.focused);
			// 	});
			// 	groupEl.removeAttribute('class');
			// 	groupEl.setAttribute('role', 'group');
			// 	group.addItems(item);
			// 	context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
			// 	setImmediate(() => this.updateContextPosition(owner));
			// }

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

				if (Array.isArray(data)) return (this.settings = { blacklist: [...data], online: false, displayType: 0, marginSpacing: 0 });

				if (data.blacklist && !Array.isArray(data.blacklist)) {
					data.blacklist = [...Object.values(data.blacklist)];
					return (this.settings = Utilities.deepclone(data));
				}

				return this.settings = Utilities.deepclone(data);
			}

			/* Settings Panel */

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new Switch('Online Counter', 'Whether to display the online counter or not.', this.settings.online, (i) => {
							this.settings.online = i;
							this.clearCSS();
							this.addCSS();
							setImmediate(() => {
								Dispatcher.wait(() => Dispatcher.dispatch({ type: dispatchKey }));
								setImmediate(() => this.updateMemberList());
							});
						}),
						new RadioGroup('Display Style', 'Switch between the classic or newer display style.', this.settings.displayType || 0, options.style, (i) => {
							this.settings.displayType = i;
							setImmediate(() => {
								Dispatcher.wait(() => Dispatcher.dispatch({ type: dispatchKey }));
								setImmediate(() => this.updateMemberList());
							});
						}),
						new RadioGroup('Spacing Style', 'The amount of space left under the counters.', this.settings.marginSpacing || 0, options.margin, (i) => {
							this.settings.marginSpacing = i;
							this.clearCSS();
							this.addCSS();
							setImmediate(() => {
								Dispatcher.wait(() => Dispatcher.dispatch({ type: dispatchKey }));
								setImmediate(() => this.updateMemberList());
							});
						})
					)
				);
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

			set css(style) {
				return;
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get css() {
				return `
					#MemberCount {
						background: var(--background-secondary);
						color: var(--channels-default, var(--text-secondary, --text-primary));
						position: absolute;
						width: 240px;
						padding: 0;
						z-index: 1;
						top: 0;
						margin-top: 0;
						border-bottom: 1px solid hsla(0, 0%, 100%, 0.04);
					}

					#MemberCount h3 {
						padding: 12px 8px;
						height: auto;
					}

					#MemberCount .membercount-row {
						display: flex;
						justify-content: center;
					}

					${DiscordSelectors.MemberList.membersWrap}.hasCounter ${DiscordSelectors.MemberList.members} {
						margin-top: ${getSpacing(this.settings)};
					}

					${DiscordSelectors.MemberList.membersWrap}.hasCounter_thread #MemberCount {
						position: sticky;
					}

					${DiscordSelectors.MemberList.membersWrap}.hasCounter_thread ${DiscordSelectors.MemberList.members} {
						margin-top: 0;
					}
				`.split(/\s+/g).join(' ').trim();
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

	/* Dummy class */

	class Dummy {
		#config;
		#meta;

		constructor(meta) {
			this._config = config;
			this.#config = config;
			this.#meta = meta;
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

	/* Finalize */

	return !globalThis.ZeresPluginLibrary 
		? Dummy
		: buildPlugin(globalThis.ZeresPluginLibrary.buildPlugin(config));
})();

/*@end@*/
