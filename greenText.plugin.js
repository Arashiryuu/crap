//META{"name":"greenText"}*//

var greenText = function(){};
var greenTextInterval;

var greenTextMainFunction = function(){
	$(".message-text>.markup, .message-text>.markup>.message-content").each(function() {
		if(!$(this).find('.greenText').length) {
			var strBase = $(this).text();
			if(strBase.substr(0,1) == ">") {
				$(this).addClass("greenText");
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

greenText.prototype.unload = function() {};

greenText.prototype.onSwitch = function() {};
greenText.prototype.onMessage = function(){};
greenText.prototype.observer = function() {}
greenText.prototype.getSettingsPanel = function(){ return "There are no settings here."; };
