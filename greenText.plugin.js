//META{"name":"greenText"}*//

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

var greenText = function(){};
var greenTextInterval;

var greenTextMainFunction = function() {
	$(".message-text>.markup, .message-text>.markup>.message-content").each((i, e) => {
		if(!$(e).find('.greenText').length) {
			const strBase = $(e).text();
			if(strBase.substr(0,1) === ">") {
				$(e).addClass("greenText");
			}
		}
	});
};

greenText.prototype.getName = function(){ return "greenText Plugin"; };
greenText.prototype.getDescription = function(){ return "Use a \">\" at the start of a post to turn text green, like on 4chan."; };
greenText.prototype.getVersion = function(){ return "1.0b"; };
greenText.prototype.getAuthor = function(){ return "Arash"; };

greenText.prototype.load = function(){
	BdApi.injectCSS("greenText-InjectedStyleSheet", ".markup.greenText{color:#709900!important;}\
.markup.greenText:hover{font-weight:bold;}\
");
};

greenText.prototype.start = function(){
	greenTextInterval = setInterval(greenTextMainFunction, 100);	//change this lower if needed
};

greenText.prototype.stop = function(){
	clearInterval(greenTextInterval);
};

greenText.prototype.observer = function({addedNodes, removedNodes}) {
	if(addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
		greenTextMainFunction();
	}
};
greenText.prototype.getSettingsPanel = function(){ return "There are no settings here."; };
