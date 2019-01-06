//META{"name":"GreenText","displayName":"GreenText","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/greenText.plugin.js"}*//

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

var GreenText = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'GreenText',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.8',
			description: 'Turns sentences beginning with "\>" green.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/greenText.plugin.js'
		},
		changelog: [
			{
				title: 'Updated',
				type: 'improved',
				items: ['Compact mode improvements.']
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
		const { Toasts, Logger, DOMTools, WebpackModules, DiscordSelectors } = Api;
		
		return class GreenText extends Plugin {
			constructor() {
				super();
				this._css;
				this.regex = /^&gt;\S?.+|^>\S?.+/igm;
				this.css = `
					${DiscordSelectors.Messages.message.value.trim()} #GreenText {
						color: #709900 !important;
						transition: all 200ms ease;
					}

					${DiscordSelectors.Messages.message.value.trim()} #GreenText:hover {
						font-weight: bold;
					}
				`;
				this.switchList = [
					'app',
					DiscordSelectors.TitleWrap.chat.value.split('.')[1],
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper
				];
				this.messageList = [
					DiscordSelectors.Messages.container.value.slice(2),
					DiscordSelectors.Messages.message.value.slice(2)
				];
			}

			/* Methods */

			onStart() {
				this.injectCSS();
				this.run();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				this.removeCSS();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			run() {
				const messages = document.querySelectorAll(`.${WebpackModules.getByProps('markup').markup}`);

				if (this.isCompact()) {
					for (const message of messages) {
						const textNodes = Array.from(message.childNodes).filter((node) => node.nodeType === 3);
						for (const node of textNodes) {
							const matches = node.data.match(this.regex);
							if (!matches || !matches.length) continue;
							const data = node.data.split('\n');
							const replaceNodes = data.reduce((arr, text) => {
								if (text.match(this.regex)) {
									const el = DOMTools.parseHTML(`<span id="GreenText">${text}\n</span>`);
									arr.push(el);
									return arr;
								}
								arr.push(document.createTextNode(`${text}\n`));
								return arr;
							}, []);
							if (!replaceNodes[0].id) replaceNodes[0].data = `${replaceNodes[0].data.trim()}\n`;
							if (!replaceNodes[replaceNodes.length - 1].id) replaceNodes[replaceNodes.length - 1].data = `${replaceNodes[replaceNodes.length - 1].data.trim()}`;
							node.replaceWith(...replaceNodes);
						}
					}
				}

				for (const message of messages) {
					const matches = message.innerHTML.match(this.regex);
					if (!matches || !matches.length) continue;
					const html = message.innerHTML;
					message.innerHTML = html.replace(this.regex, '<span id="GreenText">$&</span>');
				}
			}

			injectCSS() {
				const s = DOMTools.parseHTML(`<style id="GreenTextCSS" type="text/css">${this.css}</style>`);
				DOMTools.appendTo(s, document.head);
			}

			removeCSS() {
				const e = document.getElementById('GreenTextCSS');
				if (!e) return;
				e.remove();
			}

			isCompact() {
				const message = document.querySelector(`.${WebpackModules.getByProps('markup').markup}`);
				if (!message) return false;
				return message.classList.contains(WebpackModules.getByProps('isCompact').isCompact);
			}

			/* Observer */

			observer({ addedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
					this.run();
				} else if (addedNodes.length && addedNodes[0].classList && this.messageList.includes(addedNodes[0].classList[addedNodes[0].classList.length - 1])) {
					this.run();
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
			Logger.log('Stopped!');
		}

		load() {
			window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
		}

		start() {
			Logger.log('Started!');
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
