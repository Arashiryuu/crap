//META{"name":"charCounterV2"}*//

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
    		} else if($(".channel-text-area-default div textarea").val().length <= 1999) {
				return $("#charcounter").css("color", "red");
    		} else if($(".channel-text-area-default div textarea").val().length > 2000) {
				return alert("Cannot send messages over 2000 characters.");
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
