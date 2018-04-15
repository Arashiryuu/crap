//META{"name":"HideUtils"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

class HideUtils {
	constructor() {
		this.initialized = false;

		this.default = {
			channels: new Map(),
			servers: new Map(),
			users: new Map()
		};
		this.hid = this.default;
		
		this.TypingUsers;
		this.Cancel;

		this.user;
		this.guild;
		this.channel;

		this.blockCSS = `<style id="HideUtils-Block-CSS" type="text/css">
			.message-group-blocked,
			.unread-mentions-bar {
				display: none;
			}
		</style>`;

		this.settingsCSS = `<style id="HideUtils-Settings-CSS" type="text/css">
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
		</style>`;

		this.chanItem = `<div class="itemGroup-oViAgA HideUtils">
			<div class="item-1XYaYf hideChannel">
				<span>Hide Channel</span>
				<div class="hint-3TJykr"></div>
			</div>
		</div>`;

		this.servItem = `<div class="itemGroup-oViAgA HideUtils">
			<div class="item-1XYaYf hideServer">
				<span>Hide Server</span>
				<div class="hint-3TJykr"></div>
			</div>
		</div>`;

		this.userItem = `<div class="itemGroup-oViAgA HideUtils">
			<div class="item-1XYaYf hideUser">
				<span>Hide User</span>
				<div class="hint-3TJykr"></div>
			</div>
		</div>`;

		this.chanMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.classList && node.classList.contains('containerDefault-7RImuF')) {
							this.auditChannels();
						}
					}
				}
			}
		});

		this.chanCon = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.nodeType === 1 && node.classList && node.classList.contains('contextMenu-uoJTbz')) {
							this.channelContext(node);
						}
						if(node.nodeType === 1 && node.classList && ( node.classList.contains('chat') || node.classList.contains('messages-wrapper') )) {
							this.auditChannels();
							this.chanMO.disconnect();
							this.chanObs();
						}
					}
				}
			}
		});

		this.servMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.classList && node.classList.contains('guild')) {
							this.auditServers();
						}
					}
				}
			}
		});

		this.servCon = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.nodeType === 1 && node.classList && node.classList.contains('contextMenu-uoJTbz')) {
							this.serverContext(node);
						}
						if(node.nodeType === 1 && node.classList && ( node.classList.contains('chat') || node.classList.contains('messages-wrapper') )) {
							this.auditServers();
							this.servDiscon();
							this.servObs();
						}
					}
				}
			}
		});

		this.userMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(this.getReactInstance(node) && this.getReactInstance(node).return && this.getReactInstance(node).return.memoizedProps.user && this.hid.users.has(this.getReactInstance(node).return.memoizedProps.user.id)) {
							this.auditUsers();
						}
					}
				}
			}
		});

		this.userCon = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.nodeType === 1 && node.classList && node.classList.contains('contextMenu-uoJTbz')) {
							this.userContext(node);
						}
						if(node.nodeType === 1 && node.classList && ( node.classList.contains('chat') || node.classList.contains('messages-wrapper') || node.classList.contains('channel-members-wrap') )) {
							this.auditUsers();
							this.userDiscon();
							this.userObs();
						}
					}
				}
			}
		});
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		this.Cancel();
		this.hid = this.default;
		$('#HideUtils-Block-CSS, #HideUtils-Settings-CSS').remove();
		this.allDiscon();
		$('*').off('click.HideUtilsC, click.HideUtilsS, click.HideUtilsU');
		this.stopHiding();
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		let libraryScript = $('#zeresLibraryScript');
		if(libraryScript) libraryScript.remove();
		libraryScript = $('<script/>', {
			id: 'zeresLibraryScript',
			src: 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js',
			type: 'text/javascript'
		});
		$('head').append(libraryScript);

		if(typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.on('load', () => this.initialize());
	}

	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.downLink);

		const findByProps = InternalUtilities.WebpackModules.findByUniqueProperties;

		this.channel = findByProps(['getChannel']);
		this.guild = findByProps(['getGuild']);
		this.user = findByProps(['getUser']);
		this.loadSettings();
		this.TypingUsers = InternalUtilities.WebpackModules.findByDisplayName('TypingUsers');
		this.Cancel = InternalUtilities.monkeyPatch(this.TypingUsers.prototype, 'render', {
			before: (data) => {
				const { thisObject: { state: { typingUsers } } } = data;
				for(const user of this.hid.users.keys()) {
					if(typingUsers[user]) delete typingUsers[user];
				}
			}
		});
		$('head').append(this.blockCSS, this.settingsCSS);
		this.allObs();
		this.initialized = true;
		this.startHiding();

		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`, { type: 'info', icon: true, timeout: 2e3 });
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
			this.err(e.stack);
		}
	}

	allDiscon() {
		this.appDiscon();
		this.moDiscon();
	}

	channelContext(context) {
		if(!context) return;
		if(this.getReactInstance(context) && this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.type && this.getReactInstance(context).return.memoizedProps.type.includes('CHANNEL_LIST') && this.getReactInstance(context).return.memoizedProps.channel && (this.getReactInstance(context).return.memoizedProps.channel.type === 0 || this.getReactInstance($('.contextMenu-uoJTbz')[0]).return.memoizedProps.channel.type === 2)) {
			$(context).find('.item-1XYaYf').first().after(this.chanItem);
			$(context).find('.item-1XYaYf.hideChannel')
				.off('click.HideUtilC')
				.on('click.HideUtilC', (o) => this.chanConClick());
		}
	}

	chanConClick() {
		if(!document.querySelector('.contextMenu-uoJTbz')) return;
		if(!this.getReactInstance(document.querySelector('.contextMenu-uoJTbz')).return.memoizedProps.channel) return;
		const channel = this.getReactInstance(document.querySelector('.contextMenu-uoJTbz')).return.memoizedProps.channel.id;
		if(!this.hid.channels.has(channel)) {
			this.chanPush(channel);
			this.saveSettings();
			this.auditChannels();
		}
	}

	auditChannels() {
		if(document.querySelector('div[class^="channels"] .containerDefault-7RImuF')) {
			$('div[class^="channels"] .containerDefault-7RImuF').each((_, channel) => {
				if(this.getReactInstance(channel) && this.getReactInstance(channel).return.memoizedProps.channel)
					this.hid.channels.has(this.getReactInstance(channel).return.memoizedProps.channel.id) ? $(channel).hide() : $(channel).show();
			});
		}
	}

	hideChannels() {
		if(!this.hid.channels.size) return;
		this.auditChannels();
	}

	chanPush(o) {
		if(o) {
			const chan = this.channel.getChannel(o);
			if(chan) {
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
			const field = $('#ChanblockField');
			const nChan = field.val();
			if(isNaN(nChan)) {
				field.val('Invalid entry: NaN; ID-Only.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nChan) {
				field.val('Invalid entry: No-entry.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nChan.match(/^\d{16,18}$/)) {
				field.val('Invalid entry: Invalid length or characters.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(this.hid.channels.has(nChan)) {
				field.val('Invalid entry: This channel is already being hidden.');
				return setTimeout(() => field.val(''), 2e3);
			}
			const chan = this.channel.getChannel(nChan);
			if(chan) {
				this.hid.channels.set(chan.id, {
					guild: chan.guild_id,
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
		const field = $('#ChanblockField');
		if(o) {
			if(this.hid.channels.has(o)) {
				this.hid.channels.delete(o);
				this.saveSettings();
				$(`.button[id="${o}"]`).remove();
				field.val('Channel successfully removed!');
				setTimeout(() => field.val(''), 2e3);
				this.auditChannels();
			}
		} else {
			const oChan = field.val();
			if(this.hid.channels.size) {
				if(oChan.match(/^\d{16,18}$/) && this.hid.channels.has(oChan)) {
					this.hid.channels.delete(oChan);
					this.saveSettings();
					$(`.button[id="${o}"]`).remove();
					field.val('Channel successfully removed!');
					setTimeout(() => field.val(''), 2e3);
					this.auditChannels();
				} else if(oChan.match() && !this.hid.channels.has(oChan)) {
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
		const chanWrap = document.querySelector('.scroller-NXV0-d');
		if(!chanWrap) return;
		this.chanMO.observe(chanWrap, { childList: true, subtree: true });
	}

	chanDiscon() {
		this.chanMO.disconnect();
	}

	serverContext(context) {
		if(!context) return;
		if(this.getReactInstance(context) && this.getReactInstance(context).return.memoizedProps.type === 'GUILD_ICON_BAR' && this.getReactInstance(context).return.memoizedProps.guild && !this.getReactInstance(context).return.memoizedProps.channel) {
			$(context).find('.item-1XYaYf').first().after(this.servItem);
			$(context).find('.item-1XYaYf.hideServer')
				.off('click.HideUtilsS')
				.on('click.HideUtilsS', (o) => this.servConClick());
		}
	}

	servConClick() {
		const context = document.querySelector('.contextMenu-uoJTbz');
		if(!context) return;
		if(!this.getReactInstance(context).return.memoizedProps.guild) return;
		const server = this.getReactInstance(context).return.memoizedProps.guild.id;
		if(!this.hid.servers.has(server)) {
			this.servPush(server);
			this.saveSettings();
			this.hideServers();
		}
	}

	auditServers() {
		if(document.querySelector('.guild')) {
			$('.guild').each((_, guild) => {
				if(guild instanceof Element && this.getReactInstance(guild) && this.getReactInstance(guild).return.memoizedProps.guild)
					this.hid.servers.has(this.getReactInstance(guild).return.memoizedProps.guild.id) ? $(guild).hide() : $(guild).show();
			});
		}
	}

	hideServers() {
		if(!this.hid.servers.size) return;
		this.auditServers();
	}

	servObs() {
		const guilds = document.querySelector('.guilds-wrapper');
		if(!guilds) return;
		this.servMO.observe(guilds, { childList: true, subtree: true });
	}

	servDiscon() {
		this.servMO.disconnect();
	}

	servPush(o) {
		if(o) {
			const server = this.guild.getGuild(o);
			if(server) {
				const icon = $(`a[style*="${server.id}"]`).attr('style').split('"')[1];
				this.hid.servers.set(server.id, {
					icon,
					name: server.name,
					id: server.id
				});
				this.saveSettings();
				this.hideServers();
			} else {
				this.log('Unable to find that server to hide.');
			}
		} else {
			const field = $('#ServerHideField');
			const nServer = field.val();
			if(isNaN(nServer)) {
				field.val('Invalid entry: NaN; ID-Only.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nServer) {
				field.val('Invalid entry: No-entry.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nServer.match(/^\d{16,18}$/)) {
				field.val('Invalid entry: Invalid length or characters.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(this.hid.servers.has(nServer)) {
				field.val('Invalid entry: This server is already being hidden.');
				return setTimeout(() => field.val(''), 2e3);
			}
			const server = this.guild.getGuild(nServer);
			if(server) {
				const icon = $(`a[style*="${server.id}"]`).attr('style').split('"')[1];
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
		if(o) {
			if(this.hid.servers.has(o)) {
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
			if(this.hid.servers.size) {
				if(oServer.match(/^\d{16,18}$/) && this.hid.servers.has(oServer)) {
					this.hid.servers.delete(oServer);
					this.saveSettings();
					$(`.button[id="${o}"]`).remove();
					field.val('Server successfully removed!');
					setTimeout(() => field.val(''), 2e3);
					this.auditServers();
				} else if(oServer.match(/^\d{16,18}$/) && !this.hid.servers.has(oServer)) {
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
		if(!context) return;
		if(!this.getReactInstance(context) || !this.getReactInstance(context).return.memoizedProps.user) return;
		const contexts = ['user-name', 'avatar-small', 'avatar-large', 'username-MwOsla', 'image-EVRGPw', 'small-TEeAkX', 'avatarWrapper-3E-a5I'];
		if(this.getReactInstance(context).return.memoizedProps.target && ( contexts.some((n) => this.getReactInstance(context).return.memoizedProps.target.className.includes(n)) )) {
			$(context).find('.item-1XYaYf').first().after(this.userItem);
			$(context).find('.item-1XYaYf.hideUser')
				.off('click.HideUtilsU')
				.on('click.HideUtilsU', (o) => this.userConClick());
		} else
		if(this.getReactInstance(context).return.memoizedProps.type && this.getReactInstance(context).return.memoizedProps.type === 'USER_FRIEND_LIST' && this.getReactInstance(context).return.memoizedProps.user) {
			$(context).find('.item-1XYaYf').first().after(this.userItem);
			$(context).find('.item-1XYaYf.hideUser')
				.off('click.HideUtilsU')
				.on('click.HideUtilsU', (o) => this.userConClick());
		}
	}

	userConClick() {
		const context = document.querySelector('.contextMenu-uoJTbz');
		if(!context) return;
		if(!this.getReactInstance(context).return.memoizedProps.user) return;
		const user = this.getReactInstance(context).return.memoizedProps.user.id;
		if(!this.hid.users.has(user)) {
			this.userPush(user);
			this.saveSettings();
			this.hideUsers();
		}
	}

	auditUsers() {
		try {
			if(document.querySelector('.member') || document.querySelector('.member-2FrNV0')) {
				$('.member, .member-2FrNV0').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.memoizedProps.user) {
						if(this.hid.users.has(this.getReactInstance(user).return.memoizedProps.user.id)) {
							$(user).hide();
							const group = $('.membersGroup-3_dP5E');
							if(group.length) {
								const filtered = group.filter((_, o) => user.compareDocumentPosition(o) === 2).last();
								if(user.previousElementSibling.className && user.previousElementSibling.className.includes('membersGroup-3_dP5E') && user.nextElementSibling.className && user.nextElementSibling.className.includes('membersGroup-3_dP5E')) {
									filtered.hide();
								}
							}
						} else {
							$(user).show();
							const group = $('.membersGroup-3_dP5E');
							if(group.length) {
								const filtered = group.filter((_, o) => user.compareDocumentPosition(o) === 2).last();
								if(user.previousElementSibling.className && user.previousElementSibling.className.includes('membersGroup-3_dP5E') && user.nextElementSibling.className && user.nextElementSibling.className.includes('membersGroup-3_dP5E')) {
									filtered.show();
								}
							}
						}
					}
				});
			}
			if(document.querySelector('.message-group')) {
				$('.message-group.hide-overflow').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.memoizedProps.messages && this.getReactInstance(user).return.memoizedProps.messages[0] && this.getReactInstance(user).return.memoizedProps.messages[0].author)
						this.hid.users.has(this.getReactInstance(user).return.memoizedProps.messages[0].author.id) ? $(user).hide() : $(user).show();
				});
				if($('.message-group:not(.hide-overflow)').length) {
					$('.message-group:not(.hide-overflow)').each((_, user) => {
						if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.key && this.getReactInstance(user).return.key.includes('upload')  && this.getReactInstance(user).return.memoizedProps.user)
							this.hid.users.has(this.getReactInstance(user).return.memoizedProps.user.id) ? $(user).hide() : $(user).show();
					});
				}
			}
			if(document.querySelector('.wrapperSelectedVoice-1Q1ocJ.wrapper-fDmxzK ~ .listDefault-3i7eWQ')) {
				$('.wrapperSelectedVoice-1Q1ocJ.wrapper-fDmxzK ~ .listDefault-3i7eWQ').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).child.memoizedProps.user)
						this.hid.users.has(this.getReactInstance(user).child.memoizedProps.user.id) ? $(user).hide() : $(user).show();
				});
			}
		} catch(e) {
			this.err(e.stack);
		}
	}

	hideUsers() {
		if(!this.hid.users.size) return;
		this.auditUsers();
	}
	
	userObs() {
		const memWrap = document.querySelector('.membersWrap-3wRngy');
		if(!memWrap) return;
		this.userMO.observe(memWrap, { childList: true, subtree: true });
	}

	userDiscon() {
		this.userMO.disconnect();
	}

	userPush(o) {
		if(o) {
			const user = this.user.getUser(o);
			if(user) {
				this.hid.users.set(user.id, {
					icon: user.avatarURL,
					tag: user.tag,
					id: user.id
				});
				this.saveSettings();
				this.hideUsers();
			} else {
				this.log('Unable to find that user to hide.');
			}
		} else {
			const field = $('#blockField');
			const nUser = field.val();
			if(isNaN(nUser)) {
				field.val('Invalid entry: NaN; ID-Only.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nUser) {
				field.val('Invalid entry: No-entry.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(!nUser.match(/^\d{17,18}$/)) {
				field.val('Invalid entry: Invalid length or characters.');
				return setTimeout(() => field.val(''), 2e3);
			}
			else if(this.hid.users.has(nUser)) {
				field.val('Invalid entry: This user is already being hidden.');
				return setTimeout(() => field.val(''), 2e3);
			}
			const user = this.user.getUser(nUser);
			if(user) {
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
		const field = $('#blockField');
		if(o) {
			if(this.hid.users.has(o)) {
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
			if(this.hid.users.size) {
				if(oUser.match(/^\d{17,18}$/) && this.hid.users.has(oUser)) {
					this.hid.users.delete(oUser);
					this.saveSettings();
					$(`.button[id="${o}"]`).remove();
					field.val('User successfully removed!');
					setTimeout(() => field.val(''), 2e3);
					this.auditUsers();
				} else if(oUser.match(/^\d{17,18}$/) && !this.hid.users.has(oUser)) {
					field.val('That user is not being hidden.');
					setTimeout(() => field.val(''), 2e3);
				} else {
					field.val('Cannot remove nothing.');
					setTimeout(() => field.val(''), 2e3);
				}
			}
		}
	}

	saveSettings() {
		try {
			bdPluginStorage.set('HideUtils', 'new-settings', JSON.stringify(this.hid));
			return true;
		} catch(e) {
			this.err(e);
			return false;
		}
	}

	loadSettings() {
		const settings = bdPluginStorage.get('HideUtils', 'new-settings');
		if(settings) {
			const parsed = JSON.parse(settings);
			if(parsed instanceof Object && parsed.hasOwnProperty('channels')) {
				for(const [key, data] of Object.entries(parsed)) {
					for(const entry of data) {
						this.hid[key].set(entry[0], entry[1]);
					}
				}
				return PluginUtilities.showToast('HideUtils settings found and successfully loaded.', { type: 'success', icon: true, timeout: 3e3 });
			}
			return PluginUtilities.showToast('HideUtils settings do not exist or are unable to be loaded.', { type: 'info', icon: true, timeout: 3e3 });
		}
		return PluginUtilities.showToast('HideUtils settings do not exist or are unable to be loaded.', { type: 'info', icon: true, timeout: 3e3 });
	}

	settingSelect() {
		return `<div id="HideUtils-Settings" class="HUSettings">
			<div id="settingSelect" class="container">
				<h3 class="settingsHeader">Settings Selection</h3><br/><br/>
				<div id="HideUtils-buttonGroup" class="buttonGroup">
					<button id="HideUtils-channels" class="button" onclick=BdApi.getPlugin("${this.getName()}").channelSettings()>Channels</button>
					<button id="HideUtils-servers" class="button" onclick=BdApi.getPlugin("${this.getName()}").serverSettings()>Servers</button>
					<button id="HideUtils-users" class="button" onclick=BdApi.getPlugin("${this.getName()}").userSettings()>Users</button>
					<button id="HideUtils-instructions" class="button" onclick=BdApi.getPlugin("${this.getName()}").instructionPanel()>Instructions</button>
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

				if(this.hid.channels.size) {
					for(const entry of this.hid.channels.values()) {
						html += `<button type="button" class="button" id="${entry.id}" title="${entry.guild ? entry.guild : entry.name}" onclick=BdApi.getPlugin("${this.getName()}").chanClear("${entry.id}")>${entry.name}</button>`;
					}
				}

				html += `</div></div><br/><br/>
				<input id="ChanblockField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="button apply" onclick=BdApi.getPlugin("${this.getName()}").chanPush()>Apply</button>
				<button class="button remove" onclick=BdApi.getPlugin("${this.getName()}").chanClear()>Remove</button>
				<button class="button save" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="button load" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
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

				if(this.hid.servers.size) {
					for(const entry of this.hid.servers.values()) {
						html += `<button type="button" class="button" id="${entry.id}" title="${entry.name}" style="background-image: url(${entry.icon});" onclick=BdApi.getPlugin("${this.getName()}").servClear("${entry.id}")></button>`;
					}
				}

				html += `</div></div><br/><br/>
				<input id="ServerHideField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="button apply" onclick=BdApi.getPlugin("${this.getName()}").servPush()>Apply</button>
				<button class="button remove" onclick=BdApi.getPlugin("${this.getName()}").servClear()>Remove</button>
				<button class="button save" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="button load" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
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

				if(this.hid.users.size) {
					for(const entry of this.hid.users.values()) {
						html += `<button type="button" class="button" id="${entry.id}" title="${entry.tag}" style="background-image: url(${entry.icon});" onclick=BdApi.getPlugin("${this.getName()}").userClear("${entry.id}")></button>`;
					}
				}

				html += `</div></div><br/><br/>
				<input id="blockField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="button apply" onclick=BdApi.getPlugin("${this.getName()}").userPush()>Apply</button>
				<button class="button remove" onclick=BdApi.getPlugin("${this.getName()}").userClear()>Remove</button>
				<button class="button save" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="button load" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
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
				<button id="HideUtils-Return" class="button returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
			</div>
		</div>`), 5e2);
	}

	returnSettings() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1500);
		return setTimeout(() => settings.html(this.settingSelect()), 5e2);
	}

	get settings() {
		return this.hid;
	}

	observer({ addedNodes, removedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && ( addedNodes[0].classList.contains('message') || addedNodes[0].classList.contains('message-group') || addedNodes[0].classList.contains('listDefault-3i7eWQ') )) {
			this.auditUsers();
		}
		if(removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('folder')) {
			this.auditServers();
		}
	}
	
	/**
	 * @name getInternalInstance
	 * @description Function to return the react internal data of the element
	 * @param {Node} node - the element we want the internal data from
	 * @author noodlebox
	 * @returns {Node}
	 */
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	}

	log(...extra) {
		return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', ...extra);
	}

	err(...e) {
		return console.error(`[%c${this.getName()}%c]`, 'color: #59F;', '', ...e);
	}

	get downLink() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.getName()}/${this.getName()}.plugin.js`;
	}

	getName() {
		return 'HideUtils';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.1.5';
	}

	getDescription() {
		return 'Combination plugin packaging hideChannels, hideServers, and hideUsers into one.';
	}

	getSettingsPanel() {
		return this.settingSelect();
	}
};

/*@end@*/
