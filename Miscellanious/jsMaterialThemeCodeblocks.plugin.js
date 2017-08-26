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
		this.css = `
			<style class='JSMaterialThemeCodeblocks'>

			/*.hljs[class~="js" i] .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .hljs-built_in.paIn {
				color: #82AAFF !important;
			}

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs[class~="js" i] {
    		background: #263239 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs[class~="js" i] .hljs-addition, #app-mount code.hljs[class~="js" i] .hljs-keyword, #app-mount code.hljs[class~="js" i] .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs[class~="js" i] .hljs-built_in, #app-mount .hljs[class~="js" i] .hljs-deletion, #app-mount .hljs[class~="js" i] .hljs-attribute, #app-mount .hljs[class~="js" i] .hljs-class .hljs-title, #app-mount .hljs[class~="js" i] .hljs-template-variable, #app-mount .hljs[class~="js" i] .hljs-type, #app-mount .hljs[class~="js" i] .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs[class~="js" i] .hljs-bullet, #app-mount .hljs[class~="js" i] .hljs-link, #app-mount .hljs[class~="js" i] .hljs-meta .hljs-keyword, #app-mount .hljs[class~="js" i] .hljs-selector-attr, #app-mount .hljs[class~="js" i] .hljs-selector-pseudo, #app-mount .hljs[class~="js" i] .hljs-subst, #app-mount .hljs[class~="js" i] .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs[class~="js" i] .hljs-doctag,
			#app-mount .hljs[class~="js" i] .hljs-meta,
			#app-mount .hljs[class~="js" i] .hljs-meta-string,
			#app-mount .hljs[class~="js" i] .hljs-regexp, #app-mount .hljs[class~="js" i] .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs[class~="js" i] .hljs-number,
			#app-mount .hljs[class~="js" i] .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs[class~="js" i] .hljs-params {
				color: #eee;
			}

			#app-mount .hljs[class~="js" i] .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs[class~="js" i] .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs[class~="js" i] .hljs-built_in.isN,
			#app-mount .hljs[class~="js" i] .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs[class~="js" i] .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs[class~="js" i] .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs[class~="js" i] .hljs-name, .theme-dark .hljs[class~="js" i] .hljs-section, .theme-dark .hljs[class~="js" i] .hljs-selector-class, .theme-dark .hljs[class~="js" i] .hljs-selector-id, .theme-dark .hljs[class~="js" i] .hljs-title {
				color: #82aaff;
			}
			
			/*.hljs[class~="javascript" i] .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs[class~="javascript" i] {
    		background: #263239 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs[class~="javascript" i] .hljs-addition, #app-mount code.hljs[class~="javascript" i] .hljs-keyword, #app-mount code.hljs[class~="javascript" i] .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-built_in, #app-mount .hljs[class~="javascript" i] .hljs-deletion, #app-mount .hljs[class~="javascript" i] .hljs-attribute, #app-mount .hljs[class~="javascript" i] .hljs-class .hljs-title, #app-mount .hljs[class~="javascript" i] .hljs-template-variable, #app-mount .hljs[class~="javascript" i] .hljs-type, #app-mount .hljs[class~="javascript" i] .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-bullet, #app-mount .hljs[class~="javascript" i] .hljs-link, #app-mount .hljs[class~="javascript" i] .hljs-meta .hljs-keyword, #app-mount .hljs[class~="javascript" i] .hljs-selector-attr, #app-mount .hljs[class~="javascript" i] .hljs-selector-pseudo, #app-mount .hljs[class~="javascript" i] .hljs-subst, #app-mount .hljs[class~="javascript" i] .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-doctag,
			#app-mount .hljs[class~="javascript" i] .hljs-meta,
			#app-mount .hljs[class~="javascript" i] .hljs-meta-string,
			#app-mount .hljs[class~="javascript" i] .hljs-regexp, #app-mount .hljs[class~="javascript" i] .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-number,
			#app-mount .hljs[class~="javascript" i] .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-params {
				color: #eee;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-built_in.isN,
			#app-mount .hljs[class~="javascript" i] .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs[class~="javascript" i] .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs[class~="javascript" i] .hljs-name, .theme-dark .hljs[class~="javascript" i] .hljs-section, .theme-dark .hljs[class~="javascript" i] .hljs-selector-class, .theme-dark .hljs[class~="javascript" i] .hljs-selector-id, .theme-dark .hljs[class~="javascript" i] .hljs-title {
				color: #82aaff;
			}

		</style>`;
	};

	createThisClass() {
		let slef = $('.hljs.js .hljs-keyword:contains(this)'),
		isNuN = $('.hljs.js .hljs-built_in:contains(isNaN)'),
		ewn = $('.hljs.js .hljs-keyword:contains(new)'),
		paIn = $('.hljs.js .hljs-built_in:contains(parseInt)'),
		rqr = $('.hljs.js .hljs-built_in:contains(require)');
		if(slef || $('.hljs.JS .hljs-keyword:contains(this)') || $('.hljs.Js .hljs-keyword:contains(this)') || $('.hljs.javascript .hljs-keyword:contains(this)') || $('.hljs.Javascript .hljs-keyword:contains(this)') || $('.hljs.JAVASCRIPT .hljs-keyword:contains(this)') || $('.hljs.JavaScript .hljs-keyword:contains(this)')) {
			slef.addClass('this');
			$('.hljs.JS .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.Js .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.javascript .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.Javascript .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.JAVASCRIPT .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.JavaScript .hljs-keyword:contains(this)').addClass('this');
		}
		if(isNuN || $('.hljs.JS .hljs-built_in:contains(isNaN)') || $('.hljs.Js .hljs-built_in:contains(isNaN)') || $('.hljs.javascript .hljs-built_in:contains(isNaN)') || $('.hljs.Javascript .hljs-built_in:contains(isNaN)') || $('.hljs.JAVASCRIPT .hljs-built_in:contains(isNaN)') || $('.hljs.JavaScript .hljs-built_in:contains(isNaN)')) {
			isNuN.addClass('isN');
			$('.hljs.JS .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.Js .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.javascript .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.Javascript .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.JAVASCRIPT .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.JavaScript .hljs-built_in:contains(isNaN)').addClass('isN');
		}
		if(ewn || $('.hljs.JS .hljs-keyword:contains(new)') || $('.hljs.Js .hljs-keyword:contains(new)') || $('.hljs.javascript .hljs-keyword:contains(new)') || $('.hljs.Javascript .hljs-keyword:contains(new)') || $('.hljs.JAVASCRIPT .hljs-keyword:contains(new)') || $('.hljs.JavaScript .hljs-keyword:contains(new)')) {
			ewn.addClass('new');
			$('.hljs.JS .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.Js .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.javascript .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.Javascript .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.JAVASCRIPT .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.JavaScript .hljs-keyword:contains(new)').addClass('new');
		}
		if(rqr || $('.hljs.JS .hljs-built_in:contains(require)') || $('.hljs.Js .hljs-built_in:contains(require)') || $('.hljs.javascript .hljs-built_in:contains(require)') || $('.hljs.Javascript .hljs-built_in:contains(require)') || $('.hljs.JAVASCRIPT .hljs-built_in:contains(require)') || $('.hljs.JavaScript .hljs-built_in:contains(require)')) {
			rqr.addClass('rqr');
			$('.hljs.JS .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.Js .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.javascript .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.Javascript .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.JAVASCRIPT .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.JavaScript .hljs-built_in:contains(require)').addClass('rqr');
		}
		if(paIn || $('.hljs.Js .hljs-built_in:contains(parseInt)') || $('.hljs.JS .hljs-built_in:contains(parseInt)') || $('.hljs.javascript .hljs-built_in:contains(parseInt)') || $('.hljs.Javascript .hljs-built_in:contains(parseInt)') || $('.hljs.JavaScript .hljs-built_in:contains(parseInt)') || $('.hljs.JAVASCRIPT .hljs-built_in:contains(parseInt)')) {
			paIn.addClass('paIn');
			$('.hljs.Js .hljs-built_in:contains(parseInt)').addClass('paIn');
			$('.hljs.JS .hljs-built_in:contains(parseInt)').addClass('paIn');
			$('.hljs.javascript .hljs-built_in:contains(parseInt)').addClass('paIn');
			$('.hljs.Javascript .hljs-built_in:contains(parseInt)').addClass('paIn');
			$('.hljs.JavaScript .hljs-built_in:contains(parseInt)').addClass('paIn');
			$('.hljs.JAVASCRIPT .hljs-built_in:contains(parseInt)').addClass('paIn');
		} else
			return;
	};

	log(text) {
		return console.log(`%c[JSMaterialThemeCodeblocks]%c ${text}`, 'color: #F95479; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
	};

	start() {
		this.log('Started.');
		$('head').append(this.css);
		this.createThisClass();
		this.log('MaterialTheme classes integrated.');
	};
	stop() { 
		this.log('Stopped.');
		$('.JSMaterialThemeCodeblocks').remove();
	};
	load() { this.log('Loaded.'); };
	unload() {};
	observer(ejs) {
		if(ejs.addedNodes.length && ejs.addedNodes[0].classList && ejs.addedNodes[0].classList.contains('markup'))
			setTimeout(() => this.createThisClass(), 250);
		else
			return;
	};
	onMessage() {};
	onSwitch() { 
		setTimeout(() => this.createThisClass(), 250); 
		setTimeout(() => this.log('MaterialTheme classes integrated.'), 500);
	};

	getName			() { return 'JSMaterialThemeCodeblocks'; };
	getAuthor		() { return 'Arashiryuu'; };
	getVersion		() { return '2.0.0'; };
	getDescription	() { return 'Applies the "Material Theme" to JavaScript codeblocks.'; };
	getSettingsPanel() { return '<span class="JSMTCBSettings" style="font-family: \'FangSong\'">你已经死了。</span>'; };
};
/*@end@*/
