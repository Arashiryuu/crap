//META{"name":"charCounterV2"}*//

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

class charCounterV2 {

	start() {
  		this.injectCss();
  		this.inject();
  	};

	injectCss() {
    	BdApi.clearCSS("charCounter");
    	BdApi.injectCSS("charCounter", `
    	#charcounter {
        	display: block;
        	position: absolute;
        	right: 0;
        	opacity: .5;
    	}`);
	};

	inject() {
    	let ta = $(".channel-text-area-default");
    	if(!ta.length) return;
    	if($("#charcounter").length) return;
    	ta.append($("<span/>", { 'id': 'charcounter', 'text': `${$(".channel-text-area-default div textarea").val().length}/2000` }));
    	$(".channel-text-area-default div textarea").off("keyup.charcounter").on("keyup.charCounter", (e) => {
    		$("#charcounter").text(`${e.target.value.length}/2000`);
    		if($(".channel-text-area-default div textarea").val().length <= 500) {
    			return $("#charcounter").css("color", "limegreen");
    		} else if($(".channel-text-area-default div textarea").val().length <= 1000) {
    			return $("#charcounter").css("color", "yellow");
    		} else if($(".channel-text-area-default div textarea").val().length <= 1500) {
    			return $("#charcounter").css("color", "orange");
    		} else if($(".channel-text-area-default div textarea").val().length <= 2000) {
				return $("#charcounter").css("color", "red");
    		}
    	});
	};

	load() {};

	stop() {
    	BdApi.clearCSS("charCounter");
    	$(".channel-text-area-default div textarea").off("keyup.charcounter");
	};

	onSwitch() {
    	this.inject();
	};

	observer(e) {};

	getSettingsPanel() { 
		return ""; 
	};

	getName() {
    	return "Character Counter";
	};

	getDescription() {
    	return "Adds a character counter to channel textarea. \nNow using Class syntax courtesy of Ara. \nUpdated to work with new textarea as of 22\/07\/2017.";
	};

	getVersion() {
    	return "0.2.0";
	};

	getAuthor() {
    	return "Jiiks";
	};
};
