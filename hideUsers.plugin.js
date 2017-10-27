//META{"name":"hideUsers"}*//

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

class hideUsers {
	constructor() {
		this.hidUsers = {
			users: []
		};

		this.blockCSS = `
			<style id="hideUsersCSS">
				.message-group-blocked { display: none; }
			</style>
		`;

		this.contextItem = `<div class="item-group hideUsers">
			<div class="item hideUser-item">
				<span>Hide User</span>
				<div class="hint"></div>
			</div>
		</div>`;

		this.contextmo = new MutationObserver((changes, p) => {
      		changes.forEach((change, i) => {
        		if(change.addedNodes) {
          			change.addedNodes.forEach((node) => {
            			if(node.nodeType === 1 && node.classList && node.classList.contains('context-menu')) {
              				this.appendContext(node);
            			}
          			});
        		}
      		});
		});
		
		this.memberListMO = new MutationObserver((changes, p) => {
			for(const change of changes) {
				if(change.addedNodes) {
					for(const node of change.addedNodes.values()) {
						if(this.getReactInstance(node).return.return.memoizedProps.user && this.hidUsers.users.includes(this.getReactInstance(node).return.return.memoizedProps.user.id)) {
							this.hideUser();
						}
					}
				}
			}
		});
	};

	hideUser() {
		if(!this.hidUsers.users[0]) {
			$('.message-group').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});
			$('.member').each(function() {
				if($(this).css('display') === 'none') $(this).show();
			});	
			return this.log('No users found');
		}
		for(const user of this.hidUsers.users) {
			$(`[style*='${user}']`).parent().hide();
			$(`.avatarContainer-303pFz [style*='${user}']`).parent().parent().parent().hide();
		}
	};

	appendContext(context) {
    	if(!context) return;
		if((this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('avatar-large'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('user-name'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('member-username'))
		|| (this.getReactInstance(context).return.memoizedProps.target && this.getReactInstance(context).return.memoizedProps.target.classList.contains('avatar-small'))) {
      		$(context).find('.item:contains("Profile")').after(this.contextItem);
      		$(context).find('.item.hideUser-item')
        		.off('click.hideUsers')
        		.on('click.hideUsers', this.contextHide.bind(this));
    	}
	};
	
	contextHide() {
    	if(!$('.context-menu').length) return;
    	if(!this.getReactInstance($('.context-menu')[0]).return.stateNode.props.user) return;
    	if(!this.hidUsers.users.includes(this.getReactInstance($('.context-menu')[0]).return.stateNode.props.user.id)) {
      		this.hidUsers.users.push(this.getReactInstance($('.context-menu')[0]).return.stateNode.props.user.id);
      		this.saveSettings();
      		this.hideUser();
		}
	};

	userPush() {
		const nUser = $('#blockField').val();
		if(isNaN(nUser)) return $('#blockField').val('Invalid entry. (NaN)');
		if(nUser.length === 0 || nUser === undefined) return $('#blockField').val('Invalid entry. (No-entry)');
		if(!nUser.match(/^\d{17,18}$/)) return $('#blockField').val('Invalid entry. (ID-length)');
		this.hidUsers.users.push(nUser);
		this.log(this.hidUsers.users.join(', '));
		this.hideUser();
	};
	
	userClear() {
		const oUser = $('#blockField').val();
		if(this.hidUsers.users.length !== 0) {
	 		if(oUser.match(/^\d{17,18}$/)) {
				this.hidUsers.users.splice(this.hidUsers.users.indexOf(oUser), 1);
				alert('Successfully removed!');
				this.log(this.hidUsers.users.join(', '));
				this.hideUser();
			}
			else {
				this.hidUsers.users.pop();
				alert('Successfully removed!');
				this.log(this.hidUsers.users.join(', '));
				this.hideUser();
			}
	 	}
	 	else {
			this.log('No users available');
	 	}
	};

	saveSettings() {
		bdPluginStorage.set('hideUsers', 'users', JSON.stringify(this.hidUsers.users));
		this.log('Saved settings\n' + this.hidUsers.users.join(', '));
	};

	loadSettings() {
		const settings = bdPluginStorage.get('hideUsers', 'users');
		if(settings) {
			this.hidUsers.users = JSON.parse(settings);
			this.log('Loaded settings\n' + this.hidUsers.users.join(', '));
		}
		else {
			this.log('No settings found');
		}
	};

	/**
	 * @name getInternalInstance
	 * @description returns the react internal instance of the element
	 * @param {Node} node - the element we want the internal data from
	 * @author noodlebox
	 * @returns {Node}
	 */
	getReactInstance(node) {
		return node[Object.keys(node).find((key) => key.startsWith('__reactInternalInstance'))];
	};

	start() { 
		this.log('Started');
		const settings = bdPluginStorage.get('hideUsers', 'users');
		if(!settings) {
			this.log('No settings found');
		}
		else {
			this.hidUsers.users = JSON.parse(settings);
			this.log('Loaded settings\n' + this.hidUsers.users.join(', '));
		}
		 this.hideUser();
		 this.membersObserve();
		 this.contextmo.observe($('.app')[0], {childList: true, subtree: true});
	 	$('head').append(this.blockCSS);
	};

	membersObserve() {
		const memberList = $('.channel-members-wrap');
		if(!memberList || !memberList.length) return;
		this.memberListMO.observe(memberList[0], {childList: true, subtree: true});
	};
	
	membersUnobserve() {
		this.memberListMO.disconnect();	
	};

	stop() {
		this.contextmo.disconnect();
		this.membersUnobserve();
		$('#hideUsersCSS').remove();
		$('.message-group').each(function() {
			if($(this).css('display') === 'none') $(this).show();
		});
		$('.member').each(function() {
			if($(this).css('display') === 'none') $(this).show();
		});
		$('*').off('click.hideUsers');
		this.log('Stopped');
	};

	load() { 
		this.log('Loaded');
	};

	log(text) {
		return console.log(`[%c${this.getName()}%c] ${text}`, 'color: #9653AD', '');
	};

	observer(ex) {
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('messages-wrapper')) {
			this.hideUser();
			this.membersUnobserve();
			this.membersObserve();
		}
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('message-group')) {
			this.hideUser();
		}
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('markup')) {
			this.hideUser();
		}
		if(ex.addedNodes.length && ex.addedNodes[0].classList && ex.addedNodes[0].classList.contains('channel-members-wrap')) {
			this.hideUser();
			this.membersObserve();
		}
		if(ex.removedNodes.length && ex.removedNodes[0].classList && ex.removedNodes[0].classList.contains('channel-members-wrap')
			|| ex.removedNodes.length && ex.removedNodes[0].classList && ex.removedNodes[0].classList.contains('messages-wrapper')) {
			this.membersUnobserve();
		}
	};

	getName() {
		return 'hideUsers';
	};

	getAuthor() {
		return 'Arashiryuu';
	};

	getVersion() {
		return '1.5';
	};

	getDescription() {
		return 'Hides any users listed in the array of IDs.';
	};

	getSettingsPanel() {
		return `<div id="huplugin-settings-div">
		<h3>hideUsers Plugin</h3><br/><br/>

		<input id="blockField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>
		<br/><button class="hU-btn0" onclick=BdApi.getPlugin("${this.getName()}").userPush()>apply</button>
		<button class="hU-btn1" onclick=BdApi.getPlugin("${this.getName()}").userClear()>remove</button>
		<button class="hU-btn2" onclick=BdApi.getPlugin("${this.getName()}").saveSettings()>save</button>
		<button class="hU-btn3" onclick=BdApi.getPlugin("${this.getName()}").loadSettings()>load</button><br/>
		
		<br/>How to use:<br/>
		0) User Settings \u21D2 Appearence \u21D2 Developer Mode, then right-click a user and "Copy ID".<br/>
		1) Insert a user's ID.<br/>
		2) Click "apply."<br/>
		3) To remove the last-added user, click the "remove" button.<br/>
		</div>`;
	};
};

/*@end*/
