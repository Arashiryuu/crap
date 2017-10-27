//META{"name":"orangeTexting"}*//

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

var orangeTexting = function(){};
var orangeTextingInterval;

var orangeTextingMainFunction = function(){
	$(".message-text>.markup").each((i, e) => {
		if(!$(e).find('.orangeTexting').length) {
			var strBase = $(e).text();
			if(strBase.substr(-1) === "<") {
				$(e).addClass("orangeTexting");
			}
		}
	});
};

orangeTexting.prototype.getName = function(){ return "orangeTextingPlugin"; };
orangeTexting.prototype.getDescription = function(){ return "Use a \"<\" at the end to start orangeTexting."; };
orangeTexting.prototype.getVersion = function(){ return "v1"; };
orangeTexting.prototype.getAuthor = function(){ return "Arashiryuu"; };

orangeTexting.prototype.load = function(){
	BdApi.injectCSS("orangeTexting-InjectedStyleSheet", ".markup.orangeTexting{color:#FB910A!important;}\
.markup.orangeTexting:hover{font-weight:bold;}\
");
};

orangeTexting.prototype.start = function(){
	orangeTextingInterval = setInterval(orangeTextingMainFunction, 100);	//change this lower if needed
};

orangeTexting.prototype.stop = function(){
	clearInterval(orangeTextingInterval);
};

orangeTexting.prototype.observer = function({addedNodes, removedNodes}) {
	if(addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
		orangeTextingMainFunction();	
	}
};

orangeTexting.prototype.getSettingsPanel = function(){ return "Go away!"; };
