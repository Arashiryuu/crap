//META{"name":"JSMaterialThemeCodeblocks"}*//

class JSMaterialThemeCodeblocks {
	constructor() {
		this.css = `
			<style class='JSMaterialThemeCodeblocks'>

			/*.hljs.js .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.js {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.js .hljs-addition, #app-mount code.hljs.js .hljs-keyword, #app-mount code.hljs.js .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.js .hljs-built_in, #app-mount .hljs.js .hljs-deletion, #app-mount .hljs.js .hljs-attribute, #app-mount .hljs.js .hljs-class .hljs-title, #app-mount .hljs.js .hljs-template-variable, #app-mount .hljs.js .hljs-type, #app-mount .hljs.js .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.js .hljs-bullet, #app-mount .hljs.js .hljs-link, #app-mount .hljs.js .hljs-meta, #app-mount .hljs.js .hljs-meta .hljs-keyword, #app-mount .hljs.js .hljs-selector-attr, #app-mount .hljs.js .hljs-selector-pseudo, #app-mount .hljs.js .hljs-subst, #app-mount .hljs.js .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.js .hljs-doctag,
			#app-mount .hljs.js .hljs-meta .hljs-meta-string,
			#app-mount .hljs.js .hljs-regexp, #app-mount .hljs.js .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.js .hljs-number,
			#app-mount .hljs.js .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.js .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.js .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.js .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.js .hljs-built_in.isN,
			#app-mount .hljs.js .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.js .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.js .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.js .hljs-name, .theme-dark .hljs.js .hljs-section, .theme-dark .hljs.js .hljs-selector-class, .theme-dark .hljs.js .hljs-selector-id, .theme-dark .hljs.js .hljs-title {
				color: #82aaff;
			}
			
			/*.hljs.javascript .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.javascript {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.javascript .hljs-addition, #app-mount code.hljs.javascript .hljs-keyword, #app-mount code.hljs.javascript .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.javascript .hljs-built_in, #app-mount .hljs.javascript .hljs-deletion, #app-mount .hljs.javascript .hljs-attribute, #app-mount .hljs.javascript .hljs-class .hljs-title, #app-mount .hljs.javascript .hljs-template-variable, #app-mount .hljs.javascript .hljs-type, #app-mount .hljs.javascript .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.javascript .hljs-bullet, #app-mount .hljs.javascript .hljs-link, #app-mount .hljs.javascript .hljs-meta, #app-mount .hljs.javascript .hljs-meta .hljs-keyword, #app-mount .hljs.javascript .hljs-selector-attr, #app-mount .hljs.javascript .hljs-selector-pseudo, #app-mount .hljs.javascript .hljs-subst, #app-mount .hljs.javascript .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.javascript .hljs-doctag,
			#app-mount .hljs.javascript .hljs-meta .hljs-meta-string,
			#app-mount .hljs.javascript .hljs-regexp, #app-mount .hljs.javascript .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.javascript .hljs-number,
			#app-mount .hljs.javascript .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.javascript .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.javascript .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.javascript .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.javascript .hljs-built_in.isN,
			#app-mount .hljs.javascript .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.javascript .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.javascript .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.javascript .hljs-name, .theme-dark .hljs.javascript .hljs-section, .theme-dark .hljs.javascript .hljs-selector-class, .theme-dark .hljs.javascript .hljs-selector-id, .theme-dark .hljs.javascript .hljs-title {
				color: #82aaff;
			}

			/*.hljs.Javascript .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.Javascript {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.Javascript .hljs-addition, #app-mount code.hljs.Javascript .hljs-keyword, #app-mount code.hljs.Javascript .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.Javascript .hljs-built_in, #app-mount .hljs.Javascript .hljs-deletion, #app-mount .hljs.Javascript .hljs-attribute, #app-mount .hljs.Javascript .hljs-class .hljs-title, #app-mount .hljs.Javascript .hljs-template-variable, #app-mount .hljs.Javascript .hljs-type, #app-mount .hljs.Javascript .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.Javascript .hljs-bullet, #app-mount .hljs.Javascript .hljs-link, #app-mount .hljs.Javascript .hljs-meta, #app-mount .hljs.Javascript .hljs-meta .hljs-keyword, #app-mount .hljs.Javascript .hljs-selector-attr, #app-mount .hljs.Javascript .hljs-selector-pseudo, #app-mount .hljs.Javascript .hljs-subst, #app-mount .hljs.Javascript .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.Javascript .hljs-doctag,
			#app-mount .hljs.Javascript .hljs-meta .hljs-meta-string,
			#app-mount .hljs.Javascript .hljs-regexp, #app-mount .hljs.Javascript .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.Javascript .hljs-number,
			#app-mount .hljs.Javascript .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.Javascript .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.Javascript .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.Javascript .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.Javascript .hljs-built_in.isN, #app-mount .hljs.Javascript .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.Javascript .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.Javascript .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.Javascript .hljs-name, .theme-dark .hljs.Javascript .hljs-section, .theme-dark .hljs.Javascript .hljs-selector-class, .theme-dark .hljs.Javascript .hljs-selector-id, .theme-dark .hljs.Javascript .hljs-title {
				color: #82aaff;
			}

			/*.hljs.Js .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.Js {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.Js .hljs-addition, #app-mount code.hljs.Js .hljs-keyword, #app-mount code.hljs.Js .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.Js .hljs-built_in, #app-mount .hljs.Js .hljs-deletion, #app-mount .hljs.Js .hljs-attribute, #app-mount .hljs.Js .hljs-class .hljs-title, #app-mount .hljs.Js .hljs-template-variable, #app-mount .hljs.Js .hljs-type, #app-mount .hljs.Js .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.Js .hljs-bullet, #app-mount .hljs.Js .hljs-link, #app-mount .hljs.Js .hljs-meta, #app-mount .hljs.Js .hljs-meta .hljs-keyword, #app-mount .hljs.Js .hljs-selector-attr, #app-mount .hljs.Js .hljs-selector-pseudo, #app-mount .hljs.Js .hljs-subst, #app-mount .hljs.Js .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.Js .hljs-doctag,
			#app-mount .hljs.Js .hljs-meta .hljs-meta-string,
			#app-mount .hljs.Js .hljs-regexp, #app-mount .hljs.Js .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.Js .hljs-number,
			#app-mount .hljs.Js .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.Js .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.Js .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.Js .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.Js .hljs-built_in.isN, #app-mount .hljs.Js .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.Js .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.Js .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.Js .hljs-name, .theme-dark .hljs.Js .hljs-section, .theme-dark .hljs.Js .hljs-selector-class, .theme-dark .hljs.Js .hljs-selector-id, .theme-dark .hljs.Js .hljs-title {
				color: #82aaff;
			}

			/*.hljs.JS .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.JS {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.JS .hljs-addition, #app-mount code.hljs.JS .hljs-keyword, #app-mount code.hljs.JS .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.JS .hljs-built_in, #app-mount .hljs.JS .hljs-deletion, #app-mount .hljs.JS .hljs-attribute, #app-mount .hljs.JS .hljs-class .hljs-title, #app-mount .hljs.JS .hljs-template-variable, #app-mount .hljs.JS .hljs-type, #app-mount .hljs.JS .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.JS .hljs-bullet, #app-mount .hljs.JS .hljs-link, #app-mount .hljs.JS .hljs-meta, #app-mount .hljs.JS .hljs-meta .hljs-keyword, #app-mount .hljs.JS .hljs-selector-attr, #app-mount .hljs.JS .hljs-selector-pseudo, #app-mount .hljs.JS .hljs-subst, #app-mount .hljs.JS .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.JS .hljs-doctag,
			#app-mount .hljs.JS .hljs-meta .hljs-meta-string,
			#app-mount .hljs.JS .hljs-regexp, #app-mount .hljs.JS .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.JS .hljs-number,
			#app-mount .hljs.JS .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.JS .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.JS .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.JS .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.JS .hljs-built_in.isN, #app-mount .hljs.JS .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.JS .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.JS .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.JS .hljs-name, .theme-dark .hljs.JS .hljs-section, .theme-dark .hljs.JS .hljs-selector-class, .theme-dark .hljs.JS .hljs-selector-id, .theme-dark .hljs.JS .hljs-title {
				color: #82aaff;
			}

			/*.hljs.JAVASCRIPT .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.JAVASCRIPT {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.JAVASCRIPT .hljs-addition, #app-mount code.hljs.JAVASCRIPT .hljs-keyword, #app-mount code.hljs.JAVASCRIPT .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-built_in, #app-mount .hljs.JAVASCRIPT .hljs-deletion, #app-mount .hljs.JAVASCRIPT .hljs-attribute, #app-mount .hljs.JAVASCRIPT .hljs-class .hljs-title, #app-mount .hljs.JAVASCRIPT .hljs-template-variable, #app-mount .hljs.JAVASCRIPT .hljs-type, #app-mount .hljs.JAVASCRIPT .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-bullet, #app-mount .hljs.JAVASCRIPT .hljs-link, #app-mount .hljs.JAVASCRIPT .hljs-meta, #app-mount .hljs.JAVASCRIPT .hljs-meta .hljs-keyword, #app-mount .hljs.JAVASCRIPT .hljs-selector-attr, #app-mount .hljs.JAVASCRIPT .hljs-selector-pseudo, #app-mount .hljs.JAVASCRIPT .hljs-subst, #app-mount .hljs.JAVASCRIPT .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-doctag,
			#app-mount .hljs.JAVASCRIPT .hljs-meta .hljs-meta-string,
			#app-mount .hljs.JAVASCRIPT .hljs-regexp, #app-mount .hljs.JAVASCRIPT .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-number,
			#app-mount .hljs.JAVASCRIPT .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-built_in.isN, #app-mount .hljs.JAVASCRIPT .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.JAVASCRIPT .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.JAVASCRIPT .hljs-name, .theme-dark .hljs.JAVASCRIPT .hljs-section, .theme-dark .hljs.JAVASCRIPT .hljs-selector-class, .theme-dark .hljs.JAVASCRIPT .hljs-selector-id, .theme-dark .hljs.JAVASCRIPT .hljs-title {
				color: #82aaff;
			}

			/*.hljs.JavaScript .kawaii-linenumbers {
    		border-left: 2.6ch solid rgba(0, 0, 0, .2);
			}*/

			#app-mount .chat > .content .messages .message-group .markup pre code.hljs.JavaScript {
    		background: #1b2327 !important;
    		color: #eee !important;
			}

			#app-mount code.hljs.JavaScript .hljs-addition, #app-mount code.hljs.JavaScript .hljs-keyword, #app-mount code.hljs.JavaScript .hljs-selector-tag {
    		color: #c792ea;
			}

			#app-mount .hljs.JavaScript .hljs-built_in, #app-mount .hljs.JavaScript .hljs-deletion, #app-mount .hljs.JavaScript .hljs-attribute, #app-mount .hljs.JavaScript .hljs-class .hljs-title, #app-mount .hljs.JavaScript .hljs-template-variable, #app-mount .hljs.JavaScript .hljs-type, #app-mount .hljs.JavaScript .hljs-variable {
    		color: #ffcb6b;
			}

			#app-mount .hljs.JavaScript .hljs-bullet, #app-mount .hljs.JavaScript .hljs-link, #app-mount .hljs.JavaScript .hljs-meta, #app-mount .hljs.JavaScript .hljs-meta .hljs-keyword, #app-mount .hljs.JavaScript .hljs-selector-attr, #app-mount .hljs.JavaScript .hljs-selector-pseudo, #app-mount .hljs.JavaScript .hljs-subst, #app-mount .hljs.JavaScript .hljs-symbol {
    		color: #89ddf3;
			}

			#app-mount .hljs.JavaScript .hljs-doctag,
			#app-mount .hljs.JavaScript .hljs-meta .hljs-meta-string,
			#app-mount .hljs.JavaScript .hljs-regexp, #app-mount .hljs.JavaScript .hljs-string {
    		color: #c3e88d;
			}

			#app-mount .hljs.JavaScript .hljs-number,
			#app-mount .hljs.JavaScript .hljs-literal {
    		color: #f78c6a;
			}

			#app-mount .hljs.JavaScript .hljs-params {
				color: #eee;
			}

			#app-mount .hljs.JavaScript .hljs-function {
				color: #c792ea;
			}

			#app-mount .hljs.JavaScript .hljs-keyword.this {
				color: #f95479;
				font-style: italic;
			}

			#app-mount .hljs.JavaScript .hljs-built_in.isN, #app-mount .hljs.JavaScript .hljs-attr {
				color: #82aaff;
			}

			#app-mount .hljs.JavaScript .hljs-built_in.rqr {
				color: #82aaff;
			}

			#app-mount .hljs.JavaScript .hljs-keyword.new {
				color: #89ddf3;
			}

			.theme-dark .hljs.JavaScript .hljs-name, .theme-dark .hljs.JavaScript .hljs-section, .theme-dark .hljs.JavaScript .hljs-selector-class, .theme-dark .hljs.JavaScript .hljs-selector-id, .theme-dark .hljs.JavaScript .hljs-title {
				color: #82aaff;
			}
		</style>`;
	};

	createThisClass() {
		let slef = $('.hljs.js .hljs-keyword:contains(this)');
		let isNuN = $('.hljs.js .hljs-built_in:contains(isNaN)');
		let ewn = $('.hljs.js .hljs-keyword:contains(new)');
		let rqr = $('.hljs.js .hljs-built_in:contains(require)');
		if(slef || $('.hljs.JS .hljs-keyword:contains(this)') || $('.hljs.Js .hljs-keyword:contains(this)') || $('.hljs.javascript .hljs-keyword:contains(this)') || $('.hljs.Javascript .hljs-keyword:contains(this)') || $('.hljs.JAVASCRIPT .hljs-keyword:contains(this)') || $('.hljs.JavaScript .hljs-keyword:contains(this)')) {
			slef.addClass('this');
			$('.hljs.JS .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.Js .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.javascript .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.Javascript .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.JAVASCRIPT .hljs-keyword:contains(this)').addClass('this');
			$('.hljs.JavaScript .hljs-keyword:contains(this)').addClass('this');
		}
		if(isNuN || $('.hljs.JS .hljs-built_in:contains(isNaN)') || $('.hljs.Js .hljs-built_in:contains(isNaN)') || $('.hljs.javascript .hljs-built_in:contains(isNaN)') || $('.hljs.Javascript .hljs-built_in:contains(isNaN)') || $('.hljs.JAVASCRIPT .hljs-built_in:contains(isNaN)') || $('.hljs.JavaScript .hljs-built_in:contains(isNaN)')) {
			isNuN.addClass('isN');
			$('.hljs.JS .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.Js .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.javascript .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.Javascript .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.JAVASCRIPT .hljs-built_in:contains(isNaN)').addClass('isN');
			$('.hljs.JavaScript .hljs-built_in:contains(isNaN)').addClass('isN');
		}
		if(ewn || $('.hljs.JS .hljs-keyword:contains(new)') || $('.hljs.Js .hljs-keyword:contains(new)') || $('.hljs.javascript .hljs-keyword:contains(new)') || $('.hljs.Javascript .hljs-keyword:contains(new)') || $('.hljs.JAVASCRIPT .hljs-keyword:contains(new)') || $('.hljs.JavaScript .hljs-keyword:contains(new)')) {
			ewn.addClass('new');
			$('.hljs.JS .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.Js .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.javascript .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.Javascript .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.JAVASCRIPT .hljs-keyword:contains(new)').addClass('new');
			$('.hljs.JavaScript .hljs-keyword:contains(new)').addClass('new');
		}
		if(rqr || $('.hljs.JS .hljs-built_in:contains(require)') || $('.hljs.Js .hljs-built_in:contains(require)') || $('.hljs.javascript .hljs-built_in:contains(require)') || $('.hljs.Javascript .hljs-built_in:contains(require)') || $('.hljs.JAVASCRIPT .hljs-built_in:contains(require)') || $('.hljs.JavaScript .hljs-built_in:contains(require)')) {
			rqr.addClass('rqr');
			$('.hljs.JS .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.Js .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.javascript .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.Javascript .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.JAVASCRIPT .hljs-built_in:contains(require)').addClass('rqr');
			$('.hljs.JavaScript .hljs-built_in:contains(require)').addClass('rqr');
		} else
			return;
	};

	log(text) {
		return console.log(`%c[JSMaterialThemeCodeblocks]%c ${text}`, 'color: #F95479', '');
	};

	start() {
		this.log('Started.');
		$('head').append(this.css);
		this.createThisClass();
		this.log('MaterialTheme classes integrated.');
	};
	stop() { this.log('Stopped.'); };
	load() { this.log('Loaded.'); };
	unload() {};
	observer(ejs) {
		if(ejs.addedNodes.length && ejs.addedNodes[0].classList && ejs.addedNodes[0].classList.contains('markup'))
			setTimeout(() => this.createThisClass(), 250);
		else
			return;
	};
	onMessage() {};
	onSwitch() { 
		setTimeout(() => this.createThisClass(), 250); 
		setTimeout(() => this.log('MaterialTheme classes integrated.'), 500);
	};

	getName() { return 'JSMaterialThemeCodeblocks'; };
	getAuthor() { return 'Arashiryuu'; };
	getVersion() { return '2.0.0'; };
	getDescription() { return 'Applies the "Material Theme" to JavaScript codeblocks.'; };
	getSettingsPanel() { return '你已经死了。'; };
};
/*@end@*/
