//META{"name":"hashTagging"}*//

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

class hashTagging {
 constructor() {
  this.processChat = () => {
	 setTimeout(function() {
		$(".comment .body .markup:not(.line-scanned), .comment .markup>span:not(.line-scanned)").each(function(node) {
			var tagRegex = /\B#[A-Z0-9a-z_-]+/igm;
			var html = $(this).html();
			if(tagRegex.test(html)) {
				$(this).html(html.replace(tagRegex, `<span id="hashtag" style='color: #3898FF; font-weight: bold;'>$&</span>`));
			}
		}).addClass("line-scanned");
	 },250);
  }
 };

  start() { this.processChat(); }
	 
  stop() {}
	 
  load() {}
	
  unload() {}
	
	observer(eht) {
    if(eht.addedNodes.length && eht.addedNodes[0].classList && eht.addedNodes[0].classList.contains('message-group')) {
      this.processChat();
    }
    if(eht.addedNodes.length && eht.addedNodes[0].classList && eht.addedNodes[0].classList.contains('markup')) {
      this.processChat();
    } else
        return;
  };
	 
  onMessage() { this.processChat(); }
	 
  onSwitch() { setTimeout(() => this.processChat(), 250); }

  getName() { return 'hashTagging'; }
  getAuthor() { return 'Arashiryuu'; }
  getVersion() { return '1.2.0'; }
  getDescription() { return 'Start a word or sentence with a \"#\" to hashtag.'; }
  getSettingsPanel() { return 'Go away!'; }
};
/*@end @*/
