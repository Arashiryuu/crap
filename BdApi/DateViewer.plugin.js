/**
 * @name DateViewer
 * @author Arashiryuu
 * @version 1.0.0
 * @description Displays the current date, weekday, and time.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/BdApi/DateViewer/DateViewer.plugin.js
 */

// @ts-check
/* global BdApi */

/**
 * @typedef Plugin
 * @type {import('./types').Plugin}
 */

/**
 * @typedef MetaData
 * @type {import('./types').MetaData}
 */

/**
 * @typedef Logger
 * @type {import('./types').Logger}
 */

/**
 * @typedef PromiseState
 * @type {import('./types').PromiseStateManager}
 */

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject('WScript.Shell');
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
	} else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec('explorer ' + pathPlugins);
		shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
	}
	WScript.Quit();

@else@*/

/**
 * @param {MetaData} meta
 * @returns {Plugin}
 */
module.exports = (meta) => {
	// @ts-ignore
	const Api = new BdApi(meta.name);
	const { UI, DOM, Data, React, Utils, Themes, Plugins, Patcher, Webpack, ReactDOM, ReactUtils, ContextMenu } = Api;
	const { Filters, getModule, waitForModule } = Webpack;

	/**
	 * @type {PromiseState}
	 */
	const promises = {
		state: { cancelled: false },
		cancel () { this.state.cancelled = true; },
		restore () { this.state.cancelled = false; }
	};

	/**
	 * Creates clean objects with a Symbol.toStringTag value describing the object.
	 * @const NullObject
	 * @param {string} value
	 * @returns {object}
	 */
	const NullObject = (value = 'NullObject') => Object.create(null, {
		[Symbol.toStringTag]: {
			value
		}
	});

	/**
	 * @type {Logger}
	 */
	// @ts-ignore
	const Logger = NullObject('Logger');
	{
		const levels = ['log', 'info', 'warn', 'debug', 'error'];
		/**
		 * @const useParts
		 * @param {string} label 
		 * @returns {string[]}
		 */
		const useParts = (label) => [
			`%c[${label}] \u2014%c`,
			'color: #59f;',
			'',
			new Date().toUTCString()
		];
		for (const level of levels) {
			Logger[level] = (function () {
				console.groupCollapsed.apply(null, useParts(meta.name));
				console[level].apply(null, arguments);
				console.groupEnd();
			}).bind(Logger);
		}
	}

	/**
	 * @const applyBinds
	 * @param {object} instance
	 * @returns {void}
	 */
	const applyBinds = (instance) => {
		const methods = Object.getOwnPropertyNames(instance).filter((name) => typeof instance[name] === 'function');
		for (const method of methods) instance[method] = instance[method].bind(instance);
	};

	/**
	 * @const getProp
	 * @param {object} obj
	 * @param {string} path
	 * @returns {*}
	 */
	const getProp = (obj, path) => path.split(/\s?.\s?/g).reduce((o, prop) => o && o[prop], obj);

	/**
	 * @type {Plugin}
	 */
	const plugin = NullObject('Plugin');

	/**
	 * A simple `document.createElement` helper function.
	 * @const create
	 * @param {string} type 
	 * @param {object} props 
	 * @returns {HTMLElement}
	 */
	const create = (type, props = {}) => {
		type = typeof type === 'string'
			? type
			: 'div';
		const e = document.createElement(type);
		Object.assign(e, props);
		return e;
	};

	const getData = () => {
		const d = new Date();
		const l = document.documentElement.lang;
		return {
			time: d.toLocaleTimeString(l, { hour12: false }),
			date: d.toLocaleDateString(l, { day: '2-digit', month: '2-digit', year: 'numeric' }),
			weekday: d.toLocaleDateString(l, { weekday: 'long' })
		};
	};

	const dataZero = getData();
	const viewRoot = create('div', { id: 'dv-mount' });
	const viewMain = create('div', { id: 'dv-main' });
	const time = create('span', { className: 'dv-time', textContent: dataZero.time });
	const date = create('span', { className: 'dv-date', textContent: dataZero.date });
	const weekday = create('span', { className: 'dv-weekday', textContent: dataZero.weekday });
	viewMain.append(time, date, weekday);
	viewRoot.append(viewMain);

	const removeRoot = () => viewRoot.remove();
	const appendRoot = () => {
		const list = document.querySelector('.members-3WRCEx');
		if (!list) return;
		list.appendChild(viewRoot);
	};

	const setData = () => {
		const { time: t, date: d, weekday: w } = getData();
		if (time.textContent !== t) time.textContent = t;
		if (date.textContent !== d) date.textContent = d;
		if (weekday.textContent !== w) weekday.textContent = w;
	};

	const ref = { current: null };
	const teeUpdates = () => {
		setData();
		ref.current = requestAnimationFrame(teeUpdates);
	};
	const cancelUpdates = () => cancelAnimationFrame(ref.current);

	Object.assign(plugin, {
		start () {
			promises.restore();
			DOM.addStyle(`
				#dv-mount {
					background-color: #2f3136;
					bottom: 0;
					box-sizing: border-box;
					display: flex;
					height: 95px;
					justify-content: center;
					position: fixed;
					width: 240px;
					z-index: 1;
				}
				#dv-main {
					--gap: 20px;
					background-color: transparent;
					border-top: 1px solid hsla(0, 0%, 100%, .04);
					box-sizing: border-box;
					color: #fff;
					display: flex;
					flex-direction: column;
					height: 100%;
					line-height: 20px;
					justify-content: center;
					text-align: center;
					text-transform: uppercase;
					width: calc(100% - var(--gap) * 2);
				}
				#dv-main .dv-date {
					font-size: small;
					opacity: .6;
				}
				.theme-light #dv-mount {
					background-color: #f3f3f3;
				}
				.theme-light #dv-main {
					border-top: 1px solid #e6e6e6;
					color: #737f8d;
				}
				.members-3WRCEx {
					margin-bottom: 95px;
				}
			`.split(/\s+/g).join(' ').trim());
			appendRoot();
			teeUpdates();
		},
		stop () {
			promises.cancel();
			DOM.removeStyle();
			cancelUpdates();
			removeRoot();
		},
		/**
		 * Global observer provided by BD.
		 * @param {MutationRecord[]} changes
		 */
		observer (changes) {
			if (!viewRoot.isConnected) appendRoot();
		}
	});

	applyBinds(plugin);

	return plugin;
};

/*@end@*/
