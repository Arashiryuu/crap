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
    this.css = `
    <style id="chatUserIDsCSS" type="text/css">
      @import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';
      #tagID {
        font-size: 12px;
        padding: 6px 6px 0 0;
        color: #EEE;
        font-family: 'Roboto', 'Inconsolata', 'Whitney', sans-serif;
      }
    </style>`;
	}

	load() {
		this.log('Loaded');
	}

	stop() {
    $('.tagID, #chatUserIDsCSS').remove();
		this.log('Stopped');
	}

	start() {
    $('head').append(this.css);
    this.attachID();
		this.log('Started');
	}

	onSwitch() {
		setTimeout(() => this.attachID(), 1e3);
	}

	observer({ addedNodes, removedNodes }) {
    if(addedNodes.length > 0 && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')
    || addedNodes.length > 0 && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
      this.attachID();
    }
    if(removedNodes.length > 0 && removedNodes[0].classList && removedNodes[0].classList.contains('message-group')) {
      this.attachID();
    }
	}

	attachID() {
    if(!$('.message-group').length) return;
    try {
      $('.message-group').each((index, post) => {
        if($(post).find('.tagID').length > 0) return;
        const elem = `<span id="tagID" class="tagID">[ ${this.getReactInstance($(post)[0]).return.memoizedProps.messages[0].author.id} ]</span>`;
        $(post).find('.username-wrapper > .user-name').before(elem);
      });
    }
    catch(e) {
      console.error(e);
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

	getName() {
		return 'chatUserIDs';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1';
	}

	getDescription() {
		return 'Adds a user\'s ID next to their name in chat, makes accessing a user ID simpler.';
	}

	getSettingsPanel() {
		return;
	}
};

/*@end@*/
