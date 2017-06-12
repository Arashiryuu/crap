//META{"name":"hideChannels"}*//

class hideChannels {
	constructor() {
		this.hideChannel = () => {
			if(!this.hidChannels.chans[0]) return console.warn('%c[hideChannels]%c\tNo channels found.', 'color: #F2F', '');
			for(let chan of this.hidChannels.chans) {
  			$(`.containerDefault-7RImuF:contains(${chan})`).hide();
 			}
		};

		this.hidChannels = {
			chans: []
		};
	};

	chanPush() {
		let newUser = $('#ChanblockField').val();
		if(typeof newUser !== 'string') return $('#ChanblockField').val('Invalid entry.');
		if(newUser.length === 0 || newUser === undefined) return $('#ChanblockField').val('Invalid entry.');
		this.hidChannels.chans.push(newUser);
		console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
		this.start();
	};
	
	chanClear() {
		this.hidChannels.chans.pop();
		console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
		alert('Successfully removed!');
		this.start();		
	};

	saveSettings(save) {
		bdPluginStorage.set('hideChannels', 'chans', JSON.stringify(this.hidChannels.chans));
		save = true;
		console.info('%c[hideChannels]%c\tSaved settings.', 'color: #F2F', '');
		console.info('%c[hideChannels]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};

	loadSettings() {
		this.hidChannels.chans = JSON.parse(bdPluginStorage.get('hideChannels', 'chans'));
		console.info('%c[hideChannels]%c\tLoaded settings.', 'color: #F2F', '');
		console.info('%c[hideChannels]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};

	start() { console.info('%c[hideChannels]%c\tWorking...', 'color: #F2F', ''); this.hideChannel();  };
	stop() { console.info('%c[hideChannels]%c\tStopped.', 'color: #F2F', ''); };
	load() { console.info('%c[hideChannels]%c\tBooting-Up.', 'color: #F2F', ''); };
	unload() {};
	onMessage() {};
	onSwitch() { this.hideChannel(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideChannels'; };
	getVersion() { return '1.0.0'; };
	getDescription() { return 'Hides any channels listed in the array of names.'; };
	getSettingsPanel() { 
		let htmls = '<h3>hideChannels Plugin</h3><br/>'; 
		htmls += '<input id="ChanblockField" type="text" placeholder="name -- case-sensitive" style="resize: none; width: 80%;" /><br/><br/>';
		htmls += '<br/><button class="ChU-btn0" onclick=BdApi.getPlugin("'+ this.getName() +'").chanPush()>apply</button>';
		htmls += '<button class="ChU-btn1" onclick=BdApi.getPlugin("'+ this.getName() +'").chanClear()>remove</button>';
		htmls += '<button class="ChU-btn2" onclick=BdApi.getPlugin("'+ this.getName() +'").saveSettings()>save</button>';
		htmls += '<button class="ChU-btn3" onclick=BdApi.getPlugin("'+ this.getName() +'").loadSettings()>load</button><br/>';
		htmls += '<br/>How to use:';
		htmls += '<br/>1) Insert a channel\'s name.<br/>';
		htmls += '2) Click "apply."<br/>';
		htmls += '3) To remove the last-added channel, click the "remove" button.<br/>';
		return htmls;
	};
};
/*@end*/
