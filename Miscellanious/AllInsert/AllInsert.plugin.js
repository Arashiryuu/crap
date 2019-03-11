//META{"name":"AllInsert","displayName":"AllInsert","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap"}*//

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

var AllInsert = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'AllInsert',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '1.0.0',
			description: 'Replaces text and inserts replacement strings.',
			github: 'https://github.com/Arashiryuu',
			github_raw: ''
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

	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
		const { Toasts, Logger, Patcher, Settings, Utilities, DOMTools, ReactTools, ReactComponents, DiscordModules, WebpackModules, DiscordSelectors } = Api;
		const { SettingPanel, SettingGroup, SettingField, RadioGroup, Switch } = Settings;
		const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');

		const has = Object.prototype.hasOwnProperty;
		
		return class AllInserts extends Plugin {
			constructor() {
				super();
				this._css;
			}

			/* Methods */

			onStart() {
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
				this.patchTextareaComponent();
			}

			onStop() {
				Patcher.unpatchAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			async patchTextareaComponent() {
				const Textarea = await ReactComponents.getComponentByName('ChannelTextAreaForm', `${WebpackModules.getByProps('chat').chat.replace(/\s/, '.')} form`);
				
				Patcher.after(Textarea.component.prototype, 'componentDidUpdate', (that, args, value) => {
					const state = this.getProps(that, 'state');
					if (!state.textValue) return value;

					for (const key in this.values) {
						if (state.textValue.includes(key)) that.handleTextareaChange(that, this.replaceStrings(state.textValue, key));
					}
					
					return value;
				});

				Textarea.forceUpdateAll();
			}

			replaceStrings(string, key) {
				if (!has.call(this.values, key)) return string;
				return string.replace(new RegExp(key), this.values[key]);
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

			/* Setters */

			set css(style = '') {
				return this._css = style.split(/\s+/g).join(' ').trim();
			}

			/* Getters */

			get [Symbol.toStringTag]() {
				return 'Plugin';
			}

			get values() {
				return {
					'>=':'\u2265',
					'<=':'\u2264',
					'\'\'\'':'```',
					'==>':'\u21D2',
					'=/=':'\u2260',
					'/.l':'\u2190',
					'/.u':'\u2191',
					'/.r':'\u2192',
					'/.d':'\u2193',
					'/.>':'\u27A2',
					'/.-':'\u2014'
				};
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
