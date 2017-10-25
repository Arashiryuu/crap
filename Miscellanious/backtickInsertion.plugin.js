//META{"name":"backtickInsertion"}*//

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

class backtickInsertion {
	constructor() {
		// construct global variables
	}
	start() {
		this.log('Started');
		this.init();
	}
	stop() {
		this.log('Stopped');
		$('.channel-text-area-default div textarea').off('keyup.backIn');
	}
	load() {
		this.log('Loaded');
	}
	log(text) {
		return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #59F; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
	}
	onSwitch() {
		this.init();
	}
	init() {
		const textArea = $('.channel-text-area-default div textarea');
		if(!textArea.length) return;
		textArea.off('keyup.backIn').on('keyup.backIn', (e) => {
			if(textArea.val().includes('\'\'\'')) {
				textArea.val(textArea.text().replace(/'''/g, '`'.repeat(3)));
				document.execCommand('textInsert', false, '`'.repeat(3));
			}
		});
	}
	getName() {
		return 'backtickInsertion';
	}
	getAuthor() {
		return 'Arashiryuu';
	}
	getVersion() {
		return '1.1';
	}
	getDescription() {
		return 'Replace any consecutive triple apostrophies \'\'\' that you may have input with \`\`\` consecutive triple backticks; AKA grave-accents, making markdown for codeblocks slightly simpler to achieve.';
	}
	getSettingsPanel() {
		return;
	}
};

/*@end@*/
