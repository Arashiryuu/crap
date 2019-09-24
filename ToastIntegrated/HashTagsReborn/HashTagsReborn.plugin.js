//META{"name":"HashTagsReborn","displayName":"HashTagsReborn","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HashTagsReborn/HashTagsReborn.plugin.js"}*//

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

var HashTagsReborn = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'HashTagsReborn',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.4',
			description: 'Lets you use hashtags on Discord!',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HashTagsReborn/HashTagsReborn.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: ['Works again!', 'No longer breaks channel mentions!']
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
		const { Toasts, Logger, DOMTools, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		
		const slice = Array.prototype.slice;
		const MessageClasses = WebpackModules.getByProps('containerCozy', 'dividerEnabled');
		const MentionClasses = WebpackModules.getByProps('wrapper', 'wrapperHover', 'wrapperNoHover');
		const [markup] = WebpackModules.getByProps('markup').markup.split(' ');
		
		return class HashTagsReborn extends Plugin {
			constructor() {
				super();
				this._css;
				this.regex = /\B#[A-Z0-9a-z_-]+/igm;
				this.css = `
					.${MessageClasses.container} .HashTag {
						color: #3898FF;
						font-weight: bold;
					}

					#app-mount .${MessageClasses.container} .${MentionClasses.wrapper}.HashTag {
						color: #3898FF !important;
						font-weight: bold;
					}
				`;
				this.switchList = [
					WebpackModules.getByProps('app').app.split(' ')[0],
					DiscordSelectors.TitleWrap.chat.value.slice(2),
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper.split(' ')[0]
				];
				this.messageList = [
					MessageClasses.container,
					MessageClasses.content
				];
			}

			/* Methods */

			onStart() {
				this.handleCSS();
				this.addTags();
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				PluginUtilities.removeStyle(this.short);
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}

			handleCSS() {
				const sheet = document.getElementById(this.short);

				if (!sheet) {
					PluginUtilities.addStyle(this.short, this.css);
				} else {
					sheet.remove();
					PluginUtilities.addStyle(this.short, this.css);
				}
			}

			addTags() {
				const messages = DOMTools.queryAll(`.${markup}`);
				const mentionCs = Object.values(MentionClasses);
				for (let i = 0, len = messages.length; i < len; i++) {
					const message = messages[i];
					const matches = message.innerHTML.match(this.regex);
					if (matches && matches.length) {
						const html = message.innerHTML;
						const index = html.indexOf('#');
						if (index > 0) {
							const pre = html[index - 1] === '/';
							if (!pre) {
								const children = slice.call(message.childNodes);
								const hashTag = DOMTools.parseHTML('<span class="HashTag"></span>');
								const idx = children.findIndex((child) => child.textContent.indexOf('#') > -1);
								if (children[idx].classList && mentionCs.includes(children[idx].classList[children[idx].classList.length - 1])) {
									children[idx].classList.add('HashTag');
									continue;
								}
								if (children[idx].className && children[idx].className.includes('HashTag')) continue;
								message.innerHTML = html.replace(this.regex, '<span class="HashTag">$&</span>');
							}
						} else {
							const children = slice.call(message.childNodes);
							const hashTag = DOMTools.parseHTML('<span class="HashTag"></span>');
							const idx = children.findIndex((child) => child.textContent.indexOf('#') > -1);
							if (children[idx].classList && mentionCs.includes(children[idx].classList[children[idx].classList.length - 1])) {
								children[idx].classList.add('HashTag');
								continue;
							}
							if (children[idx].className && children[idx].className.includes('HashTag')) continue;
							message.innerHTML = html.replace(this.regex, '<span class="HashTag">$&</span>');
						}
					}
				}
			}

			/* Observer */

			observer({ addedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
					this.addTags();
				} else if (addedNodes.length && addedNodes[0].classList && this.messageList.includes(addedNodes[0].classList[addedNodes[0].classList.length - 1])) {
					this.addTags();
				}
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
				window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js">Click here to download the library!</a>`);
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
