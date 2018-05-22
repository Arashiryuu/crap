//META{"name":"JSMaterialThemeCodeblocks"}*//

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

class JSMaterialThemeCodeblocks {
	constructor() {
		this.selectors = [
			'.hljs[class~="js" i] .hljs-keyword', 
			'.hljs[class~="jsx" i] .hljs-keyword', 
			'.hljs[class~="javascript" i] .hljs-keyword',
			'.hljs[class~="js" i] .hljs-built_in',
			'.hljs[class~="jsx" i] .hljs-built_in',
			'.hljs[class~="javascript" i] .hljs-built_in'
		];

		this.keywords = {
			'instanceof':'instanceof',
			'parseInt':'parseInt',
			'require':'require',
			'isNaN':'isNaN',
			'this':'this',
			'new':'new'
		};

		this.editObs = new MutationObserver((changes) => {
			for(const change of changes) {
				if(change && change.target && change.target.classList && change.target.classList.contains('message-group')) {
					this.createThisClass();
					setTimeout(() => this.createThisClass(), 5e2);
				}
			}
		});

		this.css;
	};

	createThisClass() {
		try {
			for(const s of this.selectors) {
				const kws = $(s);
				for(const k of Object.values(kws)) {
					const t = $(k).text();
					const w = this.getWord(t);
					if(w && !$(k).hasClass(w)) {
						$(k).addClass(w);
					}
				}
			}
		} catch(e) {
			this.err(e);
		}
	};

	getWord(text) {
		if(this.keywords[text]) {
			return this.keywords[text];
		}

		return null;
	};

	log(text, ...ex) {
		if(typeof text === 'string')
			return console.log(`%c[JSMaterialThemeCodeblocks]%c ${text}`, 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '', ...ex);
		else
			return console.log('%c[JSMaterialThemeCodeblocks]%c', 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '', text, ...ex);
	};

	err(error, ...ex) {
		return console.error('%c[JSMaterialThemeCodeblocks]%c', 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '', error, ...ex);
	};

	createElement(type = '', props = {}) {
		if(typeof type !== 'string' || typeof props !== 'object') throw new TypeError('Parameter `type` must be a string, and parameter `props` must be an object.');

		const e = document.createElement(type);

		for(const prop in props) {
			e[prop] = props[prop];
		}

		return e;
	}

	start() {
		this.log('Started.');
		this.css = this.createElement('style', {
			id: 'JSMaterialThemeCodeblocksCSS',
			type: 'text/css',
			textContent: '@import url("https://gitcdn.xyz/repo/Arashiryuu/crap/master/Miscellanious/jsMaterialThemeCodeblocksCSS/src.css");'
		});
		$('head').append(this.css);
		this.watch();
		this.createThisClass();
		this.log('MaterialTheme classes integrated.');
	};

	stop() { 
		this.log('Stopped.');
		this.unwatch();
		$('#JSMaterialThemeCodeblocksCSS').remove();
	};

	load() {
		this.log('Loaded.');
	};

	watch() {
		const chat = document.querySelector('.chat');
		if(!chat) return;
		this.editObs.observe(chat, { attributes: true, subtree: true });
	}

	unwatch() {
		this.editObs.disconnect();
	}

	observer({ addedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && ( addedNodes[0].classList.contains('message-group') || addedNodes[0].classList.contains('message') || addedNodes[0].classList.contains('markup') )) {
			setTimeout(() => this.createThisClass(), 250);
		}
		if(addedNodes.length && addedNodes[0].classList && ( addedNodes[0].classList.contains('chat') || addedNodes[0].classList.contains('messages-wrapper') )) {
			this.unwatch();
			this.watch();
			setTimeout(() => this.createThisClass(), 250); 
			setTimeout(() => this.log('MaterialTheme classes integrated.'), 500);
		}
	};

	getName() {
		return 'JSMaterialThemeCodeblocks';
	};

	getAuthor() {
		return 'Arashiryuu';
	};

	getVersion() {
		return '3.0.0';
	};

	getDescription() {
		return 'Applies the "Material Theme" to JavaScript codeblocks.';
	};
};

/*@end@*/
