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
		this.messageList = ['container-1YxwTf', 'message-1PNnaP', 'markup-2BOw-j'];
		this.switchList = ['app', 'chat-3bRxxu', 'messagesWrapper-3lZDfY'];

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
			'arguments':'arguments',
			'parseInt':'parseInt',
			'require':'require',
			'typeof':'typeof',
			'isNaN':'isNaN',
			'this':'this',
			'void':'void',
			'new':'new',
			'in':'in',
			'of':'of'
		};
	};

	createThisClass() {
		try {
			let kws, t, w;
			for (const s of this.selectors) {
				kws = document.querySelectorAll(s);
				for (const k of kws) {
					t = k.innerText;
					w = this.getWord(t);
					if (w && !$(k).hasClass(w)) {
						$(k).addClass(w);
					}
				}
			}
		} catch(e) {
			this.err(e);
		}
	};

	paramParse() {
		let params = document.querySelectorAll('.hljs-params:not(.hljs-no-param)');

		if (!params.length) return;
		
		const noParam = [...params].filter((param) => param.textContent === '()');

		if (noParam.length) {
			for (const param of noParam) param.classList.add('hljs-no-param');
		}

		params = document.querySelectorAll('.hljs-params:not(.hljs-no-param)');

		if (!params.length) return;

		for (const param of params) {
			if (param.innerHTML.indexOf(',') > -1) {
				const split = param.innerHTML.split(',')
					, len = split.length;
				for (let i = 0; i < len; i++) split[i] = split[i].trim();
				param.innerHTML = split.join('<span class="hljs-separator">, </span>');
			}
		}
	};

	getWord(text) {
		if (this.keywords.hasOwnProperty(text)) {
			return this.keywords[text];
		}

		return null;
	};

	log() {
		return console.log('%c[JSMaterialThemeCodeblocks]', 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', ...arguments);
	};

	err() {
		return console.error('%c[JSMaterialThemeCodeblocks]', 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', ...arguments);
	};

	inject() {
		let sheet = document.getElementById('MaterialCodeblocksCSS');
		if (!sheet || !document.contains(sheet)) {
			sheet = document.createElement('link');
			sheet.setAttribute('id', 'MaterialCodeblocksCSS');
			sheet.setAttribute('rel', 'stylesheet preload');
			sheet.setAttribute('as', 'style');
			sheet.setAttribute('href', 'https://gitcdn.xyz/repo/Arashiryuu/crap/master/Miscellanious/jsMaterialThemeCodeblocksCSS/src.css');
			document.head.appendChild(sheet);
		}
	}

	eject() {
		const sheet = document.getElementById('MaterialCodeblocksCSS');
		if (sheet && document.contains(sheet)) sheet.remove();
	}

	start() {
		this.inject();
		this.createThisClass();
		this.log('Started.');
	};

	stop() {
		this.eject();
		this.log('Stopped.');
	};

	load() {
		this.log('Loaded.');
	};

	observer({ addedNodes }) {
		if (addedNodes.length && addedNodes[0].classList && this.messageList.includes(addedNodes[0].classList[addedNodes[0].classList.length - 1])) {
			setTimeout(() => { this.createThisClass(); setTimeout(() => this.paramParse(), 500); }, 250);
		} else if (addedNodes.length && addedNodes[0].classList && this.switchList.includes(addedNodes[0].classList[0])) {
			setTimeout(() => { this.createThisClass(); setTimeout(() => this.paramParse(), 500); }, 250); 
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
