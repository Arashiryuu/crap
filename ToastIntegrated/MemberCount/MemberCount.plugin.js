//META{"name":"MemberCount"}*//

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

class MemberCount {
	constructor() {
		this.initialized = false;
		this.stylesheet;
		this.counter;
		this.guildStore;
		this.memberStore;

		this.membMO = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change.type === 'childList' && change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(node.classList && node.classList.contains('channel-members-wrap')) {
							this.reinject();
						}
						if(node.classList && ( node.classList.contains('chat') || node.classList.contains('messages-wrapper') )) {
							this.reinject();
						}
					}
				}
				if(change.type === 'childList' && ( change.addedNodes || change.removedNodes )) {
					for(const node of change.addedNodes.values()) {
						if(node.classList && node.classList.contains('member')) {
							this.memberCount();
						}
					}
					for(const node of change.removedNodes.values()) {
						if(node.classList && node.classList.contains('member')) {
							this.memberCount();
						}
					}
				}
				if(document.getElementById('memberCount')) {
					this.memberCount();
				}
			}
		});

		this.styleCSS = `
			.theme-dark #memberCount {
				position: absolute;
				color: hsla(0, 0%, 100%, 0.4);
				font-size: 12px;
				letter-spacing: 0.08em;
				font-weight: 500;
				text-transform: uppercase;
				background: #2f3136;
				display: block;
				width: 100%;
				text-align: center;
				padding: 1vh 0;
			} 
			
			.theme-light #memberCount {
				position: absolute;
				color: #99aab5;
				font-size: 12px;
				letter-spacing: 0.08em;
				font-weight: 500;
				text-transform: uppercase;
				background: #f3f3f3;
				display: block;
				width: 100%;
				text-align: center;
				padding: 1vh 0;
			}

			.channel-members-wrap .channel-members {
				margin-top: 2vh;
			}
		`;
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		this.unwatch();
		this.remove();
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		let libraryScript = document.getElementById('zeresLibraryScript');
		if(!libraryScript) {
			libraryScript = document.createElement('script');
			libraryScript.id = 'zeresLibraryScript';
			libraryScript.src = 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js';
			libraryScript.type = 'text/javascript';
			document.head.appendChild(libraryScript);
		}

		if(typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.addEventListener('load', () => this.initialize());
	}

	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.downLink);

		this.guildStore = InternalUtilities.WebpackModules.findByUniqueProperties(['getLastSelectedGuildId']);
		this.memberStore = InternalUtilities.WebpackModules.findByUniqueProperties(['getMember']);

		this.inject();
		this.memberCount();
		this.watch();

		this.initialized = true;

		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
	}

	watch() {
		const app = document.querySelector('.app');
		this.membMO.observe(app, { childList: true, subtree: true });
		return true;
	}

	unwatch() {
		this.membMO.disconnect();
		return true;
	}

	reinject() {
		const m = document.querySelector('.channel-members-wrap');
		if(!m) return;
		this.inject();

		return this.memberCount();
	}

	inject() {
		const ss = document.getElementById('memberCountCSS');
		const c = document.getElementById('memberCount');
		if( (!ss && !c) || !c || !ss ) {
			$('#memberCountCSS, #memberCount').remove();
			this.stylesheet = this.createElement('style', 'memberCountCSS', this.styleCSS);
			document.head.appendChild(this.stylesheet);
	
			this.counter = this.createElement('h2', 'memberCount', '&nbsp;');
			document.querySelector('.channel-members-wrap').appendChild(this.counter);
	
			return true;
		}

		return false;
	}

	remove() {
		if(this.stylesheet && this.counter) {
			document.head.removeChild(this.stylesheet);
			document.querySelector('.channel-members-wrap').removeChild(this.counter);
			return true;
		}

		return false;
	}

	createElement(type = '', id = '', content = '') {
		const element = document.createElement(type);
		element.id = id;
		element.textContent = content;

		return element;
	}

	memberCount() {
		const members = document.querySelector('.channel-members-wrap');
		if(!members) return;

		const total = this.memberStore.getMemberIds(this.guildStore.getGuildId()).length;
		const mCount = document.getElementById('memberCount');

		if(mCount) {
			mCount.textContent = 'Members' + '—' + total;
			return true;
		}

		return false;
	}

	observer({ addedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('app')) {
			this.unwatch();
			this.watch();
		}
	}

	log(text, ...extra) {
		if(typeof text !== 'string')
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text);
		if(!extra.length)
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '');
		else
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '', ...extra);
	}

	err(error, ...errors) {
		if(typeof error === 'string' && !errors.length)
			return console.error(`[%c${this.getName()}%c] ${error}`, 'color: #59F;', '');
		else
			return console.error(`[%c${this.getName()}%c] `, 'color: #59F;', '', error, ...errors);
	}

	get downLink() {
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.getName()}/${this.getName()}.plugin.js`;
	}

	getName() {
		return 'MemberCount';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.2';
	}

	getDescription() {
		return 'Displays a server\'s member-count at the top of the member-list, can be styled with `#memberCount`.';
	}
};

/*@end@*/
