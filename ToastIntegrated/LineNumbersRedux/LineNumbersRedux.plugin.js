//META{"name":"LineNumbersRedux","displayName":"LineNumbersRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/LineNumbersRedux/LineNumbersRedux.plugin.js"}*//

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

var LineNumbersRedux = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'LineNumbersRedux',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.1.0',
			description: 'Adds line numbers to codeblocks.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/LineNumbersRedux/LineNumbersRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Updated',
				type: 'improved',
				items: ['Now uses the local library version of ZeresPluginLibrary.']
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
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingGroup, SettingField, RadioGroup, Textbox, Switch } = Settings;

		const has = Object.prototype.hasOwnProperty;
		const { container: MessageContainer, message: Message } = DiscordSelectors.Messages;
		
		return class LineNumbersRedux extends Plugin {
			constructor() {
				super();
				this._css;
				this.default = { ignoreNoLanguage: true, noStyle: false };
				this.settings = Object.assign({}, this.default);
				this.switchList = [
					WebpackModules.getByProps('app').app.split(' ')[0],
					DiscordSelectors.TitleWrap.chat.value.split('.')[1],
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper.split(' ')[0]
				];
				this.messageList = [
					...MessageContainer.value.split('.').slice(1),
					...Message.value.split('.').slice(1)
				];
				this.css = `
					.hljs ol {
						list-style: none;
						counter-reset: linenumbers;
					}
					.hljs ol li {
						text-indent: -4ch;
						margin-left: 3.5ch;
						padding-left: 0.5ch;
						border-left: 1px solid rgba(0, 0, 0, 0.2);
					}
					.theme-dark .hljs ol li::before {
						color: rgba(127, 127, 127, 0.5);
					}
					.theme-light .hljs ol li::before {
						color: rgba(150, 150, 150, 0.5);
					}
					.hljs ol li::before {
						display: inline-block;
						width: 3ch;
						margin-right: 0.5ch;
						padding-right: 0.5ch;
						text-align: right;
						counter-increment: linenumbers;
						content: counter(linenumbers);
						-webkit-user-select: none;
						user-select: none;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.loadSettings(this.settings);
				this.handleCSS();
				this.processCodeblocks();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				this.handleCSS();
				this.unprocessCodeblocks();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			wrap(parent, wrapper) {
				if (typeof wrapper === 'string') wrapper = document.createElement(wrapper);
				parent.appendChild(wrapper);
				while (parent.firstChild !== wrapper) wrapper.appendChild(parent.firstChild);
			}
		
			unwrap(wrapper) {
				const parent = wrapper.parentElement;
				while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
				parent.removeChild(wrapper);
			}
		
			mapLine(line) {
				const commentMarkers = ['/*', '*'];
				if (commentMarkers.includes(line.trim()[0])) {
					return `<li class="hljs-comment">${line}</li>`;
				} else {
					return `<li>${line}</li>`;
				}
			}
		
			hasOl(codeblock) {
				return !!codeblock.querySelector('ol');
			}
		
			noOl(codeblock) {
				return !codeblock.querySelector('ol');
			}
		
			addLines(codeblock) {
				codeblock.innerHTML = codeblock.innerHTML.split('\n').map((char) => this.mapLine(char)).join('');
				return codeblock;
			}
		
			codeblockFilter(codeblock) {
				return !(this.settings.ignoreNoLanguage && codeblock.className.endsWith('hljs'));
			}
		
			processCodeblocks() {
				const codeblocks = Array.from(document.querySelectorAll('.hljs')), filtered = codeblocks.filter((cb) => this.noOl(cb)).filter((cb) => this.codeblockFilter(cb));
				for (let i = 0, len = filtered.length; i < len; i++) {
					const ol = document.createElement('ol');
					ol.setAttribute('class', 'LineNumbers');
					this.wrap(this.addLines(filtered[i]), ol);
				}
			}
		
			unprocessCodeblocks() {
				const codeblocks = Array.from(document.querySelectorAll('.hljs')), filtered = codeblocks.filter((cb) => this.hasOl(cb));
				for (let i = 0, len = filtered.length; i < len; i++) {
					const ol = filtered[i].querySelector('ol');
					if (ol) this.unwrap(ol);
				}
			}
		
			handleCSS() {
				BdApi.clearCSS('LineNumbersCSS');
				if (!this.settings.noStyle) BdApi.injectCSS('LineNumbersCSS', this.css);
			}

			/* Observer */

			observer({ addedNodes }) {
				if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
					this.processCodeblocks();
				} else if (addedNodes.length && addedNodes[0].classList && this.messageList.includes(addedNodes[0].classList[addedNodes[0].classList.length - 1])) {
					this.processCodeblocks();
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

			/* Settings Panel */

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new Switch('Ignore No-Language Codeblocks', 'Whether or not to ignore codeblocks that do not use any language for syntax highlighting.', this.settings.ignoreNoLanguage, (i) => {
							this.settings.ignoreNoLanguage = i;
							this.processCodeblocks();
						}),
						new Switch('No Default Style', 'Whether or not to add style rules, or leave it up to themes or customcss.', this.settings.noStyle, (i) => {
							this.settings.noStyle = i;
							this.handleCSS();
						})
					)
				);
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
