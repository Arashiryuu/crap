//META{"name":"hideChannelsPerServer"}*//

class hideChannelsPerServer {
	constructor() {
		this.hideChannel = () => {
			if(!this.hidChannels.chans[0]) {
				$('.channels-wrap [class*="containerDefault-"]').each(function() {
					if($(this).css('display') === 'none') $(this).show();
				});
				return console.warn('%c[hideChannelsPerServer]%c\tNo channels found.', 'color: #F2F', '');
			}
			const { getOwnerInstance } = window.DiscordInternals;
			$('.channels-wrap [class*="containerDefault-"]').each(function() {
  			bdplugins.hideChannelsPerServer.plugin.hidChannels.chans.some(i => i === getOwnerInstance($(this)[0], {}).props.channel.id) ? $(this).hide() : $(this).show();
			});
		};

		this.hidChannels = {
			chans: []
		};
	};

	chanPush() {
		let nChan = $('#ChanblockField').val();
		if(isNaN(nChan)) return $('#ChanblockField').val('Invalid entry. (ID-only)');
		if(!nChan) return $('#ChanblockField').val('Invalid entry. (No-entry)');
		if(!nChan.match(/^\d{16,18}$/)) return $('#ChanblockField').val('Invalid entry. (Invalid-length-or-characters)');
		this.hidChannels.chans.push(nChan);
		console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
		this.hideChannel();
	};
	
	chanClear() {
	  let oChan = $('#ChanblockField').val();
		if(oChan.match(/^\d{16,18}$/)) {
			this.hidChannels.chans.splice(this.hidChannels.chans.indexOf(oChan), 1);
			console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
			alert('Successfully removed!');
			this.hideChannel();
		}
		this.hidChannels.chans.pop();
		console.info(`%c[${this.getName()}]%c\t${this.hidChannels.chans.join(', ')}`, 'color: #F2F', '');
		alert('Successfully removed!');
		this.hideChannel();	
	};

	saveSettings() {
		bdPluginStorage.set('hideChannelsPerServer', 'channelsss', JSON.stringify(this.hidChannels.chans));
		console.info('%c[hideChannelsPerServer]%c\tSaved settings.', 'color: #F2F', '');
		console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};

	loadSettings() {
		this.hidChannels.chans = JSON.parse(bdPluginStorage.get('hideChannelsPerServer', 'channelsss'));
		console.info('%c[hideChannelsPerServer]%c\tLoaded settings.', 'color: #F2F', '');
		console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
	};

	start() {
		console.info('%c[hideChannelsPerServer]%c\tWorking...', 'color: #F2F', '');
		var settings = bdPluginStorage.get('hideChannelsPerServer', 'channelsss');
		if(settings === null) {
			console.info('%c[hideChannelsPerServer]%c\tNo settings found.', 'color: #F2F', '');
		}
		else {
			this.hidChannels.chans = JSON.parse(settings);
			console.info('%c[hideChannelsPerServer]%c\t' + this.hidChannels.chans.join(', '), 'color: #F2F', '');
		}
		this.hideChannel();
	};
	stop() { console.info('%c[hideChannelsPerServer]%c\tStopped.', 'color: #F2F', ''); };
	load() { console.info('%c[hideChannelsPerServer]%c\tBooting-Up.', 'color: #F2F', ''); };
	onSwitch() { this.hideChannel(); };

	getAuthor() { return 'Arashiryuu'; };
	getName() { return 'hideChannelsPerServer'; };
	getVersion() { return '1'; };
	getDescription() { return 'Hides any channels listed in the array of IDs.'; };
	getSettingsPanel() { 
		let htmls = '<h3>hideChannelsPerServer Plugin</h3><br/>'; 
		htmls += '<input id="ChanblockField" type="text" placeholder="ID" style="resize: none; width: 80%;" /><br/><br/>';
		htmls += '<br/><button class="ChU-btn0" onclick=BdApi.getPlugin("'+ this.getName() +'").chanPush()>apply</button>';
		htmls += '<button class="ChU-btn1" onclick=BdApi.getPlugin("'+ this.getName() +'").chanClear()>remove</button>';
		htmls += '<button class="ChU-btn2" onclick=BdApi.getPlugin("'+ this.getName() +'").saveSettings()>save</button>';
		htmls += '<button class="ChU-btn3" onclick=BdApi.getPlugin("'+ this.getName() +'").loadSettings()>load</button><br/>';
		htmls += '<br/>How to use:';
		htmls += '<br/>1) Insert a channel\'s ID.<br/>';
		htmls += '2) Click "apply."<br/>';
		htmls += '3) To remove the last-added channel, click the "remove" button.<br/>';
		return htmls;
	};
};
/*@end*/
