//META{"name":"hashTagging"}*//

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

class hashTagging {
	constructor() {
		this.css = `<style id="hashTagCSS" type="text/css">
		  #hashtag {
			color: #3898FF;
			font-weight: bold;
		  }
		</style>`;
	};

	load() {

	};

	stop() {
		$('#hashTagCSS').remove();
	};

	start() {
		$('head').append(this.css);
		this.processChat();
	};

	processChat() {
		if(document.readyState !== 'complete') return setTimeout(() => this.processChat(), 1e3);

		setTimeout(function() {
			$(".comment .body .markup:not(.line-scanned), .comment .markup>span:not(.line-scanned)").each((i, e) => {
				const tagRegex = /\B#[A-Z0-9a-z_-]+/igm;
				const html = $(e).html();
				if(tagRegex.test(html) && !$(e).children().first().hasClass('mention')) {
					const index = html.indexOf('#');
					if(index > 0) {	
						const pre = html[index - 1] === '/' ? true : false;
						if(!pre) {
							$(e).html(html.replace(tagRegex, `<span id="hashtag">$&</span>`));
						}
					} else {
						$(e).html(html.replace(tagRegex, `<span id="hashtag">$&</span>`));	
					}
				}
			}).addClass("line-scanned");
		}, 1e2);
	};

	observer({ addedNodes, removedNodes }) {
		if(addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message-group')
		|| addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.processChat();
		}
	};

	getName() { 
		return 'hashTagging';
	};

	getAuthor() { 
		return 'Arashiryuu';
	};

	getVersion() { 
		return '1.2.3';
	};

	getDescription() { 
		return 'Start a word or sentence with a \"#\" to hashtag!';
	};

	getSettingsPanel() { 
		return 'Go away!';
	};
};

/*@end@*/
