//META{"name":"catImg"}*//

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

class catImg {
	load() {
		this.log('Loaded');
	}

	stop() {
		$('#app-mount form > div > div > textarea').off('keyup.cat');
		this.log('Stopped');
	}

	start() {
		this.log('Started');
		this.textListen();
	}

	textListen() {
		const tea = $('#app-mount form > div > div > textarea');
		if(!tea[0]) return;
		tea.off('keyup.cat').on('keyup.cat', async (e) => {
			const catRegex = /\B\/cat/igm;
			const val = tea.val();
			if(val.includes('/cat')) {
				const catIndex = val.indexOf('/cat');
				const pre = val[catIndex - 1] === '/' ? true : false;
				if(!pre) {
					const randCat = await this.genLink;
					tea.val(tea.text().replace(/\/cat/igm, ''));
					tea.focus();
					document.execCommand('insertText', false, randCat);
				}
			}
		});
	}

	get genLink() {
		return (async () => {
			try {
				const base = await fetch('https://aws.random.cat/meow');
				const { file } = await base.json();
				return file;
			}
			catch(e) {
				this.err(e);
				return null;
			}
		})();
	}

	observer({ addedNodes }) {
		if(addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes && addedNodes[0] && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.textListen();
		}
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
		return console.error(`[%c${this.getName()}%c] ${error}`, 'color: #59F;', '');
	}

	getName() {
		return 'catImg';
	}

	getAuthor() {
		return 'Arashiryuu';
	}

	getVersion() {
		return '1.0.1';
	}

	getDescription() {
		return 'Replaces `/cat` in the textarea with a randomly generated link to a cat image or gif.';
	}
};

/*@end@*/
