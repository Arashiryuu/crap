//META{"name":"TitleForTitle"}*//

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

function TitleForTitle() {
  const uwu = this;
  uwu.start = () => {
    if($('#TitleforTitlebar').length) return;
    const tElem = $('<span/>', { 
      id: 'TitleforTitlebar', 
      text: '\u200b'
    });
    const titleCSS = `
    <style id="TitleforTitlebarCSS" type="text/css">
      @import 'https://fonts.googleapis.com/css?family=Roboto|Inconsolata';
      #app-mount .chat .title-wrap .title {
        display: none;
      }
      #TitleforTitlebar {
        position: absolute;
        color: #EEE;
        top: 1ex;
        left: 40vw;
        font-size: 13pt;
        font-family: 'Inconsolata', sans-serif;
        text-transform: capitalize;
      }
    </style>`;
    $('head').append(titleCSS);
    $('.titlebar').append(tElem);
    uwu.getChannel();
    uwu.log('Started');
  }
  uwu.getReactInstance = (node) => node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
  uwu.getChannel = () => {
    const titularText = $('.title .channel-name').text();
    switch(uwu.getReactInstance($('.chat')[0]).return.stateNode.state.channel.type) {
      /**
       * @param {type}
       * @type {number}
       * Types:
       * 0 - Guild Channel
       * 1 - DM
       * 2 - Voice Channel
       * 3 - Group DM
       * 4 - Categories
       */
      case 0:
        $('#TitleforTitlebar').text('Guild Channel — ' + titularText);
      break;
      case 1:
        $('#TitleforTitlebar').text('DM — ' + titularText);
      break;
      case 3:
        $('#TitleforTitlebar').text('Group DM — ' + titularText);
      break;
    }
  }
  uwu.onSwitch = () => uwu.getChannel();
  uwu.stop = () => {
    $('#TitleforTitlebar').remove();
    uwu.log('Stopped');
  }
  uwu.log = (x) => console.log(`[%c${uwu.sName()}%c] ${x}`, 'color: #59F; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black', '');
  uwu.load = () => uwu.log('Loaded');
  uwu.sName = () => 'TFTb';
  uwu.getName = () => 'TitleForTitlebar';
  uwu.getAuthor = () => 'Arashiryuu';
  uwu.getVersion = () => '1.1';
  uwu.getDescription = () => 'This plugin was intended to be used with Beard\'s Titlebar mini-theme or any theme that implements it.\n\nAdds a corresponding title for the channel / dm you\'re viewing to the titlebar.\n\nEdit it in your CSS with the #TitleforTitlebar element ID.';
}
