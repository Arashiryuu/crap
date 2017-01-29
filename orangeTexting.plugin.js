//META{"name":"orangeTexting"}*//

var orangeTexting = function(){};
var orangeTextingInterval;

var orangeTextingMainFunction = function(){
	$(".message-text>.markup").each(function() {
		if(!$(this).find('.orangeTexting').length) {
			var strBase = $(this).text();
			if(strBase.substr(-1) == "<") {
				$(this).addClass("orangeTexting");
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

orangeTexting.prototype.unload = function() {};

orangeTexting.prototype.onSwitch = function() {};
orangeTexting.prototype.onMessage = function(){};
orangeTexting.prototype.observer = function() {}
orangeTexting.prototype.getSettingsPanel = function(){ return "Go away!"; };
