//META{"name":"killxd"}*//

class killxd {
 constructor() {
  this.processChat = () => {
	setTimeout(function() {
		$(".chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(pre), .chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(code)").each(function() {
			var tagRegex = /(?:\bXD\b[^,"'`])/igm;
			var html = $(this).html();
			$(this).html(html.replace(tagRegex, 'I\'m a retard lol.'));
		});
	 }, 100);
   }
 };

  start() { this.processChat(); }
	 
  stop() {}
	 
  load() {}
	
  unload() {}
	 
  onMessage() { this.processChat(); }
	 
  onSwitch() { this.processChat(); }

  getName		        () { return 'killxd'; }
  getDescription    	() { return 'replaces shitty xds.'; }
  getAuthor		      	() { return 'Arashiryuu'; }
  getVersion		    () { return '0.0.6'; }
  getSettingsPanel		() { return 'Go away!'; }
};
/*@end@*/
