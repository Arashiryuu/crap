//META{"name":"HideUtils","displayName":"HideUtils","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideUtils/HideUtils.plugin.js"}*//

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

var HideUtils = (() => {

	/* Setup */

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
			version: '2.0.9',
			description: 'Allows you to hide users, servers, and channels individually.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideUtils/HideUtils.plugin.js'
		},
		changelog: [
			{
				title: 'Evolving?',
				type: 'progress',
				items: ['Better handles blocked messages by unrendering them instead of hiding with css.', 'Prevents unread notifications from hidden/blocked users.']
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
		const { Toasts, Patcher, Settings, Utilities, DOMTools, ReactTools, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors } = Api;
		const { SettingPanel, SettingField, SettingGroup, Textbox } = Settings;
		
		const has = Object.prototype.hasOwnProperty;
		const MenuActions = DiscordModules.ContextMenuActions;
		const MenuItem = WebpackModules.getByString('disabled', 'brand');
		const guilds = WebpackModules.getByProps('wrapper', 'unreadMentionsIndicatorTop');
		const buttons = WebpackModules.getByProps('button');
		const positionedContainer = WebpackModules.getByProps('positionedContainer');
		const messagesWrapper = WebpackModules.getByProps('messages', 'messagesWrapper');
		
		return class HideUtils extends Plugin {
			constructor() {
				super();
				this._css;
				this.default = {
					channels: {},
					servers: {},
					users: {}
				};
				this.settings = Utilities.deepclone(this.default);
				this.css = `
					#HideUtils-Settings {
						overflow-x: hidden;
					}
					#HideUtils-Settings h3 {
						text-align: center;
						color: #CCC;
					}
					#HideUtils-Settings #HideUtils-buttonGroup {
						margin-top: -30px;
						padding: 5px;
						padding-left: 15%;
					}
					#HideUtils-Settings #HideUtils-buttonGroup button {
						background: #7289DA;
						color: #FFF;
						border-radius: 5px;
						margin: 5px;
						height: 30px;
						width: auto;
						min-width: 6vw;
						padding: 0 1vw;
					}
					#HideUtils-Settings button {
						background: #7289DA;
						color: #FFF;
						border-radius: 5px;
						height: 30px;
						width: 5vw;
						margin: 5px;
						padding: 0;
						font-size: 14px;
					}
					#HideUtils-Settings .buttonGroupi {
						padding-left: 20%;
					}
					#HideUtils-Settings #HideUtils-instructions {
						color: #BBB;
					}
					#HideUtils-Settings .icons {
						max-width: 80%;
						position: relative;
						left: 10%;
						display: flex;
						flex-flow: row wrap;
					}
					#HideUtils-Settings .icons .container {
						max-height: 6vh;
						overflow-y: auto;
						display: flex;
						flex-flow: row wrap;
					}
					#HideUtils-Settings .icons .container .button {
						background-repeat: no-repeat;
						background-position: center;
						background-size: cover;
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
					#ServerHideField, #ChanHideField, #UserHideField {
						resize: none;
						position: relative;
						left: 10%;
						width: 80%;
					}
				`;
				this.idRegex = /^\d{16,18}$/;
				this.channel;
				this.guild;
				this.user;
				this.mute;
			}

			/* Methods */

			setup() {
				this.channel = DiscordModules.ChannelStore.getChannel;
				this.guild = DiscordModules.GuildStore.getGuild;
				this.user = DiscordModules.UserStore.getUser;
				this.mute = WebpackModules.getByProps('setLocalVolume').setLocalVolume;
			}

			onStart() {
				this.loadSettings(this.settings);
				this.injectCSS();
				this.setup();
				this.patchAll();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				this.removeCSS();
				Patcher.unpatchAll();
				this.updateAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			patchAll() {
				this.patchGuilds();
				this.patchChannels();
				this.patchMessages();
				this.patchReceiveMessages();
				this.patchMemberList();
				this.patchTypingUsers();
				this.patchContextMenu();
			}

			updateAll() {
				this.updateGuilds();
				this.updateChannels();
				this.updateMessages();
				this.updateMemberList();
				this.updateContextMenu();
			}

			patchReceiveMessages() {
				Patcher.instead(DiscordModules.MessageActions, 'receiveMessage', (that, args, value) => {
					const [channelId, { author }] = args;
					if (has.call(this.settings.users, author.id) || DiscordModules.RelationshipStore.isBlocked(author.id)) return;
					return value(...args);
				});
			}

			async patchTypingUsers() {
				const { component: TypingUsers } = await ReactComponents.getComponentByName('TypingUsers', DiscordSelectors.Typing.typing.toString()); // WebpackModules.getByDisplayName('FluxContainer(TypingUsers)');
				Patcher.before(TypingUsers.prototype, 'render', ({ props: { typingUsers } }) => {
					for (const id in typingUsers) has.call(this.settings.users, id) && delete typingUsers[id];
				}, { displayName: 'TypingUsers' });
			}

			async patchChannelContextMenu() {
				const { component: ChannelContextMenu } = await ReactComponents.getComponentByName('ChannelContextMenu', DiscordSelectors.ContextMenu.contextMenu.toString());
				Patcher.after(ChannelContextMenu.prototype, 'render', (that, args, value) => {
					if (!that.props.type.startsWith('CHANNEL_LIST_')) return value;

					const orig = this.getProps(value, 'props.children.0.props');
					const item = new MenuItem({
						label: 'Hide Channel',
						action: () => {
							MenuActions.closeContextMenu();
							const channel = this.getProps(that, 'props.channel');
							this.chanPush(channel.id);
						}
					});

					if (Array.isArray(orig.children)) orig.children.unshift(item);
					else orig.children = [item, orig.children];

					setImmediate(() => this.updateContextPosition(that));

					return value;
				});
				this.updateContextMenu();
			}

			async patchGuildContextMenu() {
				const { component: GuildContextMenu } = await ReactComponents.getComponentByName('GuildContextMenu', DiscordSelectors.ContextMenu.contextMenu.toString());
				Patcher.after(GuildContextMenu.prototype, 'render', (that, args, value) => {
					const orig = this.getProps(value, 'props.children.0.props');
					const item = new MenuItem({
						label: 'Hide Server',
						action: () => {
							MenuActions.closeContextMenu();
							const guild = this.getProps(that, 'props.guild');
							this.servPush(guild.id);
						}
					});

					if (Array.isArray(orig.children)) orig.children.unshift(item);
					else orig.children = [item, orig.children];

					setImmediate(() => this.updateContextPosition(that));

					return value;
				});
				this.updateContextMenu();
			}

			async patchUserContextMenu() {
				const { component: UserContextMenu } = await ReactComponents.getComponentByName('UserContextMenu', DiscordSelectors.ContextMenu.contextMenu.toString());
				Patcher.after(UserContextMenu.prototype, 'render', (that, args, value) => {
					if (!DiscordModules.GuildStore.getGuild(DiscordModules.SelectedGuildStore.getGuildId())) return value;
					const orig = this.getProps(value, 'props.children.props.children.props.children.0.props');
					const item = new MenuItem({
						label: 'Hide User',
						action: () => {
							MenuActions.closeContextMenu();
							const user = this.getProps(that, 'props.user');
							this.userPush(user.id);
						}
					});

					if (Array.isArray(orig.children)) orig.children.unshift(item);
					else orig.children = [item, orig.children];

					setImmediate(() => this.updateContextPosition(that));

					return value;
				});
				this.updateContextMenu();
			}

			async patchContextMenu() {
				this.patchUserContextMenu();
				this.patchGuildContextMenu();
				this.patchChannelContextMenu();
			}

			updateContextMenu() {
				const menus = document.querySelectorAll(DiscordSelectors.ContextMenu.contextMenu.toString());
				for (let i = 0, len = menus.length; i < len; i++) ReactTools.getOwnerInstance(menus[i]).forceUpdate();
			}

			updateContextPosition(m) {
				if (!m) return;

				let height = this.getProps(m, 'props.onHeightUpdate');
				if (!height) height = this.getProps(m, '_reactInternalFiber.return.memoizedProps.onHeightUpdate');

				height && height();
			}

			/**
			 * @name patchMessageComponent
			 * @author Zerebos
			 */
			async patchMessages() {
				const { component: Message } = await ReactComponents.getComponentByName('Messages', `.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);

				Patcher.after(Message.prototype, 'render', (that, args, value) => {
					const props = this.getProps(value, 'props.children.1.props');
					const messageGroups = this.getProps(props, 'children');
					if (!messageGroups || !Array.isArray(messageGroups)) return value;

					props.children = messageGroups.filter((group) => {
						const author = this.getProps(group, 'props.children.props.messages.0.author');
						const blocked = group.key === '36' || group.type.displayName === 'BlockedMessageGroups';
						return !blocked && author && !has.call(this.settings.users, author.id) || !blocked && !author;
					});

					return value;
				});

				this.updateMessages();
			}

			/**
			 * @name forceUpdateMessages
			 * @author Zerebos
			 */
			updateMessages() {
				const messages = document.querySelector(`.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);
				if (messages) ReactTools.getOwnerInstance(messages).forceUpdate();
			}

			async patchGuilds() {
				const Guilds = await new Promise((resolve) => {
					const guildsWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
					if (guildsWrapper) return resolve(ReactTools.getOwnerInstance(guildsWrapper).constructor);
				});

				Patcher.after(Guilds.prototype, 'render', (that, args, value) => {
					const props = this.getProps(that, 'props');
					if (!props.guilds || !Array.isArray(props.guilds)) return value;

					const children = this.getProps(value, 'props.children.1.props.children');
					if (!children || !Array.isArray(children)) return value;

					const guildIndex = window.pluginCookie.OnlineFriendCount ? 5 : 4;
					const guilds = this.getProps(children, guildIndex.toString());
					if (!guilds || !Array.isArray(guilds)) return value;

					children[guildIndex] = guilds.filter((guild) => !guild || !guild.key || !has.call(this.settings.servers, guild.key));

					return value;
				});

				this.updateGuilds();
			}

			updateGuilds() {
				const guildWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
				if (guildWrapper) ReactTools.getOwnerInstance(guildWrapper).forceUpdate();
			}

			patchMemberList() {
				const Scroller = WebpackModules.getByDisplayName('VerticalScroller');

				Patcher.after(Scroller.prototype, 'render', (that, args, value) => {
					const key = this.getProps(that, 'props.children.2.0.key');
					if (typeof key === 'string' && key.includes('section-container')) return value;

					const children = this.getProps(value, 'props.children.0.props.children.1');
					if (!children || !Array.isArray(children)) return value;

					const memberlist = this.getProps(children, '2') || this.getProps(children, '1');
					if (!memberlist || !Array.isArray(memberlist)) return value;

					for (let i = 0, len = children.length; i < len; i++) {
						if (!Array.isArray(children[i])) continue;
						if (children[i].some((child) => child && child.type === 'header')) break;
						for (let j = 0, ren = children[i].length; j < ren; j++) children[i][j] && Array.isArray(children[i][j]) && (children[i][j] = children[i][j].filter((child) => !child || !child.key || (child.key && !has.call(this.settings.users, child.key))));
					}

					return value;
				});

				this.updateMemberList();
			}

			updateMemberList() {
				const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
				if (memberList) ReactTools.getOwnerInstance(memberList).handleOnScroll();
			}

			patchChannels() {
				const Scroller = WebpackModules.getByDisplayName('VerticalScroller');
				
				Patcher.after(Scroller.prototype, 'render', (that, args, value) => {
					const key = this.getProps(that, 'props.children.2.0.key');
					if (!key || !key.includes('section-container')) return value;

					const children = this.getProps(value, 'props.children.0.props.children.1.2');
					if (!children || !Array.isArray(children)) return value;

					for (let i = 0, len = children.length; i < len; i++) {
						const channels = this.getProps(children[i], 'props');
						const channelList = this.getProps(channels, 'children');
						if (!channelList || !Array.isArray(channelList)) continue;
						channels.children = channelList.filter((channel) => !channel || !channel.key || (channel.key && !has.call(this.settings.channels, channel.key)));
					}

					return value;
				});

				this.updateChannels();
			}

			updateChannels() {
				const channels = document.querySelector(`.${positionedContainer.positionedContainer.replace(/\s/, '.')}`);
				if (channels) ReactTools.getOwnerInstance(channels).forceUpdate();
			}

			injectCSS() {
				let sheet = document.getElementById(this.short);
				if (sheet) return;
				sheet = DOMTools.parseHTML(`<style id="${this.short}" type="text/css">${this.css}</style>`);
				DOMTools.appendTo(sheet, document.head);
			}

			removeCSS() {
				const sheet = document.getElementById(this.short);
				if (!sheet) return;
				sheet.remove();
			}

			resetField(field, text) {
				if (!field || !field.length || !text) return;
				field.val(text);
				setTimeout(() => field.val(''), 3e3);
			}

			userPush(id) {
				const field = $('#UserHideField');

				if (!field.length && !id) return;
				if (field.length && field.val()) {
					const val = field.val();
					if (!val.match(this.idRegex)) return this.resetField(field, 'Invalid ID.');
				}

				const user = this.user(id || (field.length && field.val()));
				if (!user) return Toasts.error('Unable to find user to hide.', { icon: true, timeout: 2e3 });

				if (has.call(this.settings.users, user.id)) {
					if (field.length) return this.resetField(field, 'This user is already being hidden.');
					return Toasts.info('This user is already being hidden.', { icon: true, timeout: 2e3 });
				}

				if ([id, field.val()].includes(DiscordModules.UserInfoStore.getId())) return Toasts.info('You cannot hide yourself.', { icon: true, timeout: 3e3 });

				this.settings.users[user.id] = {
					id: user.id,
					tag: user.tag,
					icon: user.getAvatarURL()
				};

				if (field.length) this.resetField(field, 'User successfully hidden.');
				else Toasts.info('User is now being hidden!', { icon: true, timeout: 2e3 });

				this.saveSettings(this.settings);
				this.updateAll();
			}

			userClear(id) {
				const field = $('#UserHideField');

				if (id) {
					if (!has.call(this.settings.users, id)) return Toasts.info('This user is not being hidden.', { icon: true, timeout: 2e3 });
					delete this.settings.users[id];
					this.resetField(field, 'User has been unhidden.');
					this.saveSettings(this.settings);
					return this.updateAll();
				}

				const val = field.val();
				if (!val) return this.resetField(field, 'Please provide a user ID to unhide.');

				const matches = val.match(this.idRegex);
				if (!matches || !matches.length) return this.resetField(field, 'Please provide a user ID to unhide.');

				const [matchedId] = matches;
				if (!has.call(this.settings.users, matchedId)) return this.resetField(field, 'That user is not currently being hidden.');
				if (!matchedId) return this.resetField(field, 'No ID provided.');

				delete this.settings.users[matchedId];
				this.resetField(field, 'User has been unhidden!');
				this.saveSettings(this.settings);
				this.updateAll();
			}

			servPush(id) {
				const field = $('#ServerHideField');

				if (!id) {
					const val = field.val();
					const matches = val.match(this.idRegex);
					if (!matches || !matches.length) return this.resetField(field, 'Please provide an ID.');
					const [matchedId] = matches;
					if (has.call(this.settings.servers, matchedId)) return this.resetField(field, 'This server is already being hidden.');
					const guild = this.guild(matchedId);
					if (!guild) return this.resetField(field, 'Unable to find server to hide.');
					this.settings.servers[matchedId] = {
						id: guild.id,
						name: guild.name,
						icon: guild.getIconURL()
					};
					this.resetField(field, 'Server has successfully been hidden.');
					this.saveSettings(this.settings);
					return this.updateAll();
				}

				if (has.call(this.settings.servers, id)) return Toasts.info('That server is already being hidden.', { icon: true, timeout: 3e3 });
				const guild = this.guild(id);
				if (!guild) return Toasts.info('Unable to find server to hide.');
				this.settings.servers[id] = {
					id: guild.id,
					name: guild.name,
					icon: guild.getIconURL()
				};
				Toasts.info('Server has successfully been hidden.', { icon: true, timeout: 2e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}

			servClear(id) {
				const field = $('#ServerHideField');

				if (!id) {
					const val = field.val();
					const matches = val.match(this.idRegex);
					if (!matches || !matches.length) return this.resetField(field, 'Please provide an ID.');
					const [matchedId] = matches;
					if (!has.call(this.settings.servers, matchedId)) return this.resetField(field, 'That server is not currently being hidden.');
					if (!matchedId) return this.resetField(field, 'No ID provided.');
					delete this.settings.servers[matchedId];
					this.resetField(field, 'Server has been unhidden.');
					this.saveSettings(this.settings);
					return this.updateAll();
				}

				if (!has.call(this.settings.servers, id)) return this.resetField(field, 'That server is not currently being hidden.', { icon: true, timeout: 3e3 });
				delete this.settings.servers[id];
				this.resetField(field, 'Server successfully removed!');
				this.saveSettings(this.settings);
				this.updateAll();
			}

			chanPush(id) {
				const field = $('#ChanHideField');

				if (!id) {
					const val = field.val();
					const matches = val.match(this.idRegex);
					if (!matches || !matches.length) return this.resetField(field, 'Please provide an ID.');
					const [matchedId] = matches;
					if (has.call(this.settings.channels, matchedId)) return this.resetField(field, 'That channel is already being hidden.');
					const channel = this.channel(matchedId);
					if (!channel) return this.resetField(field, 'Unable to find channel to hide.');
					const guild = this.guild(channel.guild_id);
					this.settings.channels[matchedId] = {
						id: channel.id,
						name: channel.name,
						guild: guild.name
					};
					this.resetField(field, 'Channel has successfully been hidden.');
					this.saveSettings(this.settings);
					this.updateAll();
				}

				if (has.call(this.settings.channels, id)) return Toasts.info('This channel is already being hidden.', { icon: true, timeout: 3e3 });
				const channel = this.channel(id);
				if (!channel) return Toasts.info('Unable to find channel to hide.', { icon: true, timeout: 3e3 });
				const guild = this.guild(channel.guild_id);
				this.settings.channels[id] = {
					id: channel.id,
					name: channel.name,
					guild: guild.name
				};
				Toasts.info('Channel has successfully been hidden.', { icon: true, timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}

			chanClear(id) {
				const field = $('#ChanHideField');

				if (!id) {
					const val = field.val();
					const matches = val.match(this.idRegex);
					if (!matches || !matches.length) return this.resetField(field, 'Please provide an ID.');
					const [matchedId] = matches;
					if (!has.call(this.settings.channels, matchedId)) return this.resetField(field, 'This channel is not currently being hidden.');
					if (!matchedId) return this.resetField(field, 'No ID provided.');
					delete this.settings.channels[matchedId];
					this.resetField(field, 'Channel successfully removed.');
					this.saveSettings(this.settings);
					return this.updateAll();
				}

				if (!has.call(this.settings.channels, id)) return this.resetField(field, 'This channel is not currently being hidden.');
				delete this.settings.channels[id];
				this.resetField(field, 'Channel successfully removed.');
				this.saveSettings(this.settings);
				this.updateAll();
			}

			/**
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
			}

			/* Settings Panel */

			getSettingsPanel() {
				return this.settingSelect();
			}

			settingSelect() {
				return `<div id="HideUtils-Settings" class="HUSettings">
					<div id="settingSelect" class="container">
						<h3 class="settingsHeader">Settings Selection</h3><br/><br/>
						<div id="HideUtils-buttonGroup" class="buttonGroup">
							<button id="HideUtils-channels" class="button" onclick=BdApi.getPlugin("${this.name}").channelSettings()>Channels</button>
							<button id="HideUtils-servers" class="button" onclick=BdApi.getPlugin("${this.name}").serverSettings()>Servers</button>
							<button id="HideUtils-users" class="button" onclick=BdApi.getPlugin("${this.name}").userSettings()>Users</button>
							<button id="HideUtils-instructions" class="button" onclick=BdApi.getPlugin("${this.name}").instructionPanel()>Instructions</button>
						</div>
					</div>
				</div>`;
			}

			channelSettings() {
				const settings = $('#HideUtils-Settings');
				settings.fadeOut();
				settings.fadeIn(1500);
				let html = `<div id="HideUtils-Settings-Inner" class="HUSettings">
					<div id="HideUtils-plugin-settings-div" class="scroller-fzNley container scroller">
						<h3>HideUtils Plugin \u2192 Settings \u2192 Channels</h3><br/><br/>
						<div id="ChannelIcons" class="icons">
						<div class="scroller-fzNley container scroller">`;

						if (Object.keys(this.settings.channels).length) {
							for (const entry of Object.values(this.settings.channels)) {
								html += `<button type="button" class="button" id="${entry.id}" title="${entry.guild ? entry.guild : entry.name}" onclick=BdApi.getPlugin("${this.name}").chanClear("${entry.id}")>${entry.name}</button>`;
							}
						}

						html += `</div></div><br/><br/>
						<input id="ChanHideField" type="text" placeholder="ID" /><br/><br/>
						<br/><div class="buttonGroupi">
						<button class="button apply" onclick=BdApi.getPlugin("${this.name}").chanPush()>Apply</button>
						<button class="button remove" onclick=BdApi.getPlugin("${this.name}").chanClear()>Remove</button>
						<button class="button save" onclick=BdApi.getPlugin("${this.name}").saveSettings()>Save</button>
						<button class="button load" onclick=BdApi.getPlugin("${this.name}").loadSettings()>Load</button>
						</div><br/><br/>
						<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.name}").returnSettings()>Return</button><br/>
					</div>
				</div>`;
				return setTimeout(() => settings.html(html), 5e2);
			}

			serverSettings() {
				const settings = $('#HideUtils-Settings');
				settings.fadeOut();
				settings.fadeIn(1800);
				let html = `<div id="HideUtils-Settings-Inner" class="HUSettings">
					<div id="HideUtils-plugin-settings-div" class="scroller-fzNley container scroller">
						<h3>HideUtils Plugin \u2192 Settings \u2192 Servers</h3><br/><br/>
						<div id="ServerIcons" class="icons">
						<div class="scroller-fzNley container scroller">`;

						if (Object.keys(this.settings.servers).length) {
							for (const entry of Object.values(this.settings.servers)) {
								html += `<button type="button" class="button" id="${entry.id}" title="${entry.name}" style="background-image: url(${entry.icon});" onclick=BdApi.getPlugin("${this.name}").servClear("${entry.id}")></button>`;
							}
						}

						html += `</div></div><br/><br/>
						<input id="ServerHideField" type="text" placeholder="ID" /><br/><br/>
						<br/><div class="buttonGroupi">
						<button class="button apply" onclick=BdApi.getPlugin("${this.name}").servPush()>Apply</button>
						<button class="button remove" onclick=BdApi.getPlugin("${this.name}").servClear()>Remove</button>
						<button class="button save" onclick=BdApi.getPlugin("${this.name}").saveSettings()>Save</button>
						<button class="button load" onclick=BdApi.getPlugin("${this.name}").loadSettings()>Load</button>
						</div><br/><br/>
						<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.name}").returnSettings()>Return</button><br/>
					</div>
				</div>`;
				return setTimeout(() => settings.html(html), 5e2);
			}

			userSettings() {
				const settings = $('#HideUtils-Settings');
				settings.fadeOut();
				settings.fadeIn(1800);
				let html = `<div id="HideUtils-Settings-Inner" class="HUSettings">
					<div id="HideUtils-plugin-settings-div" class="scroller-fzNley container scroller">
						<h3>HideUtils Plugin \u2192 Settings \u2192 Users</h3><br/><br/>
						<div id="UserIcons" class="icons">
						<div class="scroller-fzNley container scroller">`;

						if (Object.keys(this.settings.users).length) {
							for (const entry of Object.values(this.settings.users)) {
								html += `<button type="button" class="button" id="${entry.id}" title="${entry.tag}" style="background-image: url(${entry.icon});" onclick=BdApi.getPlugin("${this.name}").userClear("${entry.id}")></button>`;
							}
						}

						html += `</div></div><br/><br/>
						<input id="UserHideField" type="text" placeholder="ID" /><br/><br/>
						<br/><div class="buttonGroupi">
						<button class="button apply" onclick=BdApi.getPlugin("${this.name}").userPush()>Apply</button>
						<button class="button remove" onclick=BdApi.getPlugin("${this.name}").userClear()>Remove</button>
						<button class="button save" onclick=BdApi.getPlugin("${this.name}").saveSettings()>Save</button>
						<button class="button load" onclick=BdApi.getPlugin("${this.name}").loadSettings()>Load</button>
						</div><br/><br/>
						<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.name}").returnSettings()>Return</button><br/>
					</div>
				</div>`;
				return setTimeout(() => settings.html(html), 5e2);
			}

			instructionPanel() {
				const settings = $('#HideUtils-Settings');
				settings.fadeOut();
				settings.fadeIn(1800);
				return setTimeout(() => settings.html(`<div id="HideUtils-Settings-Inner" class="HUSettings">
					<div id="HideUtils-plugin-settings-div" class="container">
						<h3>HideUtils Plugin \u2192 Settings \u2192 Instructions</h3><br/>
						<p id="HideUtils-instructions" class="instructions">
						<b>[ A ]:</b><br/><br/>
						\u2022 Right-click on a channel, server, or user.<br/>
						\u2022\u2022 Left-click the hide option.<br/><br/>
						<b>[ B ]:</b><br/><br/>
						\u2022 User Settings \u2192 Appearance \u2192 Developer Mode, then right-click a user, channel, or server, and "Copy ID."<br/>
						\u2022\u2022 Insert the ID.<br/>
						\u2022\u2022\u2022 Click "apply."<br/><br/>
						<b>[ NOTE ]:</b><br/><br/>
						\u2022 Unhiding requires use of the settings-panel, and is not handled within a context-menu.
						</p><br/>
						<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.name}").returnSettings()>Return</button><br/>
					</div>
				</div>`), 5e2);
			}

			returnSettings() {
				const settings = $('#HideUtils-Settings');
				settings.fadeOut();
				settings.fadeIn(1500);
				return setTimeout(() => settings.html(this.settingSelect()), 5e2);
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
			window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
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
