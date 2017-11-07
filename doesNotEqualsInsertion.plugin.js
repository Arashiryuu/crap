//META{"name":"doesNotEqualsInsertion"}*//

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

class doesNotEqualsInsertion {
	constructor() {
	
	}
	start() {
		this.log('Started');
		this.begin();
	}
	stop() {
		this.log('Stopped');
		$('#app-mount form > div > div > textarea').off('keyup.dnEI');
	}
	load() {
		this.log('Loaded');
	}
	log(text) {
		return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
	}
	observer({ addedNodes, removedNodes }) {
		if(addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.begin();
		}
	}
	begin() {
		const teA = $('#app-mount form > div > div > textarea');
		if(!teA.length) return;
		teA.off('keyup.dnEI').on('keyup.dnEI', (e) => {
			if(teA.val().includes('\=\/\=')) {
				teA.val(teA.text().replace(/=\/=/g, ''));
				document.execCommand('insertText', false, '\u2260');
			}
		});
	}
	getName() {
		return 'doesNotEqualsInsertion';
	}
	getAuthor() {
		return 'Arashiryuu';
	}
	getVersion() {
		return '1';
	}
	getDescription() {
		return 'Replace any `\=\/\=` with `\≠`';
	}
	getSettingsPanel() {
		return;
	}
};

/*@end@*/
