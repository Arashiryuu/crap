//META{"name":"hashTagging"}*//

class hashTagging {
 constructor() {
  this.processChat = () => {
	setTimeout(function() {
		$(".comment .body .markup:not(.line-scanned), .comment .markup>span:not(.line-scanned)").each(function() {
			var tagRegex = /#[A-Z0-9a-z_-]+/igm;
			var html = $(this).html();
			$(this).html(html.replace(tagRegex, `<span style='color: #3898FF; font-weight: bold;'>$&</span>`));
		}).addClass("line-scanned");
	},250);
   }
 };

  start() { this.processChat(); }
	 
  stop() {}
	 
  load() {}
	
  unload() {}
	 
  onMessage() { this.processChat(); }
	 
  onSwitch() { this.processChat(); }

  getName() { return 'hashTagging'; }
  getDescription() { return 'Start a word or sentence with a \"#\" to hashtag.'; }
  getAuthor() { return 'Arashiryuu'; }
  getVersion() { return '1.1.0'; }
  getSettingsPanel() { return 'Go away!'; }
};
/*@end @*/
