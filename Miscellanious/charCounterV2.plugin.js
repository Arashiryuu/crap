//META{"name":"charCounterV2"}*//

class charCounterV2 {
	constructor() {

	};

	load() {
		
	};

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
    const ta = $(".channelTextArea-1HTP3C");
    if(!ta || !ta.length) return;
    if($("#charcounter").length) return;
    ta.append($("<span/>", { 'id': 'charcounter', 'text': `${$(".content .channelTextArea-1HTP3C textarea").val().length}/2000` }));
    $(".content .channelTextArea-1HTP3C textarea").off("keyup.charcounter").on("keyup.charCounter", (e) => {
    	$("#charcounter").text(`${e.target.value.length}/2000`);
    	if($(".content .channelTextArea-1HTP3C textarea").val().length <= 500) {
    		return $("#charcounter").css("color", "limegreen");
    	} else if($(".content .channelTextArea-1HTP3C textarea").val().length <= 1000) {
    		return $("#charcounter").css("color", "yellow");
    	} else if($(".content .channelTextArea-1HTP3C textarea").val().length <= 1500) {
    		return $("#charcounter").css("color", "orange");
    	} else if($(".content .channelTextArea-1HTP3C textarea").val().length <= 1999) {
				return $("#charcounter").css("color", "red");
    	}
    });
	};

	stop() {
    BdApi.clearCSS("charCounter");
    $(".content .channelTextArea-1HTP3C textarea").off("keyup.charcounter");
	};

	observer({addedNodes, removedNodes}) {
		if(addedNodes && addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {
			this.inject();
		}
	};

	getSettingsPanel() { 
		return ""; 
	};

	getName() {
    return "Character Counter";
	};

	getDescription() {
    return "Adds a character counter to channel textarea.";
	};

	getVersion() {
    return "0.2.0";
	};

	getAuthor() {
    return "Jiiks";
	};
};
