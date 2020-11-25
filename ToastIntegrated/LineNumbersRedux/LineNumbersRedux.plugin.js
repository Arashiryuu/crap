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
			version: '1.1.8',
			description: 'Adds line numbers to codeblocks.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/LineNumbersRedux/LineNumbersRedux.plugin.js'
		},
		changelog: [
			{
				title: 'Bugs Squashed!',
				type: 'fixed',
				items: ['Works again.']
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
		const slice = Array.prototype.slice;
		const base = '.chat-3bRxxu';
		const messagesWrapper = WebpackModules.getByProps('messages', 'messagesWrapper');
		const MessageClasses = {
			...WebpackModules.getByProps('messageCompact', 'headerCozy', 'username'),
			...WebpackModules.getByProps('message', 'groupStart')
		};
		
		return class LineNumbersRedux extends Plugin {
			constructor() {
				super();
				this._css;
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = { ignoreNoLanguage: true, noStyle: false };
				this.settings = null;
				this.css = `
					.hljs ol {
						list-style: none;
						counter-reset: linenumbers;
					}
					.hljs ol ul {
						list-style: none;
						margin: 0;
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
				this.codeblockFilter = this.codeblockFilter.bind(this);
			}

			/* Methods */

			onStart() {
				this.promises.restore();
				this.settings = this.loadSettings(this.default);
				this.handleCSS();
				this.patchMessages(this.promises.state);
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}

			onStop() {
				this.promises.cancel();
				window.BdApi.clearCSS('LineNumbersCSS');
				Patcher.unpatchAll();
				this.unprocessCodeblocks();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
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
				return `<li>${line}</li>`;
			}

			isCommentStart(child) {
				return child.textContent.trim().startsWith('/*');
			}

			isInlineComment(child) {
				const ct = child.textContent.trim();
				return ct.startsWith('/*') && ct.endsWith('*/');
			}

			wrapComments(codeblock) {
				const groups = [];
				let children = slice.call(codeblock.children);

				for (let i = 0, len = codeblock.children.length; i < len; i++) {
					const child = codeblock.children[i];
					let start = 0, end = 0;
					if (this.isInlineComment(child)) continue;
					if (this.isCommentStart(child)) {
						start = i;
						end = children.findIndex((c, ind) => ind > i && c.textContent.trim().startsWith('*/'));
						groups.push({ start, end, children: children.slice(start, end + 1).map((c) => c.cloneNode(true)) });
					}
				}

				if (!groups.length) return;

				for (let i = groups.length - 1, len = 0; i >= len; i--) {
					const group = groups[i];
					const ul = document.createElement('ul');
					DOMTools.addClass(ul, 'hljs-comment');
					for (const child of group.children) DOMTools.appendTo(child, ul);
					if (codeblock.children.length - 1 === group.end) codeblock.appendChild(ul);
					else if (codeblock.children[group.end]) codeblock.children[group.end].insertAdjacentElement('afterend', ul);
					children = slice.call(codeblock.children);
					const filtered = children.slice(group.start, group.end + 1).filter((child, index) => {
						return (index >= group.start || index <= group.end) && child.tagName !== 'UL';
					});
					for (const f of filtered) f.remove();
				}
			}
		
			hasOl(codeblock) {
				return !!codeblock.querySelector('ol');
			}
		
			noOl(codeblock) {
				return !codeblock.querySelector('ol');
			}
		
			addLines(codeblock) {
				codeblock.innerHTML = codeblock.innerHTML.split('\n')
					.map((char) => this.mapLine(char))
					.join('');

				return codeblock;
			}
		
			codeblockFilter(codeblock) {
				if (codeblock.dataset.slateObject) return false;
				return !(this.settings.ignoreNoLanguage && codeblock.className.endsWith('hljs'));
			}

			combineFilters(...filters) {
				return (cb) => filters.every((filter) => filter(cb));
			}
		
			processCodeblocks() {
				const codeblocks = Array.from(document.querySelectorAll(`${base} .hljs`)), filtered = codeblocks.filter(this.combineFilters(this.noOl, this.codeblockFilter));
				for (let i = 0, len = filtered.length; i < len; i++) {
					const ol = document.createElement('ol');
					ol.setAttribute('class', 'LineNumbers');
					this.wrap(this.addLines(filtered[i]), ol);
					if (!filtered[i].className.endsWith('.hljs')) this.wrapComments(ol);
				}
			}
		
			unprocessCodeblocks() {
				const codeblocks = Array.from(document.querySelectorAll(`${base} .hljs`)), filtered = codeblocks.filter((cb) => this.hasOl(cb));
				for (let i = 0, len = filtered.length; i < len; i++) {
					const ol = filtered[i].querySelector('ol');
					if (ol) this.unwrap(ol);
				}
			}
		
			handleCSS() {
				window.BdApi.clearCSS('LineNumbersCSS');
				if (!this.settings.noStyle) window.BdApi.injectCSS('LineNumbersCSS', this.css);
			}

			async patchMessages(state) {
				if (state.cancelled) return;

				const t = await new Promise((resolve, reject) => {
					DOMTools.observer.subscribeToQuerySelector(() => {
						const instance = ReactTools.getReactInstance(document.querySelector('[data-list-id="chat-messages"]'));
						if (instance) resolve(this.getProps(instance, 'return.return.return.return.return.type'));
						else resolve(null);
					}, '.chat-3bRxxu', null, true);
				});
				if (!t) return;

				Patcher.after(t, 'render', (that, args, value) => {
					setImmediate(() => this.processCodeblocks());
					return value;
				});

				this.updateMessages();
			}

			updateMessages() {
				const messages = document.querySelectorAll(`.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);
				if (!messages.length) return;
				for (let i = 0, len = messages.length; i < len; i++) ReactTools.getOwnerInstance(messages[i]).forceUpdate();
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
				window.BdApi.getCore().alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
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

module.exports = LineNumbersRedux;

/*@end@*/
