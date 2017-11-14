//META{"name":"Replyer"}*//

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

class Replyer {
	constructor() {
		this.initialized = false;

		this.css = `<style id="${this.getName()}" type="text/css">
			.replyer {
				transition: all 300ms ease;
				position: relative;
				top: -1px;
				margin-left: 5px;
				padding: 3px 5px;
				background: rgba(0, 0, 0, 0.4);
				border-radius: 3px;
				color: #EEE;
				font-size: 10px;
				text-transform: uppercase;
				cursor: pointer;
			}

			.replyer:hover {
				background: rgba(0, 0, 0, 0.6);
				text-shadow: 0 0 1px currentColor;
			}

			.message-group:not(:hover) .replyer {
				display: none;
			}
		</style>`;

		this.editObs = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change && change.target && change.target.classList && change.target.classList.contains('message-group')) {
					this.run();
				}
			}
		});
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		this.chatDiscon();
		$('*').off('click.replyer');
		$('#Replyer, .replyer').remove();
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

		if (typeof window.ZeresLibrary !== 'undefined') this.initialize();
		else libraryScript.on('load', () => this.initialize());
	}

	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.downLink);
		$('head').append(this.css);
		this.initialized = true;
		PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
		this.run();
		this.chatObserve();
	}

	chatObserve() {
		const chat = $('.chat');
		if(!chat[0]) return;
		this.editObs.observe(chat[0], { attributes: true, subtree: true });
	}

	chatDiscon() {
		this.editObs.disconnect();
	}

	run() {
		if(!document.querySelector('.message-group')) return;
		$('.message-group').each((index, element) => {
			if($(element).find('.replyer').length > 0) return;
			$(element).find('.timestamp').after('<div id="replyer" class="replyer">Reply</div>');
			$(element).find('.replyer').on('click.replyer', (event) => {
				try {
					const
						mention = `<@!${this.getReactInstance(element).return.memoizedProps.messages[0].author.id}> `;
					$('#app-mount form > div > div > textarea').focus();
					document.execCommand('insertText', false, mention);
				}
				catch(error) {
					this.err(error);
				}
			});
		});
	}

	observer({ addedNodes, removedNodes }) {
		if(addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')) {
			this.run();
		}
		if(addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.run();
			this.chatObserve();
		}
		if(removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('chat')
		|| removedNodes.length && removedNodes[0].classList && removedNodes[0].classList.contains('messages-wrapper')) {
			this.chatDiscon();
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
		return `https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/${this.getName()}.plugin.js`;
	}

	getName() {
		return 'Replyer';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.1.1';
	}

	getDescription() {
		return 'Reply to people with the push of a button.';
	}
};

/*@end@*/
