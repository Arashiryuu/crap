//META{"name":"killxd"}*//

class killxd {
 constructor() {
  this.processChat = () => {
	setTimeout(function() {
		$(".chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(pre), .chat .content .messages-wrapper .messages .message-group .comment .message .message-text .markup:not(code)").each(function() {
			var tagRegex = /(?:\bXD\b)/igm;
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
	
	observer(exd) {
    if(exd.addedNodes.length && exd.addedNodes[0].classList && exd.addedNodes[0].classList.contains('message-group')) {
      this.processChat();
    }
    if(exd.addedNodes.length && exd.addedNodes[0].classList && exd.addedNodes[0].classList.contains('markup')) {
      this.processChat();
    } else
        return;
  }
	 
  onMessage() { this.processChat(); }
	 
  onSwitch() { setTimeout(() => this.processChat(), 250); }

  getName		        () { return 'killxd'; }
  getDescription    	() { return 'replaces shitty xds.'; }
  getAuthor		      	() { return 'Arashiryuu'; }
  getVersion		    () { return '1.1.0'; }
  getSettingsPanel		() { return 'Go away!'; }
};
/*@end@*/
