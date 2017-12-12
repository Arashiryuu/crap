//META{"name":"killxd"}*//

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
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

class killxd {
	load() {
	
	}
	
	stop() {
	
	}

	start() { 
		this.processChat(); 
	}
	
	processChat() {
		setTimeout(function() {
			$(".chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(pre), .chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(code)").each((i, e) => {
				const tagRegex = /(?:\bXD\b)/igm;
				const html = $(e).html();
				if(tagRegex.test(html)) {
					$(e).html(html.replace(tagRegex, 'I\'m a retard lol.'));
				}
			});
		 }, 100);
	}
	
	observer({addedNodes, removedNodes}) {
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('markup')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('hide-overflow')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
      		this.processChat();
    	}
  	}
	
	getName() {
		return 'killxd'; 
	}
	
  	getAuthor() {
		return 'Arashiryuu'; 
	}
	
  	getVersion() {
		return '1.2.1'; 
	}
	
	getDescription() {
		return 'replaces shitty xds.'; 
	}
};

/*@end@*/
