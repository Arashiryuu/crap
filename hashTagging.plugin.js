//META{"name":"hashTagging"}*//

class hashTagging {
 constructor() {
  this.processChat = () => {
	setTimeout(function() {
		$(".comment .body .markup:not(.line-scanned), .comment .markup>span:not(.line-scanned)").each(function() {
			var tagRegex = /\B#[A-Z0-9a-z_-]+/igm;
			var html = $(this).html();
			$(this).html(html.replace(tagRegex, `<span id="hashtag" style='color: #3898FF; font-weight: bold;'>$&</span>`));
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
