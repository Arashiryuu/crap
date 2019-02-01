//META{"name":"HideUtils","displayName":"HideUtils","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap"}*//

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
			version: '1.2.2',
			description: 'Combination plugin packaging hideChannels, hideServers, and hideUsers into one.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideUtils/HideUtils.plugin.js'
		},
		changelog: [
			{
				title: 'What\'s New?',
				type: 'added',
				items: ['Now hides context menu on item click.']
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
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ReactComponents, DiscordModules, WebpackModules, DiscordSelectors, DiscordClasses, DiscordClassModules } = Api;
		
		return class HideUtils extends Plugin {
			constructor() {
				super();
				this._css;
				this.default = {
					channels: new Map(),
					servers: new Map(),
					users: new Map()
				};
				this.hid = {
					channels: new Map(),
					servers: new Map(),
					users: new Map()
				};
				this.switchList = [
					WebpackModules.getByProps('app').app,
					DiscordSelectors.TitleWrap.chat.value.split('.')[1],
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper
				];
				this.userList = [
					DiscordClasses.Messages.message.value,
					DiscordClasses.Messages.container.value,
					WebpackModules.getByProps('userDefault').userDefault
				];
				this.css = `
					.${WebpackModules.getByProps('messageGroupBlocked').messageGroupBlocked},
					.${WebpackModules.getByProps('unreadMentionsBar').unreadMentionsBar} {
						display: none;
					}
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
				this.chanItem = `<div class="itemGroup-1tL0uz HideUtils">
					<div class="item-1Yvehc hideChannel">
						<span>Hide Channel</span>
						<div class="hint-22uc-R"></div>
					</div>
				</div>`;
				this.servItem = `<div class="itemGroup-1tL0uz HideUtils">
					<div class="item-1Yvehc hideServer">
						<span>Hide Server</span>
						<div class="hint-22uc-R"></div>
					</div>
				</div>`;
				this.userItem = `<div class="itemGroup-1tL0uz HideUtils">
					<div class="item-1Yvehc hideUser">
						<span>Hide User</span>
						<div class="hint-22uc-R"></div>
					</div>
				</div>`;
				this.chanMO = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (node.classList && node.classList.contains(DiscordClasses.ContextMenu.contextMenu.value)) {
									this.auditChannels();
								}
							}
						}
					}
				});
				this.chanCon = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (node.nodeType === 1 && node.classList && node.classList.contains(DiscordClasses.ContextMenu.contextMenu.value)) {
									this.channelContext(node);
								}
								if (node.nodeType === 1 && node.classList && ( node.classList.contains('chat-3bRxxu') || node.classList.contains(WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper) )) {
									this.auditChannels();
									this.chanMO.disconnect();
									this.chanObs();
								}
							}
						}
					}
				});
				this.servMO = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (node.classList && node.classList.contains('guild-1EfMGQ')) {
									this.auditServers();
								}
							}
						}
					}
				});
				this.servCon = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (node.nodeType === 1 && node.classList && node.classList.contains(DiscordClasses.ContextMenu.contextMenu.value)) {
									this.serverContext(node);
								}
								if (node.nodeType === 1 && node.classList && ( node.classList.contains('chat-3bRxxu') || node.classList.contains(WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper) )) {
									this.auditServers();
									this.servDiscon();
									this.servObs();
								}
							}
						}
					}
				});
				this.userMO = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (this.getReactInstance(node) && this.getReactInstance(node).return && this.getReactInstance(node).return.memoizedProps.user && this.hid.users.has(this.getReactInstance(node).return.memoizedProps.user.id)) {
									this.auditUsers();
								}
							}
						}
					}
				});
				this.userCon = new MutationObserver((changes) => {
					for (const change of changes) {
						if (change.addedNodes) {
							for (const node of change.addedNodes.values()) {
								if (node.nodeType === 1 && node.classList && node.classList.contains(DiscordClasses.ContextMenu.contextMenu.value)) {
									this.userContext(node);
								}
								if (node.nodeType === 1 && node.classList && ( node.classList.contains('chat-3bRxxu') || node.classList.contains(WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper) || node.classList.contains(DiscordClasses.MemberList.membersWrap.value) )) {
									this.auditUsers();
									this.userDiscon();
									this.userObs();
								}
							}
						}
					}
				});
				this.channel;
				this.guild;
				this.user;
				this.mute;
			}

			/* Methods */

			onStart() {
				this.loadSettings();
				this.init();
				this.addCSS();
				const TypingUsers = WebpackModules.getByDisplayName('FluxContainer(TypingUsers)');
				Patcher.before(TypingUsers.prototype, 'render', (that, args, value) => {
					const { state: { typingUsers } } = that;
					for (const id in typingUsers) {
						if (this.hid.users.has(id)) delete typingUsers[id];
					}
				});
				Patcher.after(DiscordModules.RelationshipStore, 'isBlocked', (that, args, value) => {
					if (this.hid.users.has(args[0])) return false;
				});
				this.allObs();
				this.startHiding();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				Patcher.unpatchAll();
				this.removeCSS();
				this.allDiscon();
				this.stopHiding();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			init() {
				this.channel = DiscordModules.ChannelStore;
				this.guild = DiscordModules.GuildStore;
				this.user = DiscordModules.UserStore;
				this.mute = WebpackModules.getByProps('setLocalVolume').setLocalVolume;
			}

			addCSS() {
				BdApi.injectCSS(this.name + '-css', this.css);
			}

			removeCSS() {
				BdApi.clearCSS(this.name + '-css');
			}

			startHiding() {
				this.hideChannels();
				this.hideServers();
				this.hideUsers();
			}
		
			stopHiding() {
				this.auditChannels();
				this.auditServers();
				this.auditUsers();
			}
		
			appObs() {
				const app = document.querySelector('#app-mount');
				this.chanCon.observe(app, { childList: true, subtree: true });
				this.servCon.observe(app, { childList: true, subtree: true });
				this.userCon.observe(app, { childList: true, subtree: true });
			}
		
			appDiscon() {
				this.chanCon.disconnect();
				this.servCon.disconnect();
				this.userCon.disconnect();
			}
		
			moObs() {
				this.chanObs();
				this.servObs();
				this.userObs();
			}
		
			moDiscon() {
				this.chanDiscon();
				this.servDiscon();
				this.userDiscon();
			}
		
			allObs() {
				try {
					this.appObs();
					this.moObs();
				}
				catch(e) {
					Logger.err(e.stack);
				}
			}
		
			allDiscon() {
				this.appDiscon();
				this.moDiscon();
			}

			hideContext(context) {
				if (!context) return;
				$(context).hide();
			}
		
			channelContext(context) {
				if (!context) return;
				if (this.getReactInstance(context) && this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.type && this.getReactInstance(context).return.memoizedProps.type.includes('CHANNEL_LIST') && this.getReactInstance(context).return.memoizedProps.channel && (this.getReactInstance(context).return.memoizedProps.channel.type === 0 || this.getReactInstance($(DiscordSelectors.ContextMenu.contextMenu.value.trim())[0]).return.memoizedProps.channel.type === 2)) {
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim()).first().after(this.chanItem);
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim() + '.hideChannel')
						.off('click.HideUtilsC')
						.on('click.HideUtilsC', (o) => this.chanConClick());
				}
			}
		
			chanConClick() {
				const context = document.querySelector(DiscordSelectors.ContextMenu.contextMenu.value.trim());
				if (!context) return;
				const channel = this.getReactInstance(context).return.memoizedProps.channel;
				if (!channel) return;
				if (!this.hid.channels.has(channel.id)) {
					this.chanPush(channel.id);
					this.saveSettings();
					this.hideContext(context);
					this.auditChannels();
				}
			}
		
			auditChannels() {
				if (document.querySelector('div[class^="channels"] .containerDefault-1ZnADq')) {
					for (const channel of document.querySelectorAll('div[class^="channels"] .containerDefault-1ZnADq')) {
						const c = this.getReactInstance(channel);
						const r = this.getProps(c, 'return.memoizedProps.channel');
						if (c && r) {
							this.hid.channels.has(r.id) ? $(channel).hide() : $(channel).show();
						}
					}
				}
			}
		
			hideChannels() {
				if (!this.hid.channels.size) return;
				this.auditChannels();
			}
		
			chanPush(o) {
				if (o) {
					const chan = this.channel.getChannel(o);
					if (chan) {
						const guild = this.guild.getGuild(chan.guild_id);
						this.hid.channels.set(chan.id, {
							guild: guild.name,
							name: chan.name,
							id: chan.id
						});
						this.saveSettings();
						this.hideChannels();
					}
				} else {
					const field = $('#ChanHideField');
					const nChan = field.val();
					if (isNaN(nChan)) {
						field.val('Invalid entry: NaN; ID-Only.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nChan) {
						field.val('Invalid entry: No-entry.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nChan.match(/^\d{16,18}$/)) {
						field.val('Invalid entry: Invalid length or characters.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (this.hid.channels.has(nChan)) {
						field.val('Invalid entry: This channel is already being hidden.');
						return setTimeout(() => field.val(''), 2e3);
					}
					const chan = this.channel.getChannel(nChan);
					if (chan) {
						const guild = this.guild.getGuild(chan.guild_id);
						this.hid.channels.set(chan.id, {
							guild: guild.name,
							name: chan.name,
							id: chan.id
						});
						field.val(`${nChan} is now being hidden.`);
						setTimeout(() => field.val(''), 2e3);
						this.saveSettings();
						this.hideChannels();
					} else {
						field.val('Unable to find that channel to hide.');
						setTimeout(() => field.val(''), 2e3);
					}
				}
			}
		
			chanClear(o) {
				const field = $('#ChanHideField');
				if (o) {
					if (this.hid.channels.has(o)) {
						this.hid.channels.delete(o);
						this.saveSettings();
						$(`.button[id="${o}"]`).remove();
						field.val('Channel successfully removed!');
						setTimeout(() => field.val(''), 2e3);
						this.auditChannels();
					}
				} else {
					const oChan = field.val();
					if (this.hid.channels.size) {
						if (oChan.match(/^\d{16,18}$/) && this.hid.channels.has(oChan)) {
							this.hid.channels.delete(oChan);
							this.saveSettings();
							$(`.button[id="${o}"]`).remove();
							field.val('Channel successfully removed!');
							setTimeout(() => field.val(''), 2e3);
							this.auditChannels();
						} else if (oChan.match() && !this.hid.channels.has(oChan)) {
							field.val('This channel is not being hidden.');
							setTimeout(() => field.val(''), 2e3);
						} else {
							field.val('Cannot remove nothing.');
							setTimeout(() => field.val(''), 2e3);
						}
					}
				}
			}
		
			chanObs() {
				const chanWrap = document.querySelector('.scroller-2FKFPG');
				if (!chanWrap) return;
				this.chanMO.observe(chanWrap, { childList: true, subtree: true });
			}
		
			chanDiscon() {
				this.chanMO.disconnect();
			}
		
			serverContext(context) {
				if (!context) return;
				const ctx = this.getReactInstance(context);
				const props = this.getProps(ctx, 'return.memoizedProps');
				if (ctx && props.type === 'GUILD_ICON_BAR' && props.guild && !props.channel) {
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim()).first().after(this.servItem);
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim() + '.hideServer')
						.off('click.HideUtilsS')
						.on('click.HideUtilsS', (o) => this.servConClick());
				}
			}
		
			servConClick() {
				const context = document.querySelector(DiscordSelectors.ContextMenu.contextMenu.value.trim());
				if (!context) return;
				const guild = this.getProps(this.getReactInstance(context), 'return.memoizedProps.guild');
				if (!guild) return;
				const server = guild.id;
				if (!this.hid.servers.has(server)) {
					this.servPush(server);
					this.saveSettings();
					this.hideContext(context);
					this.hideServers();
				}
			}
		
			auditServers() {
				if (document.querySelector('.guild-1EfMGQ')) {
					for (const guild of document.querySelectorAll('.guild-1EfMGQ')) {
						const g = this.getReactInstance(guild);
						const s = this.getProps(g, 'return.memoizedProps.guild');
						if (g && s) {
							this.hid.servers.has(s.id) ? $(guild).hide() : $(guild).show();
						}
					}
				}
			}
		
			hideServers() {
				if (!this.hid.servers.size) return;
				this.auditServers();
			}
		
			servObs() {
				const guilds = document.querySelector('.guildsWrapper-5TJh6A');
				if (!guilds) return;
				this.servMO.observe(guilds, { childList: true, subtree: true });
			}
		
			servDiscon() {
				this.servMO.disconnect();
			}
		
			servPush(o) {
				if (o) {
					const server = this.guild.getGuild(o);
					if (server) {
						const icon = server.getIconURL();
						this.hid.servers.set(server.id, {
							icon,
							name: server.name,
							id: server.id
						});
						this.saveSettings();
						this.hideServers();
					} else {
						Logger.log('Unable to find that server to hide.');
					}
				} else {
					const field = $('#ServerHideField');
					const nServer = field.val();
					if (isNaN(nServer)) {
						field.val('Invalid entry: NaN; ID-Only.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nServer) {
						field.val('Invalid entry: No-entry.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nServer.match(/^\d{16,18}$/)) {
						field.val('Invalid entry: Invalid length or characters.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (this.hid.servers.has(nServer)) {
						field.val('Invalid entry: This server is already being hidden.');
						return setTimeout(() => field.val(''), 2e3);
					}
					const server = this.guild.getGuild(nServer);
					if (server) {
						const icon = server.getIconURL();
						this.hid.servers.set(server.id, {
							icon,
							name: server.name,
							id: server.id
						});
						field.val(`${server.name} (${server.id}) is now being hidden.`);
						setTimeout(() => field.val(''), 2e3);
						this.saveSettings();
						this.hideServers();
					} else {
						field.val('Unable to find that server to hide.');
						setTimeout(() => field.val(''), 2e3);
					}
				}
			}
		
			servClear(o) {
				const field = $('#ServerHideField');
				if (o) {
					if (this.hid.servers.has(o)) {
						this.hid.servers.delete(o);
						this.saveSettings();
						$(`.button[id="${o}"]`).remove();
						field.val('Server successfully removed!');
						setTimeout(() => field.val(''), 2e3);
						this.auditServers();
					} else {
						field.val('This server is not being hidden.');
						setTimeout(() => field.val(''), 2e3);
					}
				} else {
					const oServer = field.val();
					if (this.hid.servers.size) {
						if (oServer.match(/^\d{16,18}$/) && this.hid.servers.has(oServer)) {
							this.hid.servers.delete(oServer);
							this.saveSettings();
							$(`.button[id="${o}"]`).remove();
							field.val('Server successfully removed!');
							setTimeout(() => field.val(''), 2e3);
							this.auditServers();
						} else if (oServer.match(/^\d{16,18}$/) && !this.hid.servers.has(oServer)) {
							field.val('This server is not being hidden.');
							setTimeout(() => field.val(''), 2e3);
						} else {
							field.val('Cannot remove nothing.');
							setTimeout(() => field.val(''), 2e3);
						}
					}
				}
			}
		
			userContext(context) {
				if (!context) return;
				const ctx = this.getReactInstance(context);
				const props = this.getProps(ctx, 'return.return.return.return.memoizedProps');
				const user = this.getProps(props, 'user');
				if (!ctx || !user) return;
				const contexts = ['user-name', 'avatar-small', 'avatar-large', 'username-_4ZSMR', 'image-33JSyf', 'small-5Os1Bb', 'wrapper-2F3Zv8', 'avatar-17mtNa'];
				if (props.target && typeof props.target.className !== 'object' && ( contexts.some((n) => props.target.className.includes(n)) )) {
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim()).first().after(this.userItem);
					$(context).find('.item-1Yvehc.hideUser')
						.off('click.HideUtilsU')
						.on('click.HideUtilsU', (o) => this.userConClick(user.id));
				} else if (props.type && props.type === 'USER_FRIEND_LIST' && user) {
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim()).first().after(this.userItem);
					$(context).find(DiscordSelectors.ContextMenu.item.value.trim() + '.hideUser')
						.off('click.HideUtilsU')
						.on('click.HideUtilsU', (o) => this.userConClick(user.id));
				}
			}
		
			userConClick(userId) {
				const context = document.querySelector(DiscordSelectors.ContextMenu.contextMenu.value.trim());
				if (!context || !userId) return;
				if (DiscordModules.UserInfoStore.getId() === userId) return; // PluginUtilities.showToast('You cannot hide yourself.', { type: 'danger', icon: true, timeout: 3e3 });
				if (!this.hid.users.has(userId)) {
					this.userPush(userId);
					this.saveSettings();
					this.hideContext(context);
					this.hideUsers();
				}
			}
		
			auditUsers() {
				try {
					if (document.querySelector('.member-3W1lQa')) {
						for (const user of document.querySelectorAll('.member-3W1lQa')) {
							const reactUser = this.getReactInstance(user);
							const u = this.getProps(reactUser, 'return.memoizedProps.user');
							if (reactUser && u) {
								if (this.hid.users.has(u.id)) {
									$(user).hide();
									const group = $('.membersGroup-v9BXpm');
									if (group.length) {
										const filtered = group.filter((_, o) => user.compareDocumentPosition(o) === 2).last();
										if (user.previousElementSibling.className && user.previousElementSibling.className.includes('membersGroup-v9BXpm') && user.nextElementSibling.className && user.nextElementSibling.className.includes('membersGroup-v9BXpm')) {
											filtered.hide();
										}
									}
								} else {
									$(user).show();
									const group = $('.membersGroup-v9BXpm');
									if (group.length) {
										const filtered = group.filter((_, o) => user.compareDocumentPosition(o) === 2).last();
										if (user.previousElementSibling.className && user.previousElementSibling.className.includes('membersGroup-v9BXpm') && user.nextElementSibling.className && user.nextElementSibling.className.includes('membersGroup-v9BXpm')) {
											filtered.show();
										}
									}
								}
							}
						}
					}
					if (document.querySelector('.container-1YxwTf')) {
						for (const user of document.querySelectorAll('.container-1YxwTf')) {
							const instance = this.getReactInstance(user);
							const messages = this.getProps(instance, 'return.memoizedProps.messages');
							if (instance && messages && messages.length) {
								const { id } = messages[0].author;
								this.hid.users.has(id) ? $(user).hide() : $(user).show();
							}
						}
					}
					if (document.querySelector('.wrapperSelectedVoice-xzxa2u.wrapper-KpKNwI .userDefault-1qtQob')) {
						for (const user of document.querySelectorAll('.wrapperSelectedVoice-xzxa2u.wrapper-KpKNwI .userDefault-1qtQob')) {
							const reactUser = this.getReactInstance(user);
							const usr = this.getProps(reactUser, 'child.memoizedProps.user');
							if (reactUser && usr) {
								if (this.hid.users.has(usr.id)) {
									$(user).hide();
									this.mute(usr.id, 0);
								} else {
									$(user).show();
									this.mute(usr.id, 100);
								}
							}
						}
					}
				} catch(e) {
					Logger.err(e.stack);
				}
			}
		
			hideUsers() {
				if (!this.hid.users.size) return;
				this.auditUsers();
			}
			
			userObs() {
				const memWrap = document.querySelector('.membersWrap-2h-GB4');
				if (!memWrap) return;
				this.userMO.observe(memWrap, { childList: true, subtree: true });
			}
		
			userDiscon() {
				this.userMO.disconnect();
			}

			userPush(o) {
				if (o) {
					const user = this.user.getUser(o);
					if (user) {
						this.hid.users.set(user.id, {
							icon: user.avatarURL,
							tag: user.tag,
							id: user.id
						});
						this.saveSettings();
						this.hideUsers();
					} else {
						Logger.log('Unable to find that user to hide.');
					}
				} else {
					const field = $('#UserHideField');
					const nUser = field.val();
					if (isNaN(nUser)) {
						field.val('Invalid entry: NaN; ID-Only.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nUser) {
						field.val('Invalid entry: No-entry.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (!nUser.match(/^\d{17,18}$/)) {
						field.val('Invalid entry: Invalid length or characters.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (this.hid.users.has(nUser)) {
						field.val('Invalid entry: This user is already being hidden.');
						return setTimeout(() => field.val(''), 2e3);
					}
					else if (DiscordModules.UserInfoStore.getId() === nUser) {
						field.val('Invalid entry: You cannot hide yourself.');
						return setTimeout(() => field.val(''), 2e3);
					}
					const user = this.user.getUser(nUser);
					if (user) {
						this.hid.users.set(user.id, {
							icon: user.avatarURL,
							tag: user.tag,
							id: user.id
						});
						field.val(`${user.username} (${nUser}) is now being hidden.`);
						setTimeout(() => field.val(''), 2e3);
						this.saveSettings();
						this.hideUsers();
					} else {
						field.val('Unable to find that user to hide.');
						setTimeout(() => field.val(''), 2e3);
					}
				}
			}
		
			userClear(o) {
				const field = $('#UserHideField');
				if (o) {
					if (this.hid.users.has(o)) {
						this.hid.users.delete(o);
						this.saveSettings();
						$(`.button[id="${o}"]`).remove();
						field.val('User successfully removed!');
						setTimeout(() => field.val(''), 2e3);
						this.auditUsers();
					} else {
						field.val('Cannot remove users that are not being hidden.');
					}
				} else {
					const oUser = field.val();
					if (this.hid.users.size) {
						if (oUser.match(/^\d{17,18}$/) && this.hid.users.has(oUser)) {
							this.hid.users.delete(oUser);
							this.saveSettings();
							$(`.button[id="${o}"]`).remove();
							field.val('User successfully removed!');
							setTimeout(() => field.val(''), 2e3);
							this.auditUsers();
						} else if (oUser.match(/^\d{17,18}$/) && !this.hid.users.has(oUser)) {
							field.val('That user is not being hidden.');
							setTimeout(() => field.val(''), 2e3);
						} else {
							field.val('Cannot remove nothing.');
							setTimeout(() => field.val(''), 2e3);
						}
					}
				}
			}

			/* Observer */

			observer({ addedNodes, removedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.userList.includes(addedNodes[0].classList[0])) {
					this.auditUsers();
				} else if (removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('folder')) {
					this.auditServers();
				}
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

			/**
			 * Function to return the react internal data of the element.
			 * @name getInternalInstance
			 * @param {Element} node The element we want the internal data from.
			 * @author noodlebox
			 * @returns {Object}
			 */
			getReactInstance(node) {
				return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
			}

			/* Settings */

			saveSettings() {
				try {
					BdApi.saveData('HideUtils', 'settings', JSON.stringify(this.hid));
					return true;
				} catch(e) {
					Logger.err(e);
					return false;
				}
			}

			loadSettings() {
				const settings = BdApi.loadData('HideUtils', 'settings');
				if (!settings) return Toasts.show('HideUtils settings do not exist or are unable to be loaded.', { type: 'info', icon: true, timeout: 3e3 });
				const parsed = JSON.parse(settings);
				if (!parsed.hasOwnProperty('channels') || !(parsed instanceof Object)) return Toasts.show('HideUtils settings do not exist or are unable to be loaded.', { type: 'info', icon: true, timeout: 3e3 });
				for (const [key, data] of Object.entries(parsed)) {
					for (const entry of data) this.hid[key].set(entry[0], entry[1]);
				}
				return Toasts.show('HideUtils settings found and successfully loaded.', { type: 'success', icon: true, timeout: 3e3 });
			}

			resetSettings() {
				for (const entry in this.default) this.hid[entry] = this.default[entry];
				return true;
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

						if (this.hid.channels.size) {
							for (const entry of this.hid.channels.values()) {
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

						if (this.hid.servers.size) {
							for (const entry of this.hid.servers.values()) {
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

						if (this.hid.users.size) {
							for (const entry of this.hid.users.values()) {
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

			/* Settings Panel */

			getSettingsPanel() {
				return this.settingSelect();
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
		}
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
