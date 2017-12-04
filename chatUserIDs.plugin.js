//META{"name":"chatUserIDs"}*//

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

class chatUserIDs {
	constructor() {
		this.css = `<style id="chatUserIDsCSS" type="text/css">
			@import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';
			#tagID {
				font-size: 10px;
				letter-spacing: 0.025rem;
				position: relative;
				top: 0;
				height: 9px;
				margin-left: -4px;
				margin-right: 6px;
				text-shadow: 0 1px 3px black;
				background: #798AED;
				border-radius: 3px;
				font-weight: 500;
				padding: 3px 5px;
				color: #FFF;
				font-family: 'Roboto', 'Inconsolata', 'Whitney', sans-serif;
			}
			.message-group:not(.compact) h2 {
				display: flex;
				position: relative;
			}
			.message-group .comment .message.first ~ div > .edit-message .edit-container-inner .old-h2 {
				display: none;
			}
		</style>`;
		
		this.editObs = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change && change.target && change.target.classList && change.target.classList.contains('message-group')) {
					this.attachID();
				}
			}
		});
	}

	load() {
		this.log('Loaded');
	}

	stop() {
		this.chatDiscon();
		$('*').off('dblclick.chatID');
		$('.tagID, #chatUserIDsCSS').remove();
		this.log('Stopped');
	}

	start() {
		$('head').append(this.css);
		this.chatObserve();
		this.attachID();
		this.log('Started');
	}

	chatObserve() {
		const chat = document.querySelector('.chat');
		if(!chat) return;
		this.editObs.observe(chat, { attributes: true, subtree: true });
	}

	chatDiscon() {
		this.editObs.disconnect();
	}

	observer({ addedNodes, removedNodes }) {
		if(addedNodes && addedNodes.length && addedNodes[0] && addedNodes[0] instanceof Element && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')
		|| addedNodes && addedNodes.length && addedNodes[0] && addedNodes[0] instanceof Element && addedNodes[0].classList && addedNodes[0].classList.contains('chat')) {
			this.chatDiscon();
			this.attachID();
			this.chatObserve();
		}
		if(addedNodes && addedNodes.length && addedNodes[0] && addedNodes[0] instanceof Element && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')) {
			this.attachID();
		}
		if(removedNodes && removedNodes.length && removedNodes[0] && removedNodes[0] instanceof Element && removedNodes[0].classList && removedNodes[0].classList.contains('message-group')) {
			this.attachID();
		}
		if(removedNodes && removedNodes.length && removedNodes[0] && removedNodes[0] instanceof Element && removedNodes[0].classList && removedNodes[0].classList.contains('messages-wrapper')) {
			this.chatDiscon();
		}
	}

	attachID() {
		if(!document.querySelector('.message-group')) return;
		try {
			$('.message-group.hide-overflow').each((index, post) => {
				if(post.nodeType === 1 && post instanceof Element) {
					if($(post).find('.tagID') && $(post).find('.tagID').length > 0) return;
					if(!(post instanceof Element)) return;
					const elem = `<span id="tagID" class="tagID">${this.getReactInstance(post).return.memoizedProps.messages[0].author.id}</span>`;
					$(post).find('.username-wrapper').before(elem);
					$(post).find('.tagID').off('dblclick.chatID').on('dblclick.chatID', this.constructor.dblClickID.bind(this));
				}
			});
			if($('.message-group:not(.hide-overflow)').length > 0) {
				$('.message-group:not(.hide-overflow)').each((index, post) => {
					if($(post).find('.tagID') && $(post).find('.tagID').length > 0) return;
					if(!(post instanceof Element)) return;
					if(this.getReactInstance(post).return.key && this.getReactInstance(post).return.key.includes('upload')) {
						const elem = `<span id="tagID" class="tagID">${this.getReactInstance(post).return.memoizedProps.user.id}</span>`;
						$(post).find('.username-wrapper').before(elem);
						$(post).find('.tagID').off('dblclick.chatID').on('dblclick.chatID', this.constructor.dblClickID.bind(this));
					}
					else if(this.getReactInstance(post).return.memoizedProps.messages && this.getReactInstance(post).return.memoizedProps.messages.length > 0) {
						const elem = `<span id="tagID" class="tagID">${this.getReactInstance(post).return.memoizedProps.messages[0].author.id}</span>`;
						$(post).find('.username-wrapper').before(elem);
						$(post).find('.tagID').off('dblclick.chatID').on('dblclick.chatID', this.constructor.dblClickID.bind(this));
					}
				});
			}
		}
		catch(e) {
			this.err(e.stack);
		}
	}

	static dblClickID(e) {
		e.stopPropagation();
		try {
			document.execCommand('copy');
		}
		catch(err) {
			this.err(e.stack);
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

	log(text, extra) {
		if(typeof text !== 'string')
			return console.log(`[%c${this.getName()}%c]`, 'color: #59F;', '', text);
		if(!extra)
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '');
		else
			return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F;', '', extra);
	}

	err(error) {
		return console.error(`[%c${this.getName()}%c]`, 'color: #59F;', '', error);
	}

	getName() {
		return 'chatUserIDs';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.3';
	}

	getDescription() {
		return 'Adds a user\'s ID next to their name in chat, makes accessing a user ID simpler. Double-click to copy the ID.';
	}
};

/*@end@*/
