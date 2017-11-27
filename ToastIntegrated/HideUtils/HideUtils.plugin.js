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

		this.hid = {
			channels: [],
			servers: [],
			users: []
		};

		this.blockCSS = `<style id="hideUsersCSS" type="text/css">
			.message-group-blocked { display: none; }
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
				width: 6vw;
			}
			#HideUtils-Settings button {
				background: #7289DA;
				color: #FFF;
				border-radius: 5px;
				height: 30px;
				width: 5vw;
				margin: 5px;
			}
			#HideUtils-Settings .buttonGroupi {
				padding-left: 20%;
			}
			#HideUtils-Settings #HideUtils-instructions {
				color: #BBB;
			}
		</style>`;

		this.chanItem = `<div class="item-group HideUtils">
			<div class="item hideChannel">
				<span>Hide Channel</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.servItem = `<div class="item-group HideUtils">
			<div class="item hideServer">
				<span>Hide Server</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.userItem = `<div class="item-group HideUtils">
			<div class="item hideUser">
				<span>Hide User</span>
				<div class="hint"></div>
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
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
							this.channelContext(node);
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
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
							this.serverContext(node);
						}
					}
				}
			}
		});

		this.userMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(this.getReactInstance(node).return.return.memoizedProps.user && this.hid.users.includes(this.getReactInstance(node).return.return.memoizedProps.user.id)) {
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
						if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
							this.userContext(node);
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
		this.hid = {
			channels: [],
			servers: [],
			users: []
		};
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
		const settings = bdPluginStorage.get('HideUtils', 'settings');
		if(!settings) {
			this.log('No settings found.');
		} else {
			this.hid = JSON.parse(settings);
			this.log('Settings found and loaded. Settings are:', this.hid);
		}
		$('head').append(this.blockCSS, this.settingsCSS);
		this.allObs();
		this.initialized = true;
		this.startHiding();
		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
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
		const app = document.querySelector('.app');
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
		this.chanMO.disconnect();
		this.servMO.disconnect();
		this.userMO.disconnect();
	}

	allObs() {
		this.appObs();
		this.moObs();
	}

	allDiscon() {
		this.appDiscon();
		this.moDiscon();
	}

	channelContext(context) {
		if(!context) return;
		if(this.getReactInstance(context) && this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.type.includes('CHANNEL_LIST') && this.getReactInstance(context).return.memoizedProps.channel && (this.getReactInstance(context).return.memoizedProps.channel.type === 0 || this.getReactInstance($('.context-menu')[0]).return.memoizedProps.channel.type === 2)) {
			$(context).find('.item').first().after(this.chanItem);
			$(context).find('.item.hideChannel')
				.off('click.HideUtilC')
				.on('click.HideUtilC', this.chanConClick.bind(this));
		}
	}

	chanConClick() {
		if(!document.querySelector('.context-menu')) return;
		if(!this.getReactInstance(document.querySelector('.context-menu')).return.memoizedProps.channel) return;
		const channel = this.getReactInstance(document.querySelector('.context-menu')).return.memoizedProps.channel.id;
		if(!this.hid.channels.includes(channel)) {
			this.hid.channels.push(channel);
			this.saveSettings();
			this.auditChannels();
		}
	}

	auditChannels() {
		if(document.querySelector('div[class^="channels"] .containerDefault-7RImuF')) {
			$('div[class^="channels"] .containerDefault-7RImuF').each((_, channel) => {
				if(this.getReactInstance(channel) && this.getReactInstance(channel).return.memoizedProps.channel)
					this.hid.channels.includes(this.getReactInstance(channel).return.memoizedProps.channel.id) ? $(channel).hide() : $(channel).show();
			});
		}
	}

	hideChannels() {
		if(!this.hid.channels.length) return;
		this.auditChannels();
	}

	chanPush() {
		const field = $('#ChanblockField');
		const nChan = field.val();
		if(isNaN(nChan)) {
			field.val('Invalid entry: NaN; ID-Only.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nChan) {
			field.val('Invalid entry: No-entry.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nChan.match(/^\d{16,18}$/)) {
			field.val('Invalid entry: Invalid length or characters.');
			setTimeout(() => field.val(''), 2e3);
		}
		this.hid.channels.push(nChan);
		this.saveSettings();
		this.hideChannels();
	}

	chanClear() {
		const field = $('#ChanblockField');
		const oChan = field.val();
		if(this.hid.channels.length) {
			if(oChan.match(/^\d{16,18}$/)) {
				this.hid.channels.splice(this.hid.channels.indexOf(oChan), 1);
				this.saveSettings();
				field.val('Channel successfully removed!');
				setTimeout(() => field.val(''), 2e3);
				this.auditChannels();
			} else {
				this.hid.channels.pop();
				this.saveSettings();
				field.val('Successfully removed last added channel!');
				setTimeout(() => field.val(''), 2e3);
				this.auditChannels();
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
			$(context).find('.item').first().after(this.servItem);
			$(context).find('.item.hideServer')
				.off('click.HideUtilsS')
				.on('click.HideUtilsS', this.servConClick.bind(this));
		}
	}

	servConClick() {
		const context = document.querySelector('.context-menu');
		if(!context) return;
		if(!this.getReactInstance(context).return.memoizedProps.guild) return;
		const server = this.getReactInstance(context).return.memoizedProps.guild.id;
		if(!this.hid.servers.includes(server)) {
			this.hid.servers.push(server);
			this.saveSettings();
			this.hideServers();
		}
	}

	auditServers() {
		if(document.querySelector('.guild')) {
			$('.guild').each((_, guild) => {
				if(guild instanceof Element && this.getReactInstance(guild) && this.getReactInstance(guild).return.memoizedProps.guild)
					this.hid.servers.includes(this.getReactInstance(guild).return.memoizedProps.guild.id) ? $(guild).hide() : $(guild).show();
			});
		}
	}

	hideServers() {
		if(!this.hid.servers.length) return;
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

	servPush() {
		const field = $('#ServerHideField');
		const nServer = field.val();
		if(isNaN(nServer)) {
			field.val('Invalid entry: NaN; ID-Only.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nServer) {
			field.val('Invalid entry: No-entry.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nServer.match(/^\d{16,18}$/)) {
			field.val('Invalid entry: Invalid length or characters.');
			setTimeout(() => field.val(''), 2e3);
		}
		this.hid.servers.push(nServer);
		this.saveSettings();
		this.hideServers();
	}

	servClear() {
		const field = $('#ServerHideField');
		const oServer = field.val();
		if(this.hid.servers.length) {
			if(oServer.match(/^\d{16,18}$/)) {
				this.hid.servers.splice(this.hid.servers.indexOf(oServer), 1);
				this.saveSettings();
				field.val('Server successfully removed!');
				setTimeout(() => field.val(''), 2e3);
				this.auditServers();
			} else {
				this.hid.servers.pop();
				this.saveSettings();
				field.val('Successfully removed last added server!');
				setTimeout(() => field.val(''), 2e3);
				this.auditServers();
			}
		}
	}

	userContext(context) {
		if(!context) return;
		if(!this.getReactInstance(context) || !this.getReactInstance(context).return.memoizedProps.user) return;
		if((this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('avatar-large'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('user-name'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('member-username'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('avatar-small'))) {
			$(context).find('.item').first().after(this.userItem);
			$(context).find('.item.hideUser')
				.off('click.HideUtilsU')
				.on('click.HideUtilsU', this.userConClick.bind(this));
		}
	}

	userConClick() {
		const context = document.querySelector('.context-menu');
		if(!context) return;
		if(!this.getReactInstance(context).return.memoizedProps.user) return;
		const user = this.getReactInstance(context).return.memoizedProps.user.id;
		if(!this.hid.users.includes(user)) {
			this.hid.users.push(user);
			this.saveSettings();
			this.hideUsers();
		}
	}

	auditUsers() {
		try {
			if(document.querySelector('.member')) {
				$('.member').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.return.memoizedProps.user)
						this.hid.users.includes(this.getReactInstance(user).return.return.memoizedProps.user.id) ? $(user).hide() : $(user).show();
				});
			}
			if(document.querySelector('.message-group')) {
				$('.message-group.hide-overflow').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.memoizedProps.messages && this.getReactInstance(user).return.memoizedProps.messages[0] && this.getReactInstance(user).return.memoizedProps.messages[0].author)
						this.hid.users.includes(this.getReactInstance(user).return.memoizedProps.messages[0].author.id) ? $(user).hide() : $(user).show();
				});
				if($('.message-group:not(.hide-overflow)').length) {
					$('.message-group:not(.hide-overflow)').each((_, user) => {
						if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).return.key && this.getReactInstance(user).return.key.includes('upload')  && this.getReactInstance(user).return.memoizedProps.user)
							this.hid.users.includes(this.getReactInstance(user).return.memoizedProps.user.id) ? $(user).hide() : $(user).show();
					});
				}
			}
			if(document.querySelector('.wrapperSelectedVoice-1Q1ocJ.wrapper-fDmxzK ~ .listDefault-3i7eWQ')) {
				$('.wrapperSelectedVoice-1Q1ocJ.wrapper-fDmxzK ~ .listDefault-3i7eWQ').each((_, user) => {
					if(user.nodeType === 1 && user instanceof Element && this.getReactInstance(user) && this.getReactInstance(user).child.memoizedProps.user)
						this.hid.users.includes(this.getReactInstance(user).child.memoizedProps.user.id) ? $(user).hide() : $(user).show();
				});
			}
		} catch(e) {
			this.err(e.stack);
		}
	}

	hideUsers() {
		if(!this.hid.users.length) return;
		this.auditUsers();
	}
	
	userObs() {
		const memWrap = document.querySelector('.channel-members-wrap');
		if(!memWrap) return;
		this.userMO.observe(memWrap, { childList: true, subtree: true });
	}

	userDiscon() {
		this.userMO.disconnect();
	}

	userPush() {
		const field = $('#blockField');
		const nUser = field.val();
		if(isNaN(nUser)) {
			field.val('Invalid entry: NaN; ID-Only.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nUser) {
			field.val('Invalid entry: No-entry.');
			setTimeout(() => field.val(''), 2e3);
		}
		if(!nUser.match(/^\d{17,18}$/)) {
			field.val('Invalid entry: Invalid length or characters.');
			setTimeout(() => field.val(''), 2e3);
		}
		this.hid.users.push(nUser);
		this.saveSettings();
		this.hideUsers();
	}

	userClear() {
		const field = $('#blockField');
		const oUser = field.val();
		if(this.hid.users.length) {
			if(oUser.match(/^\d{17,18}$/)) {
				this.hid.users.splice(this.hid.users.indexOf(oUser), 1);
				this.saveSettings();
				field.val('User successfully removed!');
				setTimeout(() => field.val(''), 2e3);
				this.auditUsers();
			} else {
				this.hid.users.pop();
				this.saveSettings();
				field.val('Successfully removed the last added user!');
				setTimeout(() => field.val(''), 2e3);
				this.auditUsers();
			}
		}
	}

	saveSettings() {
		bdPluginStorage.set('HideUtils', 'settings', JSON.stringify(this.hid));
		this.log('Saved settings. Settings are:', this.hid);
	}

	loadSettings() {
		this.hid = JSON.parse(bdPluginStorage.get('HideUtils', 'settings'));
		this.log('Loaded settings. Settings are:', this.hid);
	}

	settingSelect() {
		return `<div id="HideUtils-Settings" class="HUSettings">
			<div id="settingSelect" class="container">
				<h3 class="settingsHeader">Settings Selection</h3><br/><br/>
				<div id="HideUtils-buttonGroup" class="buttonGroup">
					<button id="HideUtils-channels" onclick=BdApi.getPlugin("${this.getName()}").channelSettings()>Channels</button>
					<button id="HideUtils-servers" onclick=BdApi.getPlugin("${this.getName()}").serverSettings()>Servers</button>
					<button id="HideUtils-users" onclick=BdApi.getPlugin("${this.getName()}").userSettings()>Users</button>
					<button id="HideUtils-instructions" onclick=BdApi.getPlugin("${this.getName()}").instructionPanel()>Instructions</button>
				</div>
			</div>
		</div>`;
	}

	channelSettings() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1500);
		return setTimeout(() => $('#HideUtils-Settings').html(`<div id="HideUtils-Settings" class="HUSettings">
			<div id="HideUtils-plugin-settings-div" class="container">
				<h3>HideUtils Plugin \u2192 Settings \u2192 Channels</h3><br/><br/>

				<input id="ChanblockField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="hU-btn0" onclick=BdApi.getPlugin("${this.getName()}").chanPush()>Apply</button>
				<button class="hU-btn1" onclick=BdApi.getPlugin("${this.getName()}").chanClear()>Remove</button>
				<button class="hU-btn2" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="hU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
			</div>
		</div>`), 5e2);
	}

	serverSettings() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1800);
		return setTimeout(() => $('#HideUtils-Settings').html(`<div id="HideUtils-Settings" class="HUSettings">
			<div id="HideUtils-plugin-settings-div" class="container">
				<h3>HideUtils Plugin \u2192 Settings \u2192 Servers</h3><br/><br/>

				<input id="ServerHideField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="hU-btn0" onclick=BdApi.getPlugin("${this.getName()}").servPush()>Apply</button>
				<button class="hU-btn1" onclick=BdApi.getPlugin("${this.getName()}").servClear()>Remove</button>
				<button class="hU-btn2" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="hU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
			</div>
		</div>`), 5e2);
	}

	userSettings() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1800);
		return setTimeout(() => $('#HideUtils-Settings').html(`<div id="HideUtils-Settings" class="HUSettings">
			<div id="HideUtils-plugin-settings-div" class="container">
				<h3>HideUtils Plugin \u2192 Settings \u2192 Users</h3><br/><br/>

				<input id="blockField" type="text" placeholder="ID" style="resize: none; width: 80%; position: relative; left: 10%;" /><br/><br/>
				<br/><div class="buttonGroupi">
				<button class="hU-btn0" onclick=BdApi.getPlugin("${this.getName()}").userPush()>Apply</button>
				<button class="hU-btn1" onclick=BdApi.getPlugin("${this.getName()}").userClear()>Remove</button>
				<button class="hU-btn2" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>Save</button>
				<button class="hU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>Load</button>
				</div><br/><br/>
				<button id="HideUtils-Return" class="returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
			</div>
		</div>`), 5e2);
	}

	instructionPanel() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1800);
		return setTimeout(() => $('#HideUtils-Settings').html(`<div id="HideUtils-Settings" class="HUSettings">
			<div id="HideUtils-plugin-settings-div" class="container">
				<h3>HideUtils Plugin \u2192 Settings \u2192 Instructions</h3><br/>
				<p id="HideUtils-instructions" class="instructions">
				[ A ]:<br/><br/>
				0) Right-click on a channel, server, or user.<br/>
				1) Left-click the hide option.<br/><br/>
				[ B ]:<br/><br/>
				0) User Settings \u2192 Appearence \u2192 Developer Mode, then right-click a user, channel, or server, and "Copy ID".<br/>
				1) Insert the ID.<br/>
				2) Click "apply."<br/><br/>
				[ NOTE ]:<br/><br/>
				* Unhiding requires use of the settings-panel, and is not handled within a context-menu.
				</p><br/>
				<button id="HideUtils-Return" class="returnButton" onclick=BdApi.getPlugin("${this.getName()}").returnSettings()>Return</button><br/>
			</div>
		</div>`), 5e2);
	}

	returnSettings() {
		const settings = $('#HideUtils-Settings');
		settings.fadeOut();
		settings.fadeIn(1500);
		return setTimeout(() => settings.html(this.settingSelect()), 5e2);
	}

	observer({ addedNodes, removedNodes }) {
		if(addedNodes.length && addedNodes[0].id && addedNodes[0].id === 'friends') {
			this.allDiscon();
			this.allObs();
		}
		if(addedNodes.length && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('guild')) {
			this.auditServers();
		}
		if(addedNodes.length && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes.length && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.chanDiscon();
			this.userDiscon();
			this.chanObs();
			this.auditChannels();
			this.auditServers();
			this.auditUsers();
		}
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('listDefault-3i7eWQ')) {
			this.auditUsers();
		}
		if(addedNodes.length && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('channel-members-wrap')) {
			this.auditUsers();
			this.userObs();
		}
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('guilds-wrapper')) {
			this.servDiscon();
			this.servObs();
			this.auditServers();
		}
		if(removedNodes.length && removedNodes[0] && removedNodes[0].classList && removedNodes[0].classList.contains('channel-members-wrap')) {
			this.userDiscon();
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

	log(text, ...extra) {
		if(typeof text !== 'string')
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text);
		if(!extra.length)
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '');
		else
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '', ...extra);
	}

	err(error) {
		return console.error(`[%c${this.getName()}%c] ${error}`, 'color: #59F;', '');
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
		return '1.0.5';
	}

	getDescription() {
		return 'Combination plugin packaging hideChannels, hideServers, and hideUsers into one.';
	}

	getSettingsPanel() {
		return this.settingSelect();
	}
};

/*@end@*/
