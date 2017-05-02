//META{"name":"killxd"}*//

class killxd {
 constructor() {
  this.processChat = () => {
	setTimeout(function() {
		$(".comment .markup, .comment .markup>span").each(function() {
			var tagRegex = /(XD)/igm;
			var html = $(this).html();
			$(this).html(html.replace(tagRegex, 'I\'m a retard lol.'));
		});
	 },100);
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
  getVersion		    () { return '0.0.2'; }
  getSettingsPanel		() { return 'Go away!'; }
};
/*@end@*/
