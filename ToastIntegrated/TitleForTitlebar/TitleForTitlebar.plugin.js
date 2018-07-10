//META{"name":"TitleForTitlebar","displayName":"TitleForTitlebar","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/TitleForTitlebar/TitleForTitlebar.plugin.js"}*//

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

var TitleForTitlebar = (() => {

	/* Setup */

	if (!global.ZLibrary && !global.ZLibraryPromise) global.ZLibraryPromise = new Promise((resolve, reject) => {
		require('request').get({ url: 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/ZLibrary.js', timeout: 1e4 }, (err, res, body) => { // https://zackrauen.com/BetterDiscordApp/ZLibrary.js | https://rauenzi.github.io/BetterDiscordAddons/Plugins/ZLibrary.js
			if (err || res.statusCode !== 200) reject(err || res.statusMessage);
			try {
				const vm = require('vm'), script = new vm.Script(body, { displayErrors: true });
				resolve(script.runInThisContext());
			} catch(err) {
				reject(err);
			}
		});
	});

	const config = {
		main: 'index.js',
		info: {
			name: 'TitleForTitlebar',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.0',
			description: 'Adds a title to the titlebar, dynamically changes as needed.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/TitleForTitlebar/TitleForTitlebar.plugin.js'
		}
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
		const { Toasts, DiscordModules } = Api;
		
		return class TitleForTitlebar extends Plugin {
			constructor() {
				super();
				this.getChannel;
				this.activeChannel;
				this.titlePrefix;
				this.titleText;
				this.target;
				this.title;
				this.switchList = ['app', 'chat', 'messages-wrapper'];
			}

			/* Methods */

			onStart() {
				BdApi.injectCSS('TitleForTitlebarCSS', `
                    @import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';

					#app-mount .chat .title-wrap .title {
						display: none;
					}

					#TitleForTitlebar {
						position: absolute;
						color: #EEE;
						top: 1ex;
						left: 26vw;
						font-size: 13pt;
						font-family: 'Inconsolata', sans-serif;
						text-transform: capitalize;
					}
				`.split(/\s+/g).join(' ').trim());
				const { ChannelStore: { getChannel }, SelectedChannelStore: { getChannelId } } = DiscordModules;
				this.getChannel = getChannel;
				this.activeChannel = getChannelId;
				this.target = document.querySelector('#app-mount > div:first-child');
				this.appendTitle();
				this.manageTitle();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				this.removeTitle();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			removeTitle() {
				if (document.contains(this.title)) {
					this.title.remove();
				}
			}

			handleTitle() {
				if (!document.contains(this.title)) {
					this.appendTitle();
				}
			}

			appendTitle() {
				this.title = document.createElement('span');
				this.title.id = 'TitleForTitlebar';
				this.title.textContent = 'Initialised';
				try {
					this.target.appendChild(this.title);
				} catch(r) {
					err(r);
				}
				return this.title;
			}

			manageTitle() {
				this.handleTitle();
				const curr = this.getChannel(this.activeChannel());
				this.title.textContent = this.getTitle(curr);
			}

			getTitle(channel) {
				if (!channel) return;

				let users = [];
				const { name, type, recipients } = channel;

				if (recipients && recipients.length)
					for (let i = 0, len = recipients.length; i < len; i++) users.push(DiscordModules.UserStore.getUser(recipients[i]).username);

				const user = !name ? users.join(', ') : name;
				this.titleText = user;
				/**
				 * Channel Types:
				 * 0 - Guild Channel
				 * 1 - DM
				 * 2 - Voice Channel
				 * 3 - Group DM
				 * 4 - Categories
				 */
				switch (type) {
					case 1:
						this.titlePrefix = '[DM]';
					break;
					case 3:
						this.titlePrefix = '[Group DM]';
					break;
					default:
						this.titlePrefix = '[Guild Channel]';
					break;
				}

				return `${this.titlePrefix} ${this.titleText}`;
			}

			setTitle(prefix = '', name = '') {
				this.handleTitle();
				this.title.textContent = `${prefix} ${name}`;
			}

			/* Observer */

			observer({ addedNodes, removedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
					this.manageTitle();
				} else if (addedNodes.length && addedNodes[0].id && addedNodes[0].id.toLowerCase() === 'friends') {
					this.setTitle('[UI]', 'Friends');
				} else if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('layer-3QrUeG')) {
					setTimeout(() => {
						const sidebar = document.getElementById('bd-settings-sidebar');
						if (!sidebar) this.setTitle('[UI]', 'Server Settings');
						else this.setTitle('[UI]', 'User Settings');
					}, 250);
				} else if (removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('layer-3QrUeG')) {
					const friends = document.getElementById('friends');
					if (friends) this.setTitle('[UI]', 'Friends');
					else this.manageTitle();
				}
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get name() {
				return config.info.name;
			}

			get short() {
				return config.info.name.split('').filter((char) => char === char.toUpperCase()).join('');
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

	return !global.ZLibrary 
		? class {
			constructor() {
				//
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
			showAlert() {
				window.mainCore.alert('Loading Error', 'Something went wrong trying to load the library for the plugin. Try reloading?');
			}
			async load() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				const vm = require('vm'), plugin = buildPlugin(global.ZLibrary.buildPlugin(config));
				try {
					new vm.Script(plugin, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.getName(),
						file: `${this.getName()}.plugin.js`,
						reason: 'Plugin could not be compiled.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				global[this.getName()] = plugin;
				try {
					new vm.Script(`new global["${this.getName()}"]();`, { displayErrors: true });
				} catch(e) {
					return bdpluginErrors.push({
						name: this.getName(),
						file: `${this.getName()}.plugin.js`,
						reason: 'Plugin could not be constructed.',
						error: {
							message: e.message,
							stack: e.stack
						}
					});
				}
				bdplugins[this.getName()].plugin = new global[this.getName()]();
				bdplugins[this.getName()].plugin.load();
			}
			async start() {
				try {
					await global.ZLibraryPromise;
				} catch(e) {
					return this.showAlert();
				}
				bdplugins[this.getName()].plugin.start();
			}
			stop() {}
			get [Symbol.toStringTag]() {
				return 'Plugin';
			}
		}
		: buildPlugin(global.ZLibrary.buildPlugin(config));
})();
