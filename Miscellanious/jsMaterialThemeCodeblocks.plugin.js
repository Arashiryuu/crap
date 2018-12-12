//META{"name":"JSMaterialThemeCodeblocksRedux","displayName":"JSMaterialThemeCodeblocksRedux","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap"}*//

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

var JSMaterialThemeCodeblocksRedux = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'JSMaterialThemeCodeblocksRedux',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.1',
			description: 'Applies the "Material Theme" to JavaScript codeblocks.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/Miscellanious/jsMaterialThemeCodeblocks.plugin.js'
		}
	};

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, DOMTools, ReactTools, DiscordModules, WebpackModules, DiscordSelectors } = Api;
		
		return class JSMaterialThemeCodeblocksRedux extends Plugin {
			constructor() {
				super();
				this.selectors = [
					'.hljs[class~="js" i] .hljs-keyword', 
					'.hljs[class~="jsx" i] .hljs-keyword', 
					'.hljs[class~="javascript" i] .hljs-keyword',
					'.hljs[class~="js" i] .hljs-built_in',
					'.hljs[class~="jsx" i] .hljs-built_in',
					'.hljs[class~="javascript" i] .hljs-built_in'
				];
				this.keywords = {
					'instanceof':'instanceof',
					'arguments':'arguments',
					'parseInt':'parseInt',
					'require':'require',
					'typeof':'typeof',
					'isNaN':'isNaN',
					'this':'this',
					'void':'void',
					'new':'new',
					'in':'in',
					'of':'of'
				};
				this.stylesheet;
			}

			/* Methods */

			onStart() {
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
				this.injectCSS();
				this.patchMessages();
				this.addClasses();
			}

			async patchMessages() {
				const Message = await new Promise((resolve) => {
					const message = document.querySelector(DiscordSelectors.Messages.message);
					if (message) return resolve(ReactTools.getOwnerInstance(message).constructor);

					const MessageGroup = WebpackModules.getModule((m) => m.defaultProps && m.defaultProps.disableManageMessages);
					const unpatch = Patcher.after(MessageGroup.prototype, 'componentDidMount', (that) => {
						const elem = DiscordModules.ReactDOM.findDOMNode(that);
						if (!elem) return;
						unpatch();
						const msg = elem.querySelector(DiscordSelectors.Messages.message);
						resolve(ReactTools.getOwnerInstance(msg).constructor);
					});
				});

				Patcher.after(Message.prototype, 'render', (that, args, value) => {
					if (that.props.message.type !== 0) return value;
					
					setTimeout(() => {
						this.addClasses();
						this.paramParse();
					}, 50);

					return value;
				});

				this.updateMessages();
			}

			updateMessages() {
				const messages = document.querySelectorAll(DiscordSelectors.Messages.message.value.trim());
				for (let i = 0, len = messages.length; i < len; i++) ReactTools.getOwnerInstance(messages[i]).forceUpdate();
			}

			addClasses() {
				for (const selector of this.selectors) {
					const selection = DOMTools.queryAll(selector);
					for (const selected of selection) {
						const { innerText: text } = selected;
						const className = this.getClass(text);
						if (className && !DOMTools.hasClass(selected, className)) DOMTools.addClass(selected, className);
					}
				}
			}

			getClass(name) {
				if (this.keywords.hasOwnProperty(name)) return this.keywords[name];
				return null;
			}

			paramParse() {
				let params = DOMTools.queryAll('.hljs-params:not(.hljs-no-param)');
				if (!params.length) return;
				const noParam = Array.from(params).filter((param) => param.textContent === '()');
				if (noParam.length) {
					for (const param of noParam) DOMTools.addClass(param, 'hljs-no-param');
				}
				params = DOMTools.queryAll('.hljs-params:not(.hljs-no-param)');
				if (!params.length) return;
				for (const param of params) {
					if (param.innerHTML.indexOf(',') > -1) {
						const split = param.innerHTML.split(',');
						const len = split.length;
						for (let i = 0; i < len; i++) split[i] = split[i].trim();
						param.innerHTML = split.join('<span class="hljs-separator">, </span>');
					}
				}
			}

			injectCSS() {
				if (this.stylesheet || document.contains(this.stylesheet)) return;
				this.stylesheet = DOMTools.parseHTML(`<link id="${this.short}" rel="preload stylesheet" as="style" href="${this.cdn}"/>`);
				DOMTools.appendTo(this.stylesheet, document.head);
			}

			removeCSS() {
				if (this.stylesheet && document.contains(this.stylesheet)) this.stylesheet.remove();
			}

			onStop() {
				Patcher.unpatchAll();
				this.updateMessages();
				this.removeCSS();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get cdn() {
				return 'https://gitcdn.xyz/repo/Arashiryuu/crap/master/Miscellanious/jsMaterialThemeCodeblocksCSS/src.css';
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
				window.BdApi.alert('Missing Library', `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js">Click here to download the library!</a>`);
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
