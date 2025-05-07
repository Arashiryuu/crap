/**
 * @name DateViewer
 * @author Arashiryuu
 * @version 1.0.14
 * @description Displays the current date, weekday, and time.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/BdApi/DateViewer/DateViewer.plugin.js
 */

/// <reference path="./bdtypes.ts" />
// @ts-check
/* global BdApi */

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
 * @param {!Prettify<BD.MetaData>} meta
 * @returns {!BD.Plugin}
 */
module.exports = (meta) => {
	// @ts-ignore
	const Api = new BdApi(meta.name);
	const { UI, DOM, Data, React, Utils, Themes, Plugins, Patcher, Webpack, ReactDOM, ReactUtils, ContextMenu } = Api;
	const { createElement: ce, useRef, useMemo, useState, useEffect, useReducer, useCallback, useLayoutEffect } = React;
	const { createRoot } = ReactDOM;
	const { getModule, getWithKey, waitForModule } = Webpack;
	const CSSKey = `${meta.name}-stylesheet`;

	const Filters = Object.create(Webpack.Filters);
	Object.assign(Filters, {
		/**
		 * @param {!string} id
		 * @returns {!FilterFunction}
		 */
		byId: (id = '1') => (...m) => m.pop() === String(id),
		/**
		 * @type {!FilterFunction}
		 */
		byName: Filters.byDisplayName,
		/**
		 * @param {!string} name 
		 * @returns {!FilterFunction}
		 */
		byStore: (name = '') => (m) => m?._dispatchToken && m?.getName() === name,
		/**
		 * @type {!FilterFunction}
		 */
		byProtos: Filters.byPrototypeFields
	});

	const raf = requestAnimationFrame;
	const toString = Object.prototype.toString;

	const LangUtils = Webpack.getByKeys('Messages', '_languages');
	const { inspect } = Webpack.getByKeys('inspect', 'promisify');

	/* Language Strings */

	const strings = /** @type {const} */ ({
		en: {
			HOUR12_LABEL: '12 Hour Time Format',
			HOUR12_NOTE: 'Whether to use 12 hour time, or 24 hour time.',
			SECONDS_LABEL: 'Display Seconds',
			SECONDS_NOTE: 'Toggle for enabling/disabling the seconds on the viewer.'
		},
		fr: {
			HOUR12_LABEL: 'Format d\'heure de 12 heures',
			HOUR12_NOTE: 'Que ce soit pour utiliser l\'heure de 12 heures ou celle de 24 heures.',
			SECONDS_LABEL: 'Afficher les secondes',
			SECONDS_NOTE: 'Basculez pour activer/désactiver les secondes sur la visionneuse.'
		}
		//,
		// de: {
		// 	HOUR12_LABEL: '12 Stunden Zeitformat',
		// 	HOUR12_NOTE: '',
		// 	SECONDS_LABEL: '',
		// 	SECONDS_NOTE: ''
		// },
		// pl: {
		// 	HOUR12_LABEL: '',
		// 	HOUR12_NOTE: '',
		// 	SECONDS_LABEL: '',
		// 	SECONDS_NOTE: ''
		// },
		// ru: {
		// 	HOUR12_LABEL: '',
		// 	HOUR12_NOTE: '',
		// 	SECONDS_LABEL: '',
		// 	SECONDS_NOTE: ''
		// }
	});

	/**
	 * @returns {!Readonly<Values<typeof strings>>}
	 */
	const useStrings = () => {
		/** @type {!string} */
		const [lang] = LangUtils.getLocale().split('-');
		return strings[lang] ?? strings.en;
	};

	/* Utility */

	/**
	 * @param {!object} instance
	 * @returns {void}
	 */
	const applyBinds = (instance) => {
		const methods = Object.getOwnPropertyNames(instance).filter((name) => typeof instance[name] === 'function');
		for (const method of methods) instance[method] = instance[method].bind(instance);
	};

	/**
	 * @type {!Prettify<BD.PromiseStateManager>}
	 */
	const promises = {
		state: { cancelled: false },
		cancel () { this.state.cancelled = true; },
		restore () { this.state.cancelled = false; }
	};
	applyBinds(promises);

	/**
	 * Creates clean objects with a `Symbol.toStringTag` value describing the object as its only inherited data.
	 * @param {!string} value
	 * @returns {!object}
	 */
	const _Object = (value = 'NullObject') => Object.create(
		Object.create(null, {
			[Symbol.toStringTag]: {
				enumerable: false,
				value
			}
		})
	);

	/**
	 * @type {!Prettify<BD.Logger>}
	 */
	const Logger = _Object('Logger');
	{
		/**
		 * @param {!string} label 
		 * @returns {!string[]}
		 */
		const useParts = (label) => [
			`%c[${label}] \u2014%c`,
			'color: #59f;',
			'',
			new Date().toUTCString()
		];
		const levels = /** @type {const} */ ([
			'log',
			'info',
			'warn',
			'debug',
			'error'
		]);
		Logger.dir = (...n) => {
			console.groupCollapsed(...useParts(meta.name));
			for (const item of n) console.dir(item);
			console.groupEnd();
		};
		Logger.ins = (...n) => {
			const inspected = n.map((item) => inspect(item, { colors: true }));
			console.groupCollapsed(...useParts(meta.name));
			for (const item of inspected) console.log(item);
			console.groupEnd();
		};
		Logger.table = (...args) => {
			console.groupCollapsed(...useParts(meta.name));
			for (const out of args) console.table(out);
			console.groupEnd();
		};
		const stagger = (name = meta.name, level = 'log') => {
			const logs = [];
			return Object.freeze({
				/** @param {!unknown[]} data */
				push (...data) {
					logs.push(data);
				},
				flush () {
					logs.splice(0);
				},
				print () {
					console.groupCollapsed(...useParts(name));
					for (const out of logs) console[level](...out);
					console.groupEnd();
				}
			});
		};
		for (const level of levels) {
			Logger[level] = (...args) => {
				console.groupCollapsed(...useParts(meta.name));
				console[level](...args);
				console.groupEnd();
			};
			Logger[`_${level}`] = stagger(meta.name, level);
		}
		Logger._table = stagger(meta.name, 'table');
	}
	applyBinds(Logger);

	/**
	 * @param {!object} obj
	 * @param {!string} path
	 * @returns {*}
	 */
	const getProp = (obj, path) => path.split(/\s?\.\s?/g).reduce((o, prop) => o && o[prop], obj);

	/**
	 * Generates a DOM element.
	 * @param {!string} type
	 * @returns {!BD.DOMElement}
	 */
	const getElement = (type = 'div') => {
		const e = document.createElement(type);
		if (e instanceof HTMLUnknownElement) return document.createElementNS('http://www.w3.org/2000/svg', type);
		return e;
	};

	/**
	 * @param {!string} key 
	 * @returns {!boolean}
	 */
	const isEvent = (key) => key.slice(0, 2) === 'on' && key[2] === key[2].toUpperCase();

	/**
	 * @param {!string} key
	 * @returns {!boolean}
	 */
	const isDataAttr = (key) => key.startsWith('data') && key.toLowerCase() !== key;

	/**
	 * @param {!string} key
	 * @returns {!string}
	 */
	const normalizeEvent = (key) => key === 'doubleclick'
		? 'dblclick'
		: key;

	/**
	 * @param {!string} key
	 * @returns {!string}
	 */
	const normalizeDataAttr = (key) => key.replace(/([A-Z]{1})/g, '-$1').toLowerCase();

	/**
	 * A `document.createElement` helper function.
	 * @param {!string} type 
	 * @param {!object} props
	 * @param {!(string | Node)[]} [children]
	 * @returns {!BD.DOMElement}
	 */
	const create = (type = 'div', props = {}, ...children) => {
		if (typeof type !== 'string') type = 'div';
		const e = getElement(type);

		if (toString.call(props) !== '[object Object]') {
			if (children.length) e.append(...children);
			return e;
		}

		if (!Object.hasOwn(props, 'children') && children.length) {
			e.append(...children);
		}

		for (const key of Object.keys(props)) {
			switch (key) {
				case 'text': {
					e.textContent = props[key];
					break;
				}
				case 'style': {
					if (typeof props[key] === 'string') {
						e.setAttribute(key, props[key]);
						break;
					}
					try {
						Object.assign(e[key], props[key]);
					} catch (fail) {
						Logger.error(fail);
					}
					break;
				}
				case 'htmlFor': {
					e.setAttribute('for', props[key]);
					break;
				}
				case 'className': {
					e.classList.add(...props[key].split(' '));
					break;
				}
				case 'classList':
				case 'classes': {
					if (!Array.isArray(props[key])) props[key] = [props[key]];
					e.classList.add(...props[key]);
					break;
				}
				case 'children': {
					if (!Array.isArray(props[key])) props[key] = [props[key]];
					e.append(...props[key]);
					break;
				}
				default: {
					if (isEvent(key)) {
						const event = normalizeEvent(key.slice(2).toLowerCase());
						e.addEventListener(event, props[key]);
						break;
					}
					if (isDataAttr(key)) {
						const attr = normalizeDataAttr(key);
						e.setAttribute(attr, props[key]);
						break;
					}
					e.setAttribute(key, props[key]);
					break;
				}
			}
		}

		// @ts-ignore
		e.$$props = props;
		return e;
	};

	/**
	 * @type {!Prettify<BD.Plugin>}
	 */
	const plugin = _Object(meta.name);

	/* Setup */

	/**
	 * Converts a classname string into a class selector.
	 * @param {!string} className
	 * @returns {!string}
	 */
	const toSelector = (className) => `.${className.split(' ').join('.')}`;

	const memberListClasses = Webpack.getByKeys('members', 'container', 'membersWrap');
	/**
	 * Current selector for the member-list.
	 */
	const memberListSelector = toSelector(memberListClasses.members);
	const memberWrap = toSelector(memberListClasses.membersWrap);

	/**
	 * Converts a template literal interpolated string from a human-readable format into a one-liner for use in stylesheets.
	 * @param {!TemplateStringsArray} ss
	 * @param {!any[]} vars
	 * @returns {!string}
	 * @example
	 * ```js
	 * const bgCol = '#FF00FF';
	 * css`
	 *   .this {
	 *     color: red;
	 *     background: ${bgCol};
	 *   }
	 * `
	 * // .this { color: red; background: #FF00FF; }
	 * ```
	 */
	const css = (ss, ...vars) => String.raw(ss, ...vars).split(/\s+/g).join(' ').trim();

	const style = css`
		#dv-mount {
			background-color: var(--background-secondary);
			bottom: 0;
			box-sizing: border-box;
			display: flex;
			height: 95px !important;
			justify-content: center;
			position: fixed;
			width: var(--custom-member-list-width);
			z-index: 1;
		}
		#dv-main {
			--gap: 20px;
			--_hsla: 0, 0%, 100%, 0.04;
			background-color: transparent;
			border-top: 1px solid hsla(var(--_hsla));
			box-sizing: border-box;
			color: var(--text-primary);
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
			opacity: 0.6;
		}
		.theme-light #dv-main {
			--_hsla: 0, 0%, 0%, 0.04;
		}
		${memberListSelector} {
			margin-bottom: 95px;
		}
		/* Error Component */
		.${meta.name}-error {
			position: fixed;
			bottom: 3dvh;
			color: red;
			font-size: 18px;
			font-weight: 600;
			text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black,
						 0 0 1px black, 0 0 2px black, 0 0 3px black,
						 0 0 1px black, 0 0 2px black, 0 0 3px black;
		}
	`;

	/* Settings */
	
	const defaults = {
		hour12: false,
		displaySeconds: true
	};
	/**
	 * @type {!typeof defaults}
	 */
	let settings = Utils.extend({}, defaults);

	const DOM_MODE = true;

	/**
	 * Discord Components
	 */
	const BulkModule = {};
	const Discord = {
		Switch: Webpack.getByStrings('checked:', 'tooltipNote:', { searchExports: true }),
		TooltipWrapper: Webpack.getByPrototypeKeys('shouldShowTooltip', { searchExports: true }),
		ThemeContext: Webpack.getByStrings('theme:', 'flags:', '.useContext', { searchExports: true })
	};

	/**
	 * ErrorBoundary Component Definition
	 */
	const ErrorBoundary = class ErrorBoundary extends React.Component {
		state = { hasError: false };

		/**
		 * @param {!Error} error
		 */
		static getDerivedStateFromError (error) {
			return { hasError: true };
		}

		/**
		 * @param {!Error} error
		 * @param {!React.ErrorInfo} info
		 */
		componentDidCatch (error, info) {
			Logger.error(error, info);
		}

		render () {
			if (this.state.hasError) return ce(Discord.TooltipWrapper, {
				text: 'See console for details.',
				children: (props) => {
					return ce('div', {
						className: `${meta.name}-error`,
						children: [
							'Component Error'
						],
						...props
					});
				},
				...Discord.TooltipWrapper.defaultProps
			});
			// @ts-ignore
			return this.props.children;
		}
	};

	/**
	 * Custom hook wrapper for forceUpdate functionality.
	 * @returns {!React.DispatchWithoutAction}
	 */
	const useForceUpdate = () => useReducer((x) => x + 1, 0).pop();

	/**
	 * HOC for using an ErrorBoundary.
	 * @param {!React.FC} Original
	 * @returns {!React.FC}
	 */
	const withErrorBoundary = (Original) => {
		return (props) => {
			return ce(ErrorBoundary, null, ce(Original, props));
		};
	};

	/**
	 * HOC for wrapping elements in Discord's theme context.
	 * @param {!React.FC} Original
	 * @returns {!React.FC}
	 */
	const withThemeContext = (Original) => {
		return (props) => {
			return ce(Discord.ThemeContext, null, ce(Original, props));
		};
	};

	/**
	 * Fragment helper, only accepts a child elements array and sets no extra props on the fragment.
	 * @param {!React.ReactNode[]} [children]
	 * @returns {!React.ReactFragment}
	 */
	const Fragment = (children = []) => ce(React.Fragment, { children });

	const Switch = withThemeContext((props) => {
		// @ts-ignore
		const { label = 'Switch label', note = 'Switch note', checked = false, disabled = false, onChange = console.log } = props;

		return ce(Discord.Switch, {
			...props,
			children: label,
			value: checked,
			hideBorder: false,
			disabled: Boolean(disabled),
			note,
			onChange
		});
	});

	/**
	 * @typedef SettingsProps
	 * @property {() => void} onChange
	 */

	/**
	 * @param {!SettingsProps} props
	 * @returns {!React.ReactHTMLElement<'div'>}
	 */
	const Settings = (props) => {
		const forceUpdate = useForceUpdate();
		const onChange = () => {
			if (typeof props.onChange === 'function') props.onChange();
			forceUpdate();
		};
		const {
			HOUR12_LABEL,
			HOUR12_NOTE,
			SECONDS_LABEL,
			SECONDS_NOTE
		} = useStrings();

		return ce('div', {
			key: 'Plugin-Settings',
			children: [
				ce(Api.Components.SettingGroup, {
					id: 'main',
					name: 'Plugin-Settings',
					shown: true,
					collapsible: true,
					settings: [
						{
							id: 'hour12',
							type: 'switch',
							name: HOUR12_LABEL,
							note: HOUR12_NOTE,
							value: settings.hour12 ?? false,
							/**
							 * @param {!boolean} e
							 */
							onChange (e) {
								settings.hour12 = e;
								onChange();
							}
						},
						{
							id: 'seconds',
							type: 'switch',
							name: SECONDS_LABEL,
							note: SECONDS_NOTE,
							value: settings.displaySeconds ?? false,
							/**
							 * @param {!boolean} e
							 */
							onChange (e) {
								settings.displaySeconds = e;
								onChange();
							}
						}
					]
				})
			]
		});
	};

	/**
	 * Root element for plugin settings.
	 */
	const settingRoot = create('div', { id: `__${meta.name}-react-settings-root__` });
	let sroot = createRoot(settingRoot);

	/**
	 * Indicates whether a node was removed.
	 * @param {!NodeListOf<Node>} removed
	 * @param {!Node} root
	 * @returns {!boolean}
	 */
	const isCleared = (removed, root) => {
		if (!removed.length) return false;
		// @ts-ignore
		for (let i = 0; i < removed.length; i++) {
			const node = removed[i];
			if (node.contains(root)) return true;
		}
		return false;
	};

	/* Setup Cont. */

	/**
	 * @returns {!string}
	 */
	const lang = () => (
		LangUtils?.getLocale() ?? document.documentElement.lang
	) ?? 'en-gb';

	const getData = () => {
		const { hour12, displaySeconds } = settings;
		const d = new Date();
		const l = lang();
		const timeStyle = displaySeconds
			? 'long'
			: 'short';
		let time = (new Intl.DateTimeFormat(l, { timeStyle, hour12 })).format(d);
		if (displaySeconds) {
			time = time.replace(/(GMT|BST|UTC)(\+\d{1,2})?/ig, '').trim();
		}
		return {
			time,
			date: d.toLocaleDateString(l, { day: '2-digit', month: '2-digit', year: 'numeric' }),
			weekday: d.toLocaleDateString(l, { weekday: 'long' })
		};
	};
	
	const dataZero = getData();

	/**
	 * Interval hook.
	 * @param {!VoidFunction} callback
	 * @param {!number} [time=1000]
	 */
	const useInterval = (callback, time = 1000) => {
		/**
		 * @type {!React.RefObject<VoidFunction>}
		 */
		const cbRef = useRef(callback);

		useEffect(() => {
			const id = setInterval(() => cbRef.current(), time);
			return () => clearInterval(id);
		}, [time]);
	};

	const delta = 1 / 60;
	/**
	 * AnimationFrame hook.
	 * @param {!VoidFunction} callback
	 */
	const useAnimationFrame = (callback) => {
		/**
		 * @type {!React.RefObject<FrameRequestCallback>}
		 */
		const cbRef = useRef(callback);
		/**
		 * @type {!React.MutableRefObject<number>}
		 */
		const frame = useRef();
		/**
		 * @type {!React.MutableRefObject<number>}
		 */
		const last = useRef(0);
		/**
		 * @type {!React.MutableRefObject<number>}
		 */
		const accu = useRef(0);

		/**
		 * @type {!FrameRequestCallback}
		 */
		const animate = useCallback((now) => {
			accu.current += (now - last.current) / 1000;
			if (accu.current > 1) accu.current = 1;
			accu.current = Math.max(0, accu.current);
			while (accu.current > delta) {
				cbRef.current(delta);
				accu.current -= delta;
			}
			last.current = now;
			frame.current = raf(animate);
		}, []);

		useLayoutEffect(() => {
			frame.current = raf(animate);
			return () => frame.current && cancelAnimationFrame(frame.current);
		}, []);
	};

	/**
	 * @returns {!React.ReactHTMLElement<HTMLDivElement>}
	*/
	const Viewer = () => {
		const [state, setState] = useState(getData);
		const update = useCallback(() => setState(getData), []);
		/**
		 * @type {!React.RefObject<HTMLDivElement>}
		*/
		const ref = useRef();
		
		// useAnimationFrame(update);
		useInterval(update);
		
		if (DOM_MODE) {
			return ce('div', {
				id: 'dv-main',
				ref: ref,
				key: 'dv_viewer_main',
				children: [
					ce('span', { key: 'dv_viewer_time', className: 'dv-time' }, state.time),
					ce('span', { key: 'dv_viewer_date', className: 'dv-date' }, state.date),
					ce('span', { key: 'dv_viewer_weekday', className: 'dv-weekday' }, state.weekday)
				]
			});
		}
		
		return ce('div', {
			id: 'dv-mount',
			children: [
				ce('div', {
					id: 'dv-main',
					ref: ref,
					key: 'dv_viewer_main',
					children: [
						ce('span', { key: 'dv_viewer_time', className: 'dv-time' }, state.time),
						ce('span', { key: 'dv_viewer_date', className: 'dv-date' }, state.date),
						ce('span', { key: 'dv_viewer_weekday', className: 'dv-weekday' }, state.weekday)
					]
				})
			]
		});
	};
	Viewer.Wrapped = withErrorBoundary(Viewer);

	const viewRoot = create('div', { id: 'dv-mount' });
	const viewMain = create('div', { id: 'dv-main' });
	const time = create('span', { class: 'dv-time' }, dataZero.time);
	const date = create('span', { class: 'dv-date' }, dataZero.date);
	const weekday = create('span', { class: 'dv-weekday' }, dataZero.weekday);
	viewMain.append(time, date, weekday);
	viewRoot.append(viewMain);

	let vroot = createRoot(viewRoot);

	const removeRoot = () => viewRoot.isConnected && viewRoot.remove();
	const appendRoot = () => {
		const list = document.querySelector(memberWrap);
		if (!list || viewRoot.isConnected) return;
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
		ref.current = raf(teeUpdates);
	};
	const cancelUpdates = () => ref.current && cancelAnimationFrame(ref.current);

	const instanceKey = `${meta.name}-Boundary`;
	const connect = () => {
		vroot.render(ce(Viewer.Wrapped, { key: instanceKey }));
	};

	const disconnect = () => {
		vroot.unmount();
	};

	const reconnect = () => {
		disconnect();
		connect();
	};

	/**
	 * @type {!BD.PatchFunction<void>}
	 */
	const patchMemberList = (state) => {
		if (DOM_MODE) return;
		if (!BulkModule.ListThin || !BulkModule.ScrollerThin || state.cancelled) return;

		const isThread = (props) => {
			return !props['data-list-id'] && props.className.startsWith('members');
		};

		const validateAndPush = (type, value) => {
			if (type !== 'members') return value;
			const ret = Array.isArray(value)
				? value
				: Array.of(value);
			if (!ret.length) return ret;
			if (ret.find((fiber) => fiber?.key === instanceKey)) return ret;
			ret.push(ce(Viewer.Wrapped, { key: instanceKey }));
			return ret;
		};
		
		Patcher.after(BulkModule.ListThin, 'render', (that, args, value) => {
			const val = Array.isArray(value)
				? value.find((item) => item && !item.key)
				: value;
			const props = val.props;
			const type = props?.['data-list-id']?.split('-')[0] ?? props?.className?.split('_')[0];
			if (isThread(props)) {
				const mlist = getProp(props, 'children.0.props.children.props');
				validateAndPush(type, mlist.children);
				return value;
			}
			return validateAndPush(type, value);
		});

		// Group DMs
		Patcher.after(BulkModule.ScrollerThin, 'render', (that, args, value) => {
			const val = Array.isArray(value)
				? value.find((item) => item && !item.key)
				: value;
			const type = val.props?.['data-list-id']?.split('-')[0] ?? val.props?.className?.split('_')[0];
			return validateAndPush(type, value);
		});
	};

	const onStart = () => {
		DOM.addStyle(CSSKey, style);
		if (DOM_MODE) {
			appendRoot();
			connect();
		}
		// teeUpdates();
		patchMemberList(promises.state);
	};

	const onStop = () => {
		DOM.removeStyle(CSSKey);
		cancelUpdates();
		if (DOM_MODE) {
			removeRoot();
			disconnect();
		}
		Patcher.unpatchAll();
	};

	const loadSettings = () => {
		settings = Utils.extend({}, defaults, Data.load('settings'));
	};

	const saveSettings = () => {
		Data.save('settings', settings);
	};

	/* Changelog */

	/**
	 * @typedef VersionData
	 * @property {!string} version
	 * @property {!boolean} hasShownChangelog
	 */

	/**
	 * A balanced ternary numeral, representing a signed value.
	 * @typedef VersionNumeral
	 * @type {!Readonly<-1 | 0 | 1>}
	 */

	/**
	 * @typedef VersionTuple
	 * @type {![VersionNumeral, Solid<VersionData>]}
	 */

	const Versions = class Versions {
		static key = /** @type {const} */ ('currentVersionInfo');

		static Signs = /** @type {const} */ ({
			LEFT: -1,
			SAME: 0,
			RIGHT: 1
		});

		/**
		 * @returns {!VersionTuple}
		 */
		static getInfo () {
			/**
			 * @type {!Solid<VersionData>}
			 */
			const local = Data.load(Versions.key);
			/**
			 * @type {!VersionTuple}
			 */
			const ret = [Versions.Signs.SAME, local];
			if (!local || !local.version) return ret;
			if (local.hasShownChangelog && local.version === meta.version) return ret;
			ret[0] = Utils.semverCompare(local.version, meta.version);
			return ret;
		}
	};

	const Changelogs = class Changelogs {
		static Types = /** @type {const} */ ({
			Added: {
				TYPE: 'added',
				TITLE: '[ What\'s New ]'
			},
			Fixed: {
				TYPE: 'fixed',
				TITLE: '[ Bugs Squashed ]'
			},
			Progress: {
				TYPE: 'progress',
				TITLE: '[ Maintenance ]'
			},
			Improved: {
				TYPE: 'improved',
				TITLE: '[ Evolving ]'
			}
		});

		/**
		 * @type {!Prettify<BD.Changes>[]}
		 */
		static Changes = [
			{
				type: Changelogs.Types.Fixed.TYPE,
				title: Changelogs.Types.Fixed.TITLE,
				items: [
					'React version `19.0.0` update.',
					'Fix viewer root double-rendering in DOM mode.'
				]
			}
			// {
			// 	type: Changelogs.Types.Progress.TYPE,
			// 	title: Changelogs.Types.Progress.TITLE,
			// 	items: [
			// 		'Visual refresh update.'
			// 	]
			// }
		];

		/**
		 * @type {!Prettify<BD.ModalData>}
		 */
		static ModalData = {
			title: `${meta.name} Changelog`,
			subtitle: `v${meta.version}`,
			changes: Changelogs.Changes
		};

		static show () {
			const [sign, local] = Versions.getInfo();
			if (sign === Versions.Signs.LEFT) return;
			if (sign === Versions.Signs.SAME && local && local.hasShownChangelog) return;
			if (Changelogs.Changes.length) UI.showChangelogModal(Changelogs.ModalData);
			Data.save(Versions.key, { version: meta.version, hasShownChangelog: true });
		}
	};

	/* Build */

	Object.assign(plugin, {
		start () {
			promises.restore();
			loadSettings();
			raf(onStart);
			Changelogs.show();
		},
		stop () {
			promises.cancel();
			raf(onStop);
		},
		getSettingsPanel () {
			const panel = ce(Settings, {
				onChange: () => {
					saveSettings();
					if (DOM_MODE) {
						reconnect();
					}
				}
			});
			sroot.render(panel);
			return settingRoot;
		},
		/**
		 * Global observer provided by BD.
		 * @param {!MutationRecord} change
		 */
		observer (change) {
			if (isCleared(change.removedNodes, settingRoot)) {
				sroot.unmount();
				sroot = createRoot(settingRoot);
			}
			if (DOM_MODE) {
				if (!viewRoot.isConnected) raf(appendRoot);
			}
		}
	});

	/* Finalize */

	applyBinds(plugin);
	return plugin;
};

/*@end@*/
