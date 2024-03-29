/**
 * @name HideUtils
 * @author Arashiryuu
 * @version 2.2.7
 * @description Allows you to hide users, servers, and channels individually.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideUtils/HideUtils.plugin.js
 */

// @ts-check
/// <reference path="./HideUtils.d.ts" />

/**
 * @typedef i18nStrings
 * @type {import('./HideUtils').i18nStrings}
 */

/**
 * @typedef MetaData
 * @type {import('./HideUtils').MetaData}
 */

/**
 * @typedef ContextData
 * @type {import('./HideUtils').ContextData}
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
		name: 'HideUtils',
		authors: [
			{
				name: 'Arashiryuu',
				discord_id: '238108500109033472',
				github_username: 'Arashiryuu',
				twitter_username: ''
			}
		],
		version: '2.2.7',
		description: 'Allows you to hide users, servers, and channels individually.',
		github: 'https://github.com/Arashiryuu',
		github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideUtils/HideUtils.plugin.js',
		github_source: 'https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideUtils/HideUtils.plugin.js'
	},
	strings: {
		en: {
			PLUGIN_SETTINGS_NAME: 'Settings Select',
			PLUGIN_SETTINGS_BLOCK_NAME: 'Hide Blocked User Messages',
			PLUGIN_SETTINGS_DESCRIPTION: 'Select which settings you would like to visit.',
			PLUGIN_SETTINGS_BLOCK_DESCRIPTION: 'Whether or not to unrender messages from blocked users.',
			HIDE_USER: 'Hide User',
			UNHIDE_USER: 'Unhide User',
			HIDE_CHANNEL: 'Hide Channel',
			HIDE_SERVER: 'Hide Server',
			HIDE_FOLDER: 'Hide Folder',
			UNHIDE_CHANNEL: 'Unhide Channel',
			UNHIDE_CHANNELS: 'Unhide Channels',
			PURGE_CHANNELS: 'Purge Hidden Channels',
			SETTINGS_INSTRUCTIONS: 'Instructions',
			SETTINGS_CHANNELS: 'Channels',
			SETTINGS_FOLDERS: 'Folders',
			SETTINGS_SERVERS: 'Servers',
			SETTINGS_USERS: 'Users',
			INSTRUCTIONS_HOWTO: 'How to',
			INSTRUCTIONS_HOWTO_EXT1: 'Right-click on a channel, server, or user.',
			INSTRUCTIONS_HOWTO_EXT2: 'Left-click the hide option in the context-menu.',
			INSTRUCTIONS_NOTE: 'Note',
			INSTRUCTIONS_NOTE_EXT1: 'Unhiding requires use of the settings-panel, and is not handled within a context-menu.',
			INSTRUCTIONS_NOTE_EXT2: 'Click on a hidden element in its respective settings modal to unhide it.',
			TOASTS_PURGE_SUCCESS: 'Channel purge for {{GUILD}} was successful.',
			TOASTS_CHANNEL_SUCCESS: 'Channel has successfully been hidden.',
			TOASTS_CHANNEL_REMOVE_SUCCESS: 'Channel successfully removed.',
			TOASTS_CHANNEL_NOCHANNEL: 'Unable to find channel to hide.',
			TOASTS_CHANNEL_FAILURE: 'This channel is already being hidden.',
			TOASTS_CHANNEL_FAILURE2: 'This channel is not being hidden.',
			TOASTS_GUILD_SUCCESS: 'Server has successfully been hidden.',
			TOASTS_GUILD_REMOVE_SUCCESS: 'Server successfully removed.',
			TOASTS_GUILD_NOGUILD: 'Unable to find server to hide.',
			TOASTS_GUILD_FAILURE: 'That server is already being hidden.',
			TOASTS_GUILD_FAILURE2: 'That server is not being hidden.',
			TOASTS_FOLDER_SUCCESS: 'Folder has successfully been hidden.',
			TOASTS_FOLDER_REMOVE_SUCCESS: 'Folder successfully removed.',
			TOASTS_FOLDER_FAILURE: 'This folder is already being hidden.',
			TOASTS_FOLDER_FAILURE2: 'This folder is not being hidden.',
			TOASTS_USER_SUCCESS: 'User is now being hidden!',
			TOASTS_USER_NOUSER: 'Unable to find user to hide.',
			TOASTS_USER_REMOVE_SUCCESS: 'User successfully removed.',
			TOASTS_USER_FAILURE: 'This user is already being hidden.',
			TOASTS_USER_FAILURE2: 'This user is not being hidden.',
			TOASTS_USER_SELF_FAILURE: 'You cannot hide yourself.'
		}
	},
	changelog: [
		// {
		// 	title: 'Maintenance',
		// 	type: 'progress',
		// 	items: [
		// 		'Minor logic tweak(s).'
		// 		// 'Minor logic tweaks, improved consistency.'
		// 	]
		// }
		// {
		// 	title: 'Evolving?',
		// 	type: 'improved',
		// 	items: [
		// 		'Added language strings support.'
		// 	]
		// },
		{
			title: 'Bugs Squashed!',
			type: 'fixed',
			items: [
				'Fix guild context menu items not showing.'
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

	/* Utility */

	const { log, info, warn, debug, error } = (() => {
		const useParts = () => [
			`%c[${config.info.name}]%c %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];

		return Object.fromEntries([
			'log',
			'info',
			'warn',
			'debug',
			'error'
		].map((type) => [
			type,
			function () {
				console.groupCollapsed.apply(null, useParts());
				console[type].apply(null, arguments);
				console.groupEnd();
			}
		]));
	})();
	
	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
        const {
			Toasts,
			Logger,
			Patcher,
			Settings,
			Utilities,
			ContextMenu,
			Components,
			DOMTools,
			ReactTools,
			ReactComponents,
			DiscordModules,
			DiscordClasses,
			WebpackModules,
			DiscordSelectors,
			PluginUtilities
		} = Api;
		const {
			React,
			ReactDOM,
			ModalStack,
			Dispatcher: FluxDispatch,
			DiscordConstants,
			ContextMenuActions: MenuActions,
			RelationshipStore
		} = DiscordModules;
		const {
			SettingPanel,
			SettingField,
			SettingGroup,
			Switch
		} = Settings;
		const { getNestedProp: getProp } = Utilities;

		const {
			openModal,
			closeModal,
			hasModalOpen,
			useModalsStore,
			closeAllModals,
			hasAnyModalOpen
		} = WebpackModules.getByProps('openModal', 'closeModal');
		const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');
	
		const TooltipWrapper = WebpackModules.getByPrototypes('renderTooltip');
		const TextElement = WebpackModules.getByDisplayName('LegacyText');
	
		const at = Array.prototype.at ?? function at (index) {
			if ([-Infinity, +Infinity].includes(index)) return undefined;
			let i = Math.trunc(index) || 0;
			i = i < 0
				? this.length + i
				: i;
			if (i < 0 || i >= this.length) return undefined;
			return this[i];
		};
		const has = Object.prototype.hasOwnProperty;
		const slice = Array.prototype.slice;
		
		const Modals = WebpackModules.getByProps('ModalRoot');
		const LangUtils = WebpackModules.getByProps('getLocale', 'getLanguages');
		const Menu = WebpackModules.getByProps('MenuItem', 'MenuGroup', 'MenuSeparator');
		const ToggleMenuItem = WebpackModules.getByString('disabled', 'itemToggle');
		const ReadStateStore = WebpackModules.getByProps('ackMessageId', 'hasUnread');
		const guilds = WebpackModules.getByProps('wrapper', 'unreadMentionsIndicatorTop');
		const buttons = WebpackModules.getByProps('button');
		const positionedContainer = WebpackModules.getByProps('positionedContainer');
		const messagesWrapper = WebpackModules.getByProps('messages', 'messagesWrapper');
		const wrapper = WebpackModules.getByProps('messagesPopoutWrap');
		const scroller = WebpackModules.getByProps('scrollerWrap');
		const MessageClasses = {
			...WebpackModules.getByProps('messageCompact', 'headerCozy', 'username'),
			...WebpackModules.getByProps('message', 'groupStart')
		};
		const ContextMenuClasses = WebpackModules.getByProps('menu', 'scroller');
		const Lists = WebpackModules.getByProps('ListThin');

		const modalKey = 'HideUtils-SettingsModal';

		/**
		 * @returns {i18nStrings}
		 */
		const useStrings = () => {
			const [lang] = LangUtils.getLocale().split('-');
			return config.strings[lang] ?? config.strings.en;
		};
	
		const Button = (props) => {
			const style = props.style || {};
			return React.createElement('button', {
				style,
				className: props.className || 'button',
				onClick: props.action
			}, props.text);
		};

		const CloseButton = (props) => React.createElement('svg', {
			className: 'close-button',
			width: 16,
			height: 16,
			viewBox: '0 0 24 24',
			onClick: props.onClick
		},
			React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' }),
			React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' })
		);

		const ListText = (props) => React.createElement('li', {
			className: 'list-element-item'
		}, props.text);

		const ReactUL = (props) => {
			const children = (props.children ?? []).map((child) => React.createElement(ListText, { text: child }));
			return React.createElement('ul', {
				className: 'list-element',
				children: children
			});
		};

		const Modal = (props) => {
			const {
				SETTINGS_INSTRUCTIONS,
				SETTINGS_CHANNELS,
				SETTINGS_FOLDERS,
				SETTINGS_SERVERS,
				SETTINGS_USERS,
				INSTRUCTIONS_HOWTO,
				INSTRUCTIONS_HOWTO_EXT1,
				INSTRUCTIONS_HOWTO_EXT2,
				INSTRUCTIONS_NOTE,
				INSTRUCTIONS_NOTE_EXT1,
				INSTRUCTIONS_NOTE_EXT2
			} = useStrings();
			const { 1: forceUpdate } = React.useReducer((x) => x + 1, 0);

			const { name: label, isType, hasImage } = props;
			const data = [];
			const labels = {
				[SETTINGS_CHANNELS]: 'ID: {{id}}\nGuild: {{guild}}\nChannel: {{channel}}',
				[SETTINGS_SERVERS]: 'ID: {{id}}\nGuild: {{guild}}',
				[SETTINGS_FOLDERS]: 'ID: {{id}}\nName: {{name}}',
				[SETTINGS_USERS]: 'ID: {{id}}\nTag: {{tag}}'
			};

			const close = () => closeModal(modalKey);
			const replaceLabels = (label, data) => {
				if (!has.call(labels, label)) return null;
				const string = labels[label];

				if (label === SETTINGS_CHANNELS) return string
					.replace(/{{id}}/, data.id)
					.replace(/{{guild}}/, data.guild)
					.replace(/{{channel}}/, data.name);
	
				if (label === SETTINGS_SERVERS) return string
					.replace(/{{id}}/, data.id)
					.replace(/{{guild}}/, data.name);
	
				if (label === SETTINGS_FOLDERS) return string
					.replace(/{{id}}/, data.id)
					.replace(/{{name}}/, data.name);
	
				return string
					.replace(/{{id}}/, data.id)
					.replace(/{{tag}}/, data.tag);
			};

			if (props.data) {
				for (const entry of Object.values(props.data)) {
					if (Array.isArray(entry)) continue;

					const item = React.createElement(TooltipWrapper, {
						text: replaceLabels(label, entry),
						color: TooltipWrapper.Colors.PRIMARY,
						position: TooltipWrapper.Positions.TOP,
						children: (propsc) => {
							const type = isType.slice(0, -1);
							const style = {};

							if (hasImage) Object.assign(style, {
								backgroundImage: `url(${entry.icon})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								textShadow: '0 0 1px black, 0 0 2px black, 0 0 3px black'
							});

							return React.createElement('div', Object.assign({
								className: 'buttonWrapper'
							}, propsc),
								React.createElement(Button, {
									text: entry.name ? entry.name : entry.tag,
									className: `${type.toLowerCase()}-button`,
									style,
									action: () => {
										Dispatcher.dispatch(`HIDEUTILS_BUTTON_${type.toUpperCase()}CLEAR`, entry.id);
										forceUpdate();
									}
								})
							);
						}
					});

					data.push(item);
				}

				const count = React.createElement(TextElement, {
					color: TextElement.Colors.BRAND,
					size: TextElement.Sizes.SIZE_16,
					style: {
						textTransform: 'uppercase',
						borderBottom: '2px solid currentColor',
						marginBottom: '4px',
						fontWeight: 'bold'
					},
					children: [label, ' hidden \u2014 ', data.length]
				});

				data.unshift(count, React.createElement('hr', { style: { border: 'none' } }));
			} else {
				data.push(
					React.createElement('div', {
						id: 'HideUtils-Instructions',
						className: 'instructions'
					},	
						React.createElement(TextElement, {
							color: TextElement.Colors.STANDARD,
							children: [
								React.createElement(TextElement, {
									color: TextElement.Colors.BRAND,
									size: TextElement.Sizes.SIZE_16,
									style: {
										textTransform: 'uppercase',
										borderBottom: '2px solid currentColor',
										marginBottom: '4px',
										fontWeight: 'bold'
									},
									children: [INSTRUCTIONS_HOWTO]
								}),
								React.createElement(ReactUL, {
									children: [
										INSTRUCTIONS_HOWTO_EXT1,
										INSTRUCTIONS_HOWTO_EXT2
									]
								}),
								React.createElement('br', {}),
								React.createElement(TextElement, {
									color: TextElement.Colors.BRAND,
									size: TextElement.Sizes.SIZE_16,
									style: {
										textTransform: 'uppercase',
										borderBottom: '2px solid currentColor',
										marginBottom: '4px',
										fontWeight: 'bold'
									},
									children: [INSTRUCTIONS_NOTE]
								}),
								React.createElement(ReactUL, {
									children: [
										INSTRUCTIONS_NOTE_EXT1,
										INSTRUCTIONS_NOTE_EXT2
									]
								})
							]
						})
					)
				);
			}

			return React.createElement('div', {
				id: 'HideUtils-Modal',
				className: wrapper.messagesPopoutWrap
			},
				React.createElement('div', {
					id: 'HideUtils-Header',
					className: wrapper.header
				},
					React.createElement(CloseButton, {
						onClick: close
					}),
					React.createElement(TextElement, {
						className: wrapper.title,
						color: TextElement.Colors.STANDARD,
						size: TextElement.Sizes.SIZE_16,
						children: ['HideUtils \u2014 ', label]
					})
				),
				React.createElement('div', {
					className: scroller.scrollerWrap
				},
					React.createElement('div', {
						className: `${scroller.scroller} ${wrapper.messagesPopout} hu-pad8 hu-scrollable`,
						scrollable: true,
						children: data
					})
				)
			);
		};

		const Select = (props) => {
			const { SETTINGS_INSTRUCTIONS, SETTINGS_CHANNELS, SETTINGS_FOLDERS, SETTINGS_SERVERS, SETTINGS_USERS } = useStrings();
			const open = ({ name, data, isType, hasImage }) => {
				if (hasAnyModalOpen()) closeAllModals();
				openModal(() => React.createElement(Modal, { name, data, isType, hasImage }), { modalKey });
			};
			const buttons = [
				[SETTINGS_FOLDERS, props.folders, 'Folders'],
				[SETTINGS_CHANNELS, props.channels, 'Channels'],
				[SETTINGS_SERVERS, props.servers, 'Servers', true],
				[SETTINGS_USERS, props.users, 'Users', true],
				[SETTINGS_INSTRUCTIONS, null, 'Instructions']
			];
			return React.createElement('div', {
				id: 'HideUtils-Settings',
				className: 'HUSettings'
			},
				React.createElement('div', {
					id: 'Setting-Select',
					className: 'container'
				},
					React.createElement('h3', {
						className: 'settingsHeader'
					},
						React.createElement('div', {
							id: 'HideUtils-ButtonGroup',
							className: 'buttonGroup'
						},
							...buttons.map(([text, data, isType, hasImage]) => React.createElement(Button, {
								text,
								action: () => open({ name: text, data, isType, hasImage })
							}))
						)
					)
				)
			);
		};
	
		const SelectionField = class SelectionField extends SettingField {
			constructor(name, note, data, onChange) {
				super(name, note, onChange, Select, {
					users: data.users,
					servers: data.servers,
					folders: data.folders,
					channels: data.channels
				});
			}
		};

		const getChannel = DiscordModules.ChannelStore.getChannel;
		const getGuild = DiscordModules.GuildStore.getGuild;
		const getUser = DiscordModules.UserStore.getUser;
		const mute = WebpackModules.getByProps('setLocalVolume').setLocalVolume;
		
		let isBlocked;

		return class HideUtils extends Plugin {
			/**
			 * @type {string}
			 */
			#css;
			#meta;

			/**
			 * @param {MetaData} meta
			 */
			constructor(meta) {
				super();
				this.#meta = meta;
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = {
					channels: {},
					servers: { unhidden: [] },
					users: {},
					folders: {},
					hideBlocked: true
				};
				this.settings = null;
				this.css = `
					.theme-light #HideUtils-Header .close-button {
						fill: #72767d;
					}
					#HideUtils-Modal {
						pointer-events: all;
						-webkit-font-smoothing: subpixel-antialiased;
						-webkit-backface-visibility: hidden;
						backface-visibility: hidden;
						text-rendering: optimizeLegibility;
					}
					#HideUtils-Header + div > div:first-child {
						position: relative;
					}
					#HideUtils-Header .close-button {
						fill: white;
						cursor: pointer;
						opacity: 0.6;
						float: right;
						transition: opacity 200ms ease;
					}
					#HideUtils-Header .close-button:hover {
						opacity: 1;
					}
					#HideUtils-Settings {
						overflow-x: hidden;
					}
					#HideUtils-Settings h3 {
						text-align: center;
						color: #CCC;
					}
					#HideUtils-Settings #HideUtils-ButtonGroup .button {
						background: #7289DA;
						color: #FFF;
						border-radius: 5px;
						margin: 5px;
						height: 30px;
						width: auto;
						min-width: 6vw;
						padding: 0 1vw;
					}
					#HideUtils-Settings button,
					.buttonWrapper button {
						background: #7289DA;
						color: #FFF;
						width: 5vw;
						height: 30px;
						border-radius: 5px;
						padding: 0;
						font-size: 14px;
					}
					.buttonWrapper {
						display: inline-block;
						margin: 5px;
						overflow-y: auto;
					}
					.buttonWrapper button {
						/*overflow: hidden;
						width: 5vw;
						height: 30px;
						word-break: break-word;
						white-space: nowrap;
						text-overflow: ellipsis;*/
						min-height: 5vh;
						min-width: 5vw;
						height: 5vh;
						width: auto;
						max-height: 10vh;
						max-width: 10vw;
						font-size: 10pt;
						word-break: break-word;
						word-wrap: break-word;
						text-overflow: ellipsis;
						padding: 0 5px;
						display: flex;
						justify-content: center;
						align-items: center;
						overflow: hidden;
					}
					#HideUtils-Settings .icons .container::-webkit-scrollbar {
						width: 7px !important;
						background: rgba(0, 0, 0, 0.4);
					}
					#HideUtils-Settings .icons .container::-webkit-scrollbar-thumb {
						min-height: 20pt !important;
						min-width: 20pt !important;
						background: rgba(255, 255, 255, 0.6) !important;
					}
					#HideUtils-Instructions .list-element {
						margin: 8px 0 8px 6px;
					}
					#HideUtils-Instructions .list-element-item {
						position: relative;
						margin-left: 15px;
						margin-bottom: 8px;
					}
					#HideUtils-Instructions .list-element-item:last-child {
						margin-bottom: 0;
					}
					#HideUtils-Instructions .list-element-item::before {
						content: '';
						position: absolute;
						background: #DCDDDE;
						top: 10px;
						left: -15px;
						width: 6px;
						height: 6px;
						margin-top: -4px;
						margin-left: -3px;
						border-radius: 50%;
						opacity: 0.3;
					}
					.hu-pad8 {
						padding: 8px;
					}
					.hu-scrollable {
						overflow-y: scroll;
					}
					.theme-light #HideUtils-Instructions .list-element-item::before {
						background: #72767D;
					}
				`;
				this.userClear = this.userClear.bind(this);
				this.servClear = this.servClear.bind(this);
				this.chanClear = this.chanClear.bind(this);
				this.foldClear = this.foldClear.bind(this);
				this.subscriptions = [
					['USERCLEAR', this.userClear],
					['SERVERCLEAR', this.servClear],
					['FOLDERCLEAR', this.foldClear],
					['CHANNELCLEAR', this.chanClear]
				];
			}
	
			/* Methods */
	
			subscribe() {
				for (const [type, callback] of this.subscriptions) Dispatcher.subscribe(`HIDEUTILS_BUTTON_${type}`, callback);
			}
	
			unsubscribe() {
				for (const [type, callback] of this.subscriptions) Dispatcher.unsubscribe(`HIDEUTILS_BUTTON_${type}`, callback);
			}
	
			onStart() {
				this.promises.restore();
				PluginUtilities.addStyle(this.short, this.css);
				this.settings = this.loadSettings(this.default);
				this.subscribe();
				this.patchAll(this.promises.state);
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}
	
			onStop() {
				this.promises.cancel();
				PluginUtilities.removeStyle(this.short);
				this.unsubscribe();
				Patcher.unpatchAll();
				this.updateAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}
	
			patchAll(promiseState) {
				this.patchGuilds(promiseState);
				this.patchChannels(promiseState);
				this.patchMessages(promiseState);
				this.patchMemberList(promiseState);
				this.patchTypingUsers(promiseState);
				this.patchContextMenu(promiseState);
				this.patchIsMentioned(promiseState);
				this.patchReadStateStore(promiseState);
				this.patchReceiveMessages(promiseState);
				this.patchRelationshipStore(promiseState);
			}
	
			updateAll() {
				this.updateGuilds();
				this.updateChannels();
				this.updateMessages();
				this.updateMemberList();
				this.updateContextMenu();
			}

			patchReadStateStore(state) {
				if (state.cancelled) return;
				Patcher.instead(ReadStateStore, 'hasUnread', (that, args, value) => {
					const [channelId] = args;
					const channel = getChannel(channelId);
					if (!channel) return value.apply(that, args);
					const message = DiscordModules.MessageStore.getMessage(channelId, channel.lastMessageId);
					if (!message) return value.apply(that, args);
					if (has.call(this.settings.users, message.author.id)) return false;
					return value.apply(that, args);
				});
			}

			patchRelationshipStore(state) {
				if (state.cancelled) return;
				if (!RelationshipStore.isBlocked.__originalFunction) isBlocked = RelationshipStore.isBlocked;
				Patcher.instead(RelationshipStore, 'isBlocked', (that, args, value) => {
					const [id] = args;
					if (has.call(this.settings.users, id)) return true;
					return value.apply(that, args);
				});
			}
	
			patchReceiveMessages(state) {
				if (state.cancelled) return;
				Patcher.instead(DiscordModules.MessageActions, 'receiveMessage', (that, args, value) => {
					const [channelId, { author }] = args;
					const channel = getChannel(channelId);
					if (has.call(this.settings.users, author.id) || DiscordModules.RelationshipStore.isBlocked(author.id)) return false;
					if (has.call(this.settings.channels, channelId)) return false;
					const guild = getGuild(channel.guild_id);
					const isHiddenFolderMention = slice.call(Object.values(this.settings.folders)).some((folder) => {
						const servers = [...Object.values(folder.servers)];
						return servers.includes(channel.guild_id);
					});
					if (!guild) return value.apply(that, args);
					if (has.call(this.settings.servers, guild.id)) return false;
					if (isHiddenFolderMention) return false;
					return value.apply(that, args);
				});
			}
	
			patchIsMentioned(state) {
				if (state.cancelled) return;
				const Module = WebpackModules.getByProps('isMentioned', 'isRawMessageMentioned');
				const { getMentions } = WebpackModules.getByProps('getMentions');
				let o = getMentions();
				Patcher.instead(Module, 'isMentioned', (that, args, value) => {
					const { 0: currentUserId, 1: channelId, 3: mentionList } = args;
					const channel = getChannel(channelId);
					if (!channel) return value.apply(that, args);
					const guild = getGuild(channel.guild_id);
					const isHiddenFolderMention = () => slice.call(Object.values(this.settings.folders)).some((folder) => {
						const servers = [...Object.values(folder.servers)];
						return servers.includes(guild.id);
					});
					const n = getMentions() && o ? getMentions().filter((m) => !o.includes(m.id)) : [];
					if (!n.length) return value.apply(that, args);
					const thisMention = n.find((mention) => mention.channel_id === channelId && mention.mentions.includes(currentUserId));
					const mentionIndex = n.find((mention) => mention.channel_id === channelId && mention.mentions.includes(currentUserId));
					if (!thisMention) return value.apply(that, args);
					o = o.concat(n);
					getMentions().splice(mentionIndex, 1);
					const { author } = thisMention;
					if (author && has.call(this.settings.users, author.id) || has.call(this.settings.channels, channelId)) return false;
					if (!guild || !guild.id) return value.apply(that, args);
					if (has.call(this.settings.servers, guild.id) || isHiddenFolderMention()) return false;
					return value.apply(that, args);
				});
			}
	
			async patchTypingUsers(promiseState) {
				const { component: TypingUsers } = await ReactComponents.getComponentByName('TypingUsers', DiscordSelectors.Typing.typing.toString()); // WebpackModules.getByDisplayName('FluxContainer(TypingUsers)');
				if (promiseState.cancelled) return;
				Patcher.before(TypingUsers.prototype, 'render', ({ props: { typingUsers } }) => {
					for (const id of Object.keys(typingUsers)) has.call(this.settings.users, id) && delete typingUsers[id];
				}, { displayName: 'TypingUsers' });
			}

			/**
			 * @param {object} channel 
			 * @returns {ContextData}
			 */
			getChannelContextData(channel) {
				const { HIDE_CHANNEL, UNHIDE_CHANNEL } = useStrings();
				// const [guildShown, channelHid] = [
				// 	this.settings.servers.unhidden.includes(channel.guild_id),
				// 	has.call(this.settings.channels, channel.id)
				// ];

				switch (has.call(this.settings.channels, channel.id)) {
					case false: {
						return [
							HIDE_CHANNEL,
							() => {
								MenuActions.closeContextMenu();
								this.chanPush(channel.id);
							}
						];
					}
					default: {
						return [
							UNHIDE_CHANNEL,
							() => {
								MenuActions.closeContextMenu();
								this.chanClear(channel.id);
							}
						];
					}
				}
			}
	
			async patchChannelContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				const menuWasLoaded = await ReactComponents.getComponent('ChannelListTextChannelContextMenu', DiscordSelectors.ContextMenu.menu.value.trim(), (menu) => {
					return Utilities.findInTree(menu, (tree) => {
						return tree && tree.displayName === 'ChannelListTextChannelContextMenu';
					}, {
						walkable: [
							'return',
							'type'
						]
					});
				});
				const Context = WebpackModules.find((m) => m?.default?.displayName === 'useChannelMarkAsReadItem');
				if (!menuWasLoaded || !Context) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					const val = Array.isArray(value)
						? value.find((item) => !item.key)
						: value;

					const [channel] = args;
					const { props } = val;

					if (!props || props.id !== 'mark-channel-read' || !channel.guild_id || channel.type === 4) return value;

					const [label, action] = this.getChannelContextData(channel);
					const children = [
						React.createElement(Menu.MenuSeparator, {}),
						React.createElement(Menu.MenuItem, {
							id: 'hide-utils-hide-channel',
							key: 'HideUtils-MenuItem',
							label,
							action
						}),
						React.createElement(Menu.MenuSeparator, {})
					];

					const returnValue = [value].flat();
					if (!returnValue.some((item) => item.key === 'HideUtils-MenuItem')) returnValue.push(...children);

					return returnValue;
				});
				ContextMenu.forceUpdateMenus();
			}

			// async patchVoiceChannelContextMenu(promiseState) {
			// 	if (promiseState.cancelled) return;
			// 	const VoiceContext = await ContextMenu.getDiscordMenu('ChannelListVoiceChannelContextMenu');
			// 	if (!VoiceContext) return;
			// 	Patcher.after(VoiceContext, 'default', (that, args, value) => {
			// 		const [props] = args;
			// 		const channel = getProp(props, 'channel');
			// 		const orig = getProp(value, 'props.children.props');
			// 		const itemProps = {
			// 			id: 'hide-channel-hide-utils',
			// 			label: 'Hide Channel',
			// 			action: () => {
			// 				MenuActions.closeContextMenu();
			// 				this.chanPush(channel.id);
			// 			}
			// 		};
					
			// 		if (this.settings.servers.unhidden.includes(channel.guild_id) && has.call(this.settings.channels, channel.id)) {
			// 			itemProps.id = 'unhide-channel-hide-utils';
			// 			itemProps.label = 'Unhide Channel';
			// 			itemProps.action = () => {
			// 				MenuActions.closeContextMenu();
			// 				this.chanClear(channel.id);
			// 			};
			// 		}

			// 		const item = React.createElement(Menu.MenuItem, itemProps);
			// 		const group = React.createElement(Menu.MenuGroup, { children: item, key: 'HideUtils-MenuGroup' });
			// 		const fn = (item) => item?.key === 'HideUtils-MenuGroup';
	
			// 		if (!Array.isArray(orig.children)) orig.children = [orig.children];
			// 		if (!orig.children.some(fn)) orig.children.splice(2, 0, group);

			// 		return value;
			// 	});
			// 	ContextMenu.forceUpdateMenus();
			// }
	
			async patchGuildContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				const menuWasLoaded = await ReactComponents.getComponent('GuildContextMenuWrapper', DiscordSelectors.ContextMenu.menu.value.trim(), (menu) => {
					return Utilities.findInTree(menu, (tree) => {
						return tree && tree.displayName === 'GuildContextMenuWrapper';
					}, {
						walkable: [
							'return',
							'type'
						]
					});
				});
				const GuildContext = WebpackModules.find((m) => m?.default?.displayName === 'useGuildMarkAsReadItem');
				if (!menuWasLoaded || !GuildContext) return;
				Patcher.after(GuildContext, 'default', (that, args, value) => {
					const [props] = args;
					const val = Array.isArray(value)
						? value.find((n) => n && !n.key)
						: value;
					if (!has.call(props, 'ownerId') || !has.call(props, 'mfaLevel')) return value;
					const orig = getProp(val, 'props');
					const id = getProp(props, 'id');
	
					if (!orig || !id) return value;
					const active = this.settings.servers.unhidden.includes(id);

					const { HIDE_SERVER, UNHIDE_CHANNELS, PURGE_CHANNELS } = useStrings();
	
					const topSeparator = React.createElement(Menu.MenuSeparator, {});
					const bottomSeparator = React.cloneElement(topSeparator);
	
					const hideItem = React.createElement(Menu.MenuItem, {
						id: 'hide-server-hide-utils',
						label: HIDE_SERVER,
						action: () => {
							MenuActions.closeContextMenu();
							this.servPush(id);
							this.clearUnhiddenChannels(id);
						}
					});
	
					const unhideItem = React.createElement(Menu.MenuCheckboxItem, {
						id: 'unhide-channels-hide-utils',
						label: UNHIDE_CHANNELS,
						checked: active,
						action: () => {
							this.servUnhideChannels(id);
							this.updateContextMenu();
						}
					});
	
					const clearItem = React.createElement(Menu.MenuItem, {
						id: 'purge-channels-hide-utils',
						label: PURGE_CHANNELS,
						color: 'colorDanger',
						action: () => {
							MenuActions.closeContextMenu();
							this.chanPurge(id);
						}
					});
	
					const children = [
						topSeparator,
						hideItem,
						unhideItem,
						clearItem,
						bottomSeparator
					];
	
					// const group = React.createElement(Menu.MenuGroup, {
					// 	key: 'HideUtils-HideItemGroup',
					// 	children
					// });
					const fn = (child) => child && child.id && !child.id.endsWith('-hide-utils');
	
					if (!Array.isArray(value)) value = [value];
					if (!value.some(fn)) value.splice(1, 0, ...children);
	
					return value;
				});
				ContextMenu.forceUpdateMenus();
			}

			async patchGuildFolderContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				const Context = await ContextMenu.getDiscordMenu('GuildFolderContextMenu');
				if (!Context) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					const [props] = args;
					if (!props.folderId) return value;

					const children = getProp(value, 'props.children');
					if (!children || !Array.isArray(children)) return value;

					const { HIDE_FOLDER } = useStrings();

					const instance = ReactTools.getOwnerInstance(props.target);
					const topSeparator = React.createElement(Menu.MenuSeparator, {});
					const bottomSeparator = React.cloneElement(topSeparator);
					const folderItem = React.createElement(Menu.MenuItem, {
						id: 'hide-folder-hide-utils',
						label: HIDE_FOLDER,
						action: () => {
							MenuActions.closeContextMenu();
							this.foldPush(instance);
						}
					});
					const group = React.createElement(Menu.MenuGroup, { children: folderItem, key: 'HideUtils-ItemGroup' });

					const fn = (child) => child?.key === 'HideUtils-ItemGroup';
					if (children.some(fn)) return value;

					children.splice(1, 0, group);
					return value;
				});
				ContextMenu.forceUpdateMenus();
			}

			/**
			 * @param {string} id 
			 * @returns {ContextData}
			 */
			getUserContextData(id) {
				const { HIDE_USER, UNHIDE_USER } = useStrings();
				switch (has.call(this.settings.users, id)) {
					case false: {
						return [
							HIDE_USER,
							() => {
								MenuActions.closeContextMenu();
								this.userPush(id);
							}
						];
					}
					default: {
						return [
							UNHIDE_USER,
							() => {
								MenuActions.closeContextMenu();
								this.userClear(id);
							}
						];
					}
				}
			}
	
			async patchUserContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				const menuWasLoaded = await ReactComponents.getComponent('GuildChannelUserContextMenu', DiscordSelectors.ContextMenu.menu.value.trim(), (menu) => {
					return Utilities.findInTree(menu, (tree) => {
						return tree && tree.displayName === 'GuildChannelUserContextMenu';
					}, {
						walkable: [
							'return',
							'type'
						]
					});
				});
				const UserContext = WebpackModules.find((m) => m?.default?.displayName === 'useUserProfileItem');
				if (!menuWasLoaded || !UserContext) return;
				Patcher.after(UserContext, 'default', (that, args, value) => {
					const val = Array.isArray(value)
						? value.find((item) => !item.key)
						: value;

					if (!DiscordModules.SelectedGuildStore.getGuildId()) return value;

					const [userId, channelId] = args;
					const { props } = val;
					if (props.id !== 'user-profile') return value;

					const [label, action] = this.getUserContextData(userId);
					
					const children = [
						React.createElement(Menu.MenuSeparator, {}),
						React.createElement(Menu.MenuItem, {
							id: 'hide-user-hide-utils',
							key: 'HideUtils-MenuItem',
							label,
							action
						}),
						React.createElement(Menu.MenuSeparator, {})
					];

					const returnValue = [value].flat();
					if (!returnValue.some((item) => item.key === 'HideUtils-MenuItem')) returnValue.push(...children);

					return returnValue;
				});
				ContextMenu.forceUpdateMenus();
			}
	
			async patchContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				try {
					await Promise.all([
						this.patchUserContextMenu(promiseState),
						this.patchGuildContextMenu(promiseState),
						this.patchChannelContextMenu(promiseState),
						// this.patchVoiceChannelContextMenu(promiseState),
						this.patchGuildFolderContextMenu(promiseState)
					]);
				} catch (e) {
					error(e);
				}
			}
	
			updateContextMenu() {
				const menus = document.querySelectorAll(DiscordSelectors.ContextMenu.menu.value.trim());
				if (!menus.length) return;
				for (let i = 0, len = menus.length; i < len; i++) ReactTools.getOwnerInstance(menus[i]).forceUpdate();
			}
	
			updateContextPosition(m) {
				if (!m) return;
	
				let height = getProp(m, 'updatePosition');
				if (!height) height = getProp(m, 'props.onHeightUpdate');
				if (!height) height = getProp(m, '_reactInternalFiber.return.memoizedProps.onHeightUpdate');
				if (!height) height = getProp(m, '_reactInternalFiber.child.child.memoizedProps.onHeightUpdate');
	
				if (typeof height === 'function') height();
			}
	
			/**
			 * @name patchMessageComponent
			 * @author Zerebos
			 */
			async patchMessages(promiseState) {
				if (promiseState.cancelled) return;
				const forwardRef = WebpackModules.find((m) => {
					return m && ['ManagedReactiveScrollerProps', 'PinToBottomScrollerAuto', 'default'].every((prop) => has.call(m, prop));
				});
				if (!forwardRef) return;
				const original = forwardRef.default.render;
				Patcher.instead(forwardRef.default, 'render', (that, args, value) => {
					const render = original(...args);
					const props = getProp(render, 'props.children.props.children.props.children.1.props');
					if (!render || !props || !props['data-list-id'] || props['data-list-id'] !== 'chat-messages') return render;
					const children = getProp(props, 'children');
					const list = getProp(children, '1');
					if (!list) return render;
					children[1] = list.filter((message) => {
						if (!message || message.key && (message.key.includes('divider') || ['has-more', 'buffer'].some((k) => message.key === k))) return message;
						const author = getProp(message, 'props.message.author');
						const type = getProp(message, 'type.type');
						const blocked = Boolean((type && type.displayName && type.displayName === 'CollapsedMessages') && this.settings.hideBlocked);
						return !blocked && author && !has.call(this.settings.users, author.id) || !blocked && !author;
					});
					// props.channelStream = props.channelStream.filter(({ type, content }) => {
					// 	const author = getProp(content, `${Array.isArray(content) ? '0.content.' : ''}author`);
					// 	if (!author) return true;
					// 	if (type === 'MESSAGE_GROUP_BLOCKED' && this.settings.hideBlocked) return false;
					// 	if (type === 'DIVIDER') return true;
					// 	return !has.call(this.settings.users, author.id);
					// });
					return render;
				});
				this.updateMessages();
			}
	
			/**
			 * @alias forceUpdateMessages
			 */
			updateMessages() {
				const messages = DiscordModules.MessageStore.getMessages(DiscordModules.SelectedChannelStore.getChannelId());
				if (!messages || !messages.length) return;
				const msg = at.call(messages._array, -1);
				if (!msg) return;
				// Dispatcher.dispatch(DiscordConstants.ComponentActionsKeyed.ANIMATE_CHAT_AVATAR, data);
				FluxDispatch.wait(() => {
					FluxDispatch.dispatch({
						type: 'MESSAGE_UPDATE',
						message: msg
					});
				});
			}
	
			async patchGuilds(state) {
				const Guilds = await new Promise((resolve) => {
					const guildsWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
					if (!guildsWrapper) return resolve(null);
					const instance = ReactTools.getReactInstance(guildsWrapper);
					const forwarded = Utilities.findInTree(instance, (tree) => {
						if (!tree || !has.call(tree, '$$typeof')) return false;
						const forward = tree.$$typeof.description === 'react.forward_ref';
						const string = tree.render?.toString().includes('ltr');
						return forward && string;
					}, {
						walkable: [
							'type',
							'child',
							'sibling'
						]
					});
					if (instance && forwarded) resolve(forwarded);
					else resolve(null);
				});
				if (state.cancelled || !Guilds) return;
				Patcher.before(Guilds, 'render', (that, [guildnav, springRef], value) => {
					if (!guildnav || !guildnav.children || !guildnav.children.length) return;
					const list = guildnav.children.find((child) => child && child.type === 'div' && child.props['aria-label']);
					if (!list) return;
					list.props.children = list.props.children.filter((guild) => {
						const { folderNode } = guild.props;
						if (folderNode) {
							if (has.call(this.settings.folders, guild.key)) return false;
							folderNode.children = folderNode.children.filter(({ id }) => !has.call(this.settings.servers, id));
							if (!folderNode.children.length) return false;
							return true;
						}
						return !guild || !guild.key || !has.call(this.settings.servers, guild.key);
					});
				});
	
				this.updateGuilds();
			}
	
			updateGuilds() {
				const guildWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
				if (guildWrapper) ReactTools.getOwnerInstance(guildWrapper).forceUpdate();
			}
	
			patchMemberList(state) {
				if (state.cancelled) return;
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const [props] = args;
					if (!props || !props['data-list-id'] || !props['data-list-id'].startsWith('members')) return value;

					const target = Array.isArray(value)
						? value.find((i) => i && !i.key)
						: value;
					const childProps = getProp(target, 'props.children.0.props.children.props');
					if (!childProps) return value;
					const children = getProp(childProps, 'children');
					if (!children || !Array.isArray(children)) return value;
	
					childProps.children = children.filter((user) => {
						if (!user || !user.key || !user.key.startsWith('member')) return true;
						const { 1: id } = user.key.split('-');
						return !has.call(this.settings.users, id);
					}).map((entry, i, arr) => {
						// hide groups with no users under them
						if (!entry) return null;
						const { key } = entry;
						const next = arr[i + 1];
						const sect = (item) => item && item.key.startsWith('section-');
						const bool = sect(next);
						if (key.startsWith('section-') && bool) return null;
						return entry;
					});
	
					return value;
				});
	
				this.updateMemberList();
			}
	
			updateMemberList() {
				const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
				if (!memberList) return;
				const owner = ReactTools.getOwnerInstance(memberList);
				owner.forceUpdate();
				if (owner.handleScroll) owner.handleScroll();
			}
	
			patchChannels(state) {
				if (state.cancelled) return;
				const isTextChannel = (item) => item.type?.description === 'react.fragment';
				const isVoiceChannel = (item) => item.type?.displayName === 'ConnectedVoiceChannel';
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const [props] = args;
					if (!props || !props.id || !props.id.startsWith('channels')) return value;
					
					const childProps = getProp(value, 'props.children.0.props.children.props');
					const children = getProp(childProps, 'children');
					if (!children || !Array.isArray(children)) return value;
	
					const guildId = getProp(children, '1.props.channel.guild_id');
					if (this.settings.servers.unhidden.includes(guildId)) return value;
	
					childProps.children = children.filter((channel) => {
						if (!channel) return channel;
						if (isTextChannel(channel)) {
							const chans = getProp(channel, 'props.children');
							if (chans.length > 1 && chans[1] !== null) { // threads
								return channel;
							}
							const chan = getProp(chans, '0.props.channel');
							return chan && !has.call(this.settings.channels, chan.id);
						}
						if (isVoiceChannel(channel)) {
							const channelProps = getProp(channel, 'props');
							if (Array.isArray(channelProps.voiceStates)) {
								channelProps.voiceStates = channelProps.voiceStates.filter((user) => {
									if (!user) return user;
									const { voiceState: { userId } } = user;
									if (!has.call(this.settings.users, userId)) return true;
									mute(userId, 0);
									return false;
								});
							}
							return !has.call(this.settings.channels, channelProps.channel.id);
						}
						return channel;
					});
	
					return value;
				});
	
				this.updateChannels();
			}
	
			updateChannels() {
				const channels = document.querySelector(`.${positionedContainer.positionedContainer.replace(/\s/, '.')}`);
				if (channels) ReactTools.getOwnerInstance(channels).forceUpdate();
			}
	
			// processContextMenu(cm) {
				// if (!cm) return;
				// const inst = ReactTools.getReactInstance(cm);
				// const own = ReactTools.getOwnerInstance(cm);
				// const props = getProp(inst, 'memoizedProps');
				// const childProps = getProp(props, 'children.props');
				// if (!own || !props || !Array.isArray(childProps.children)) return;
				// if (props.id === 'user-context') return this.addUserContextItems(inst, own, cm);
				// else if (props.id === 'channel-context') return this.addChannelContextItems(inst, own, cm);
				// else if (props.id === 'guild-context') {
				// 	const readItem = getProp(childProps, 'children.0.props.children');
				// 	if (!readItem || Array.isArray(readItem)) return;
				// 	if (readItem.props.id === 'mark-folder-read') return this.addFolderContextItems(inst, own, cm);
				//  else if (readItem.props.id === 'mark-guild-read') return this.addGuildContextItems(inst, own, cm);
				// }
			// }
	
			// addUserContextItems(instance, owner, context) {
			// 	if (!DiscordModules.GuildStore.getGuild(DiscordModules.SelectedGuildStore.getGuildId())) return;
			// 	const group = new ContextMenu.ItemGroup();
			// 	const props = getProp(instance, 'return.return.return.return.return.memoizedProps');
			// 	if (!props) return;
			// 	const item = new ContextMenu.TextItem('Hide User', {
			// 		callback: (e) => {
			// 			MenuActions.closeContextMenu();
			// 			if (!props) return;
			// 			const { user: { id } } = props;
			// 			this.userPush(id);
			// 		}
			// 	});
			// 	const elements = item.getElement();
			// 	const groupEl = group.getElement();
			// 	elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
			// 	elements.setAttribute('role', 'menuitem');
			// 	elements.setAttribute('tabindex', '-1');
			// 	elements.firstChild.classList.add(ContextMenuClasses.label);
			// 	elements.addEventListener('mouseenter', (e) => {
			// 		if (elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.add(ContextMenuClasses.focused);
			// 	});
			// 	elements.addEventListener('mouseleave', (e) => {
			// 		if (!elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.remove(ContextMenuClasses.focused);
			// 	});
			// 	groupEl.removeAttribute('class');
			// 	groupEl.setAttribute('role', 'group');
			// 	// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
			// 	// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
			// 	group.addItems(item);
			// 	context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
			// 	setImmediate(() => this.updateContextPosition(owner));
			// }
	
			// addChannelContextItems(instance, owner, context) {
			// 	const group = new ContextMenu.ItemGroup();
			// 	const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
			// 	if (!ref.props.channel || typeof ref.props.channel.type === 'undefined' || ref.props.channel.type === 4) return;
			// 	const channel = getProp(ref, 'props.channel');
			// 	if (!channel) return;
			// 	const itemProps = {
			// 		label: 'Hide Channel',
			// 		action: (e) => {
			// 			MenuActions.closeContextMenu();
			// 			this.chanPush(channel.id);
			// 		}
			// 	};
			// 	if (this.settings.servers.unhidden.includes(channel.guild_id) && has.call(this.settings.channels, channel.id)) {
			// 		itemProps.label = 'Unhide Channel';
			// 		itemProps.action = (e) => {
			// 			MenuActions.closeContextMenu();
			// 			this.chanClear(channel.id);
			// 		};
			// 	}
			// 	const item = new ContextMenu.TextItem(itemProps.label, { callback: itemProps.action });
			// 	const elements = item.getElement();
			// 	const groupEl = group.getElement();
			// 	elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
			// 	elements.setAttribute('role', 'menuitem');
			// 	elements.setAttribute('tabindex', '-1');
			// 	elements.firstChild.classList.add(ContextMenuClasses.label);
			// 	elements.addEventListener('mouseenter', (e) => {
			// 		if (elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.add(ContextMenuClasses.focused);
			// 	});
			// 	elements.addEventListener('mouseleave', (e) => {
			// 		if (!elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.remove(ContextMenuClasses.focused);
			// 	});
			// 	groupEl.removeAttribute('class');
			// 	groupEl.setAttribute('role', 'group');
			// 	// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
			// 	// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
			// 	group.addItems(item);
			// 	context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
			// 	setImmediate(() => this.updateContextPosition(owner));
			// }
	
			// addGuildContextItems(instance, owner, context) {
			// 	const group = new ContextMenu.ItemGroup();
			// 	const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
			// 	const guild = getProp(ref, 'props.guild');
			// 	const checked = this.settings.servers.unhidden.includes(guild.id);
			// 	const item = new ContextMenu.TextItem('Hide Server', {
			// 		callback: (e) => {
			// 			MenuActions.closeContextMenu();
			// 			this.servPush(guild.id);
			// 			this.clearUnhiddenChannels(guild.id);
			// 		}
			// 	});
			// 	const toggle = new ContextMenu.ToggleItem('Unhide Channels', checked, {
			// 		callback: (e) => {
			// 			this.servUnhideChannels(guild.id);
			// 		}
			// 	});
			// 	const clear = new ContextMenu.TextItem('Purge Hidden Channels', {
			// 		danger: true,
			// 		callback: (e) => {
			// 			MenuActions.closeContextMenu();
			// 			this.chanPurge(guild.id);
			// 		}
			// 	});
			// 	const firstItem = item.getElement();
			// 	const secondItem = toggle.getElement();
			// 	const thirdItem = clear.getElement();
			// 	const groupEl = group.getElement();
			// 	const grouped = [firstItem, secondItem, thirdItem];
			// 	for (let i = 0; i < 3; i++) {
			// 		const elements = grouped[i];
			// 		elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
			// 		elements.setAttribute('role', 'menuitem');
			// 		elements.setAttribute('tabindex', '-1');
			// 		elements.firstChild.classList.add(ContextMenuClasses.label);
			// 		if (i === 2) elements.classList.add(ContextMenuClasses.colorDanger.split(' ')[0]);
			// 		elements.addEventListener('mouseenter', (e) => {
			// 			if (elements.classList.contains(ContextMenuClasses.focused)) return;
			// 			elements.classList.add(ContextMenuClasses.focused);
			// 		});
			// 		elements.addEventListener('mouseleave', (e) => {
			// 			if (!elements.classList.contains(ContextMenuClasses.focused)) return;
			// 			elements.classList.remove(ContextMenuClasses.focused);
			// 		});
			// 	}
			// 	groupEl.removeAttribute('class');
			// 	groupEl.setAttribute('role', 'group');
			// 	group.addItems(item, toggle, clear);
			// 	context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
			// 	setImmediate(() => this.updateContextPosition(owner));
			// }
	
			// addFolderContextItems(instance, owner, context) {
			// 	const group = new ContextMenu.ItemGroup();
			// 	const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
			// 	const target = getProp(ref, 'props.target');
			// 	if (!ref || !target) return;
			// 	const item = new ContextMenu.TextItem('Hide Folder', {
			// 		callback: (e) => {
			// 			MenuActions.closeContextMenu();
			// 			const [p] = DOMTools.parents(target, '.wrapper-3Njo_c');
			// 			if (!p) return;
			// 			const i = ReactTools.getOwnerInstance(p);
			// 			if (!i) return;
			// 			this.foldPush(i);
			// 		}
			// 	});
			// 	const elements = item.getElement();
			// 	const groupEl = group.getElement();
			// 	elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
			// 	elements.setAttribute('role', 'menuitem');
			// 	elements.setAttribute('tabindex', '-1');
			// 	elements.firstChild.classList.add(ContextMenuClasses.label);
			// 	elements.addEventListener('mouseenter', (e) => {
			// 		if (elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.add(ContextMenuClasses.focused);
			// 	});
			// 	elements.addEventListener('mouseleave', (e) => {
			// 		if (!elements.classList.contains(ContextMenuClasses.focused)) return;
			// 		elements.classList.remove(ContextMenuClasses.focused);
			// 	});
			// 	groupEl.removeAttribute('class');
			// 	groupEl.setAttribute('role', 'group');
			// 	// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
			// 	// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
			// 	group.addItems(item);
			// 	context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
			// 	setImmediate(() => this.updateContextPosition(owner));
			// }
	
			userPush(id) {
				const { TOASTS_USER_SUCCESS, TOASTS_USER_NOUSER, TOASTS_USER_FAILURE, TOASTS_USER_SELF_FAILURE } = useStrings();
				if (!id) return;
				const user = getUser(id);
				if (!user) return Toasts.error(TOASTS_USER_NOUSER, { timeout: 3e3 });
				if (has.call(this.settings.users, user.id)) return Toasts.info(TOASTS_USER_FAILURE, { timeout: 3e3 });
				if (id === DiscordModules.UserStore.getCurrentUser().id) return Toasts.info(TOASTS_USER_SELF_FAILURE, { timeout: 3e3 });
				this.settings.users[user.id] = {
					id: user.id,
					tag: user.tag,
					icon: user.getAvatarURL()
				};
				Toasts.info(TOASTS_USER_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			userClear(id) {
				const { TOASTS_USER_REMOVE_SUCCESS, TOASTS_USER_FAILURE2 } = useStrings();
				if (!id) return;
				if (!has.call(this.settings.users, id)) return Toasts.info(TOASTS_USER_FAILURE2, { timeout: 3e3 });
				try { mute(id, 100); } catch(e) { Logger.err(e); }
				delete this.settings.users[id];
				Toasts.info(TOASTS_USER_REMOVE_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				return this.updateAll();
			}
	
			clearUnhiddenChannels(id) {
				if (!id || !this.settings.servers.unhidden.includes(id)) return false;
				this.settings.servers.unhidden.splice(this.settings.servers.unhidden.indexOf(id), 1);
				return true;
			}
	
			pushToUnhiddenChannels(id) {
				if (!id || this.settings.servers.unhidden.includes(id)) return false;
				this.settings.servers.unhidden.push(id);
				return true;
			}
	
			servUnhideChannels(id) {
				if (!id) return;
				if (!this.clearUnhiddenChannels(id) && !this.pushToUnhiddenChannels(id)) return;
	
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			servPush(id) {
				const { TOASTS_GUILD_SUCCESS, TOASTS_GUILD_NOGUILD, TOASTS_GUILD_FAILURE } = useStrings();
				if (!id) return;
				if (has.call(this.settings.servers, id)) return Toasts.info(TOASTS_GUILD_FAILURE, { timeout: 3e3 });
				const guild = getGuild(id);
				if (!guild) return Toasts.info(TOASTS_GUILD_NOGUILD);
				this.settings.servers[id] = {
					id: guild.id,
					name: guild.name,
					icon: guild.getIconURL()
				};
				Toasts.info(TOASTS_GUILD_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			servClear(id) {
				const { TOASTS_GUILD_REMOVE_SUCCESS, TOASTS_GUILD_FAILURE2 } = useStrings();
				if (!id) return;
				if (!has.call(this.settings.servers, id)) return Toasts.info(TOASTS_GUILD_FAILURE2, { timeout: 3e3 });
				delete this.settings.servers[id];
				Toasts.info(TOASTS_GUILD_REMOVE_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanPush(id) {
				const { TOASTS_CHANNEL_SUCCESS, TOASTS_CHANNEL_NOCHANNEL, TOASTS_CHANNEL_FAILURE } = useStrings();
				if (!id) return;
				if (has.call(this.settings.channels, id)) return Toasts.info(TOASTS_CHANNEL_FAILURE, { timeout: 3e3 });
				const channel = getChannel(id);
				if (!channel) return Toasts.info(TOASTS_CHANNEL_NOCHANNEL, { timeout: 3e3 });
				const guild = getGuild(channel.guild_id);
				this.settings.channels[id] = {
					id: channel.id,
					name: channel.name,
					guild: guild.name
				};
				Toasts.info(TOASTS_CHANNEL_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanPurge(guildId) {
				const { TOASTS_PURGE_SUCCESS } = useStrings();
				const guild = getGuild(guildId);
				const channels = Object.values(this.settings.channels).filter((chan) => {
					const c = getChannel(chan.id);
					if (!c) return false;
					return c.guild_id === guildId;
				});
				for (const channel of channels) delete this.settings.channels[channel.id];
				Toasts.info(TOASTS_PURGE_SUCCESS.replace(/{{GUILD}}/, guild.name.trim()), { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanClear(id) {
				const { TOASTS_CHANNEL_REMOVE_SUCCESS, TOASTS_CHANNEL_FAILURE2 } = useStrings();
				if (!id) return;
				if (!has.call(this.settings.channels, id)) return Toasts.info(TOASTS_CHANNEL_FAILURE2, { timeout: 3e3 });
				delete this.settings.channels[id];
				Toasts.info(TOASTS_CHANNEL_REMOVE_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			foldPush(instance) {
				const { TOASTS_FOLDER_SUCCESS, TOASTS_FOLDER_FAILURE } = useStrings();
				if (!instance) return;
				const props = instance.props.children.props;
				const id = props.folderNode.id;
				if (has.call(this.settings.folders, id)) return Toasts.info(TOASTS_FOLDER_FAILURE, { timeout: 3e3 });
				this.settings.folders[id] = {
					id: id,
					name: props.folderNode.name || instance.props.ariaLabel,
					servers: (props.children || []).map(({ id }) => id)
				};
				Toasts.info(TOASTS_FOLDER_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			foldClear(id) {
				const { TOASTS_FOLDER_SUCCESS, TOASTS_FOLDER_FAILURE2 } = useStrings();
				if (!id) return;
				if (!has.call(this.settings.folders, id)) return Toasts.info(TOASTS_FOLDER_FAILURE2, { timeout: 3e3 });
				delete this.settings.folders[id];
				Toasts.info(TOASTS_FOLDER_SUCCESS, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			/* Observer */
			// observer({ addedNodes }) {
			// 	for (const node of addedNodes) {
			// 		if (!node) continue;
			// 		if (node.firstChild && node.firstChild.className && typeof node.firstChild.className === 'string' && node.firstChild.className.split(' ')[0] === ContextMenuClasses.menu.split(' ')[0]) {
			// 			this.processContextMenu(node.firstChild);
			// 		}
			// 	}
			// }
	
			/* Settings Panel */
	
			getSettingsPanel() {
				const {
					PLUGIN_SETTINGS_NAME,
					PLUGIN_SETTINGS_DESCRIPTION,
					PLUGIN_SETTINGS_BLOCK_NAME,
					PLUGIN_SETTINGS_BLOCK_DESCRIPTION
				} = useStrings();
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new SelectionField(`HideUtils ${PLUGIN_SETTINGS_NAME}`, PLUGIN_SETTINGS_DESCRIPTION, this.settings, () => {}),
						new Switch(PLUGIN_SETTINGS_BLOCK_NAME, PLUGIN_SETTINGS_BLOCK_DESCRIPTION, this.settings.hideBlocked, (i) => {
							this.settings.hideBlocked = i;
							this.updateAll();
						})
					)
				);
			}
	
			/* Setters */
	
			set css(style) {
				if (typeof style !== 'string') return;
				this.#css = style.split(/\s+/g).join(' ').trim();
			}
	
			/* Getters */
	
			get [Symbol.toStringTag]() {
				return 'Plugin';
			}
	
			get css() {
				return this.#css;
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
