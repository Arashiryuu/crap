//META{"name":"MemberCount","displayName":"MemberCount","website":"https://github.com/Arashiryuu","source":"https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/MemberCount/MemberCount.plugin.js"}*//

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

var MemberCount = (() => {

	/* Setup */

	const config = {
		main: 'index.js',
		info: {
			name: 'MemberCount',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '2.0.3',
			description: 'Displays a server\'s member-count at the top of the member-list, can be styled with the #MemberCount selector.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/MemberCount/MemberCount.plugin.js'
		},
		changelog: [
			{
				title: 'What\'s New?',
				type: 'added',
				items: ['Moved to local library version.', 'Now renders in the memberlist using React.']
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
		const { SettingPanel, SettingGroup, SettingField, Textbox } = Settings;
		const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');

		const Counter = class Counter extends DiscordModules.React.Component {
			constructor(props) {
				super(props);
				this.state = {
					count: 0
				};
				this.updateCount = this.updateCount.bind(this);
			}

			componentWillMount() {
				Dispatcher.subscribe('COUNT_MEMBERS', this.updateCount);
			}

			componentWillUnmount() {
				Dispatcher.unsubscribe('COUNT_MEMBERS', this.updateCount);
			}

			componentDidMount() {
				if (!DiscordModules.SelectedGuildStore.getGuildId()) return;
				this.updateCount();
			}

			updateCount() {
				this.setState({ count: DiscordModules.GuildMemberStore.getMemberIds(DiscordModules.SelectedGuildStore.getGuildId()).length });
			}

			render() {
				const id = DiscordModules.SelectedGuildStore.getGuildId();
				if (this.props.blacklist && this.props.blacklist.includes(id) || !id) return null;
				return DiscordModules.React.createElement('div', {
					className: DiscordClasses.MemberList.membersGroup.value,
					id: 'MemberCount'
				}, `Members—${this.state.count}`);
			}
		}
		
		return class MemberCount extends Plugin {
			constructor() {
				super();
				this._css;
				this.default = { blacklist: [], placeholder: 'Server ID' };
				this.settings = Utilities.deepclone(this.default);
				this.loadedGuilds = [];
				this.switchList = [
					WebpackModules.getByProps('app').app,
					DiscordSelectors.TitleWrap.chat.value.split('.')[1],
					WebpackModules.getByProps('messages', 'messagesWrapper').messagesWrapper
				];
				this.css = `
					#MemberCount {
						position: absolute;
						font-size: 12px;
						letter-spacing: 0.08em;
						font-weight: 500;
						text-transform: uppercase;
						display: block;
						width: 100%;
						text-align: center;
						padding: 0.9vh 0;
						z-index: 5;
						top: 0;
					}
		
					.theme-dark #MemberCount {
						color: hsla(0, 0%, 100%, 0.4);
						background: #2f3136;
					} 
					
					.theme-light #MemberCount {
						color: #99aab5;
						background: #f3f3f3;
					}
		
					.${DiscordClasses.MemberList.membersWrap} .${DiscordClasses.MemberList.membersGroup}:nth-of-type(3) {
						margin-top: 3vh;
					}
				`;
			}

			/* Methods */

			onStart() {
				this.loadSettings();
				BdApi.injectCSS(this.name, this.css);
				this.patchMemberList();
				Toasts.info(`${this.name} ${this.version} has started!`, { icon: true, timeout: 2e3 });
			}

			onStop() {
				BdApi.clearCSS(this.name);
				Patcher.unpatchAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { icon: true, timeout: 2e3 });
			}

			patchMemberList() {
				const MemberList = WebpackModules.find((m) => m.hasOwnProperty('Themes') && m.hasOwnProperty('defaultProps'));
				
				Patcher.after(MemberList.prototype, 'render', (that, args, value) => {
					const channels = this.getProps(that, 'props.children.2.0.key');
					if (typeof channels === 'string' && channels.includes('section-container')) return value;

					const children = this.getProps(value, 'props.children.0.props.children.1.2');
					if (!children || !Array.isArray(children)) return value;
					
					const guildId = DiscordModules.SelectedGuildStore.getGuildId();
					if (this.settings.blacklist.includes(guildId)) return value;

					const counter = DiscordModules.React.createElement(Counter, { blacklist: this.settings.blacklist });

					children.unshift([counter, null]);

					if (!this.loadedGuilds.includes(guildId)) {
						DiscordModules.GuildActions.requestMembers([guildId], '', 0);
						this.loadedGuilds.push(guildId);
					}

					Dispatcher.dispatch('COUNT_MEMBERS');

					return value;
				});

				this.updateMemberList();
			}

			updateMemberList() {
				const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
				if (memberList) ReactTools.getOwnerInstance(memberList).forceUpdate();
			}

			/* Utility */

			/**
			 * Function to load settings.
			 */
			loadSettings() {
				PluginUtilities.loadSettings(this.name, this.settings.blacklist);
			}

			/**
			 * Function to save settings.
			 */
			saveSettings(settings) {
				PluginUtilities.saveSettings(this.name, settings);
			}

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

			async handleInput(e) {
				const input = $(`#plugin-settings-${this.name} input`);
				const isRemoval = (x) => (/^r$|^r\d{16,18}$/).test(x);
				const isID = (x) => (/^\d{16,18}$/).test(x);
		
				await new Promise((resolve) => setTimeout(resolve, 2e3));
		
				if (isRemoval(e)) {
					if (e.length > 1 && this.settings.blacklist.includes(e.slice(1))) this.settings.blacklist.splice(this.settings.blacklist.indexOf(e.slice(1)), 1);
					else this.settings.blacklist.pop();
					input.val('Removed from blacklist!');
					this.saveSettings(JSON.stringify(this.settings.blacklist));
					return setTimeout(() => input.val(''), 2e3);
				}
		
				if (!isID(e)) return;
				if (!this.settings.blacklist.includes(e)) this.settings.blacklist.push(e);
				if (!input) return;
		
				input.val('Added to blacklist!');
				this.saveSettings(JSON.stringify(this.settings.blacklist));
				setTimeout(() => input.val(''), 2e3);
			}

			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(JSON.stringify(this.settings.blacklist)),
					new SettingGroup('Plugin Settings').append(
						new Textbox('Blacklist', 'Do `r` or `r234780924003221506` for removals.', this.settings.placeholder, (i) => this.handleInput(i))
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
