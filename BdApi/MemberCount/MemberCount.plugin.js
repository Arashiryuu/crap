/**
 * @name MemberCount
 * @author Arashiryuu
 * @version 3.0.11
 * @description Displays a server's member-count at the top of the member-list, can be styled with the `#MemberCount` selector.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/BdApi/MemberCount/MemberCount.plugin.js
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
	'use strict';
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
		 * @param {!number} id
		 * @returns {!FilterFunction}
		 */
		byId: (id = 1) => (...m) => m.pop() === Number(id),
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
		byProtos: Filters.byPrototypeKeys,
		/**
		 * Filters for `forwardRef` elements.
		 */
		Forwarded: {
			/**
			 * @param {!string[]} strings
			 * @returns {!FilterFunction}
			 */
			byStrings: (...strings) => (m) => Filters.byStrings(...strings)(m?.render)
		}
	});

	const queries = [
		{
			filter: Filters.byStrings('checked:', 'tooltipNote:'),
			searchExports: true
		},
		{
			filter: Filters.byStrings('theme:', 'flags:', '.useContext'),
			searchExports: true
		},
		{
			filter: Filters.byProtos('shouldShowTooltip'),
			searchExports: true
		},
		{
			filter: Filters.byStore('GuildMemberCountStore')
		},
		{
			filter: Filters.byStore('SelectedGuildStore')
		},
		{
			filter: Filters.byKeys('Messages', '_languages')
		},
		{
			filter: Filters.Forwarded.byStrings('renderSection:', 'renderListHeader:'),
			searchExports: true
		},
		{
			filter: Filters.byKeys('inspect', 'promisify')
		},
		{
			filter: Filters.byStrings('stores', 'getStateFromStores', 'useStateFromStores'),
			searchExports: true
		},
		{
			filter: Filters.byKeys('dividerDefault')
		},
		{
			filter: Filters.byKeys('members', 'container', 'membersWrap')
		},
		{
			/**
			 * @type {!FilterFunction}
			 */
			filter: (m) => m?.container?.endsWith('13cf1')
		}
	];

	/**
	 * @type {!any[]}
	 */
	const modules = Webpack.getBulk(...queries);
	/**
	 * @type {!((o: unknown) => string)}
	 */
	const toString = Function.call.bind(Object.prototype.toString);
	const [
		// Stores
		MemberCountStores,
		SelectedGuildStore,
		// Modules
		LangUtils,
		ListThin,
		// Functions & Data
		{ inspect },
		useStateFromStores,
		formClasses,
		...mClasses
	] = modules.slice(3);

	const options = {
		style: [
			{
				name: 'Classic',
				desc: 'Use the classic display style - matches Discord\'s role headers in the member list.',
				value: 0
			},
			{
				name: 'New',
				desc: 'Use the new display style.',
				value: 1
			}
		],
		margin: [
			{
				name: 'Compact',
				desc: 'Old style spacing which cuts off part of the scrollbar in the memberlist.',
				value: 0
			},
			{
				name: 'Cozy',
				desc: 'New style spacing which accomodates the scrollbar properly.',
				value: 1
			}
		]
	};

	/* Language Strings */

	const strings = /** @type {const} */ ({
		pl: {
			INCLUDE: 'Dołącz serwer',
			EXCLUDE: 'Wyklucz serwer',
			MEMBERS: 'Członkowie',
			ONLINE: 'Online'
		},
		ru: {
			INCLUDE: 'Включить отображение участников',
			EXCLUDE: 'Отключить отображение участников',
			MEMBERS: 'Участники',
			ONLINE: 'онлайн'
		},
		fr: {
			INCLUDE: 'Inclure le serveur',
			EXCLUDE: 'Exclure le serveur',
			MEMBERS: 'Membres',
			ONLINE: 'En ligne'
		},
		de: {
			INCLUDE: 'Server einschließen',
			EXCLUDE: 'Server ausschließen',
			MEMBERS: 'Mitglieder',
			ONLINE: 'Online'
		},
		en: {
			INCLUDE: 'Include Server',
			EXCLUDE: 'Exclude Server',
			MEMBERS: 'Members',
			ONLINE: 'Online'
		}
	});

	/**
	 * @typedef i18nStrings
	 * @type {!Values<typeof strings>}
	 */

	/**
	 * @returns {!i18nStrings}
	 */
	const useStrings = () => {
		/** @type {!string} */
		const [lang] = LangUtils.getLocale().split('-');
		return strings[lang] ?? strings.en;
	};

	/* Utility */

	/**
	 * Self-binds methods to their owner object.
	 * @param {!object} instance
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
	 * Creates clean objects with a `Symbol.toStringTag` value describing the object as the only inherited data.
	 * @template T
	 * @param {!DictKey} value
	 * @returns {!T}
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
	 * Determines if something is null or undefined.
	 * @param {*} anything
	 * @returns {!boolean}
	 */
	const isNil = (anything) => anything === null || anything === undefined;

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
			'color: #59f;', // #a4e5ab for console 92 green
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
		Logger.ins = (...args) => {
			const output = args.map((arg) => inspect(arg, { colors: true }));
			console.groupCollapsed(...useParts(meta.name));
			for (const out of output) console.log(out);
			console.groupEnd();
		};
		Logger.dir = (...args) => {
			console.groupCollapsed(...useParts(meta.name));
			for (const out of args) console.dir(out);
			console.groupEnd();
		};
		Logger.table = (...args) => {
			console.groupCollapsed(...useParts(meta.name));
			for (const out of args) console.table(out);
			console.groupEnd();
		};
		const stagger = (name = meta.name, level = 'log') => {
			/**
			 * @type {!unknown[][]}
			 */
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
	 * Generates an SVGElement or HTMLElement from the provided tag name.
	 * @param {!string} tag
	 * @returns {!BD.DOMElement}
	 */
	const getElement = (tag) => {
		const element = document.createElement(tag);
		if (element instanceof HTMLUnknownElement) return document.createElementNS('http://www.w3.org/2000/svg', tag);
		return element;
	};

	/**
	 * @param {!string} key
	 * @returns {!string}
	 */
	const toEventName = (key) => key === 'doubleclick'
		? 'dblclick'
		: key;

	/**
	 * @param {!string} key
	 * @returns {!string}
	 */
	const toDataAttr = (key) => key.replace(/([A-Z]{1})/g, '-$1').toLowerCase();

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
	 * A `document.createElement` helper function.
	 * @param {!string} type
	 * @param {?object} props
	 * @param {!BD.ChildNode[]} children
	 * @returns {!BD.DOMElement}
	 */
	const create = (type = 'div', props = {}, ...children) => {
		if (typeof type !== 'string') type = 'div';
		const e = getElement(type);

		if (toString(props) !== '[object Object]') {
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
				case 'className':
					props[key] = props[key].split(' ');
				case 'classList': // eslint-disable-line no-fallthrough
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
						const event = toEventName(key.slice(2).toLowerCase());
						e.addEventListener(event, props[key]);
						break;
					}
					if (isDataAttr(key)) {
						const attr = toDataAttr(key);
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
	 * @param {!BD.ChildNode[]} [children] 
	 * @returns {!DocumentFragment}
	 */
	const fragment = (children = []) => {
		const frag = new DocumentFragment();
		if (children.length) frag.append(...children);
		return frag;
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

	const memberListClasses = Object.assign({}, ...mClasses);
	/**
	 * Current selectors for the member-list.
	 */
	const memberListSelector = toSelector(memberListClasses.members);
	const memberWrap = toSelector(memberListClasses.membersWrap);

	/**
	 * Converts a template literal interpolated string from a human-readable format into a one-liner for use in stylesheets.
	 * @param {!TemplateStringsArray} ss
	 * @param {!unknown[]} vars
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

	/**
	 * @typedef SpacingProps
	 * @property {!boolean} online
	 * @property {!number} marginSpacing
	 */

	/**
	 * @param {!SpacingProps} props
	 * @returns {!string}
	 */
	const getSpacing = ({ marginSpacing, online }) => {
		let min = 40;
		let max = 60;
		
		if (marginSpacing === 0) {
			min = 30;
			max = 40;
		}

		const ret = !online
			? min
			: max;

		return `space-${ret}`;
	};

	const menuIconSvg = css`
		M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64
		3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4
	`;
	const getCss = () => css`
		.theme-light {
			& #MemberCount {
				--_hsla: 0, 0%, 0%, 0.04;
			}
		}

		.custom-theme-background {
			& #MemberCount {
				--_bg: transparent;
			}
		}

		#MemberCount {
			--_hsla: 0, 0%, 100%, 0.04;
			--_bg: var(--background-base-lower, transparent);

			display: flex;
			background: var(--_bg);
			position: absolute;
			color: var(--channels-default, var(--text-default));
			width: var(--custom-member-list-width);
			padding: 0;
			z-index: 1;
			top: 0;
			margin-top: 0;
			border-bottom: 1px solid hsla(var(--_hsla));

			/* Error Component */
			&.${meta.name}-error {
				display: flex;
				justify-content: center;
				padding: 12px 0;
				height: auto;
				color: red !important;
				font-size: 18px;
				font-weight: 600;
				text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black,
							 0 0 1px black, 0 0 2px black, 0 0 3px black,
							 0 0 1px black, 0 0 2px black, 0 0 3px black;
			}
			
			& h3 {
				display: flex;
				padding: 12px 8px;
				height: auto;
				flex-direction: column;
			}

			& .membercount-row {
				display: flex;
				justify-content: center;
			}

			& .membercount-icon {
				margin-top: 1px;
				margin-right: 1px;
			}
		}

		${memberWrap}.hasCounter {
			--counter-space: 60px;

			&.space-30 {
				--counter-space: 30px;
			}

			&.space-40 {
				--counter-space: 40px;
			}

			&.space-60 {
				--counter-space: 60px;
			}

			& ${memberListSelector} {
				margin-top: var(--counter-space);
			}
		}

		${memberWrap}.hasCounter_thread {
			& #MemberCount {
				position: sticky;
			}

			& ${memberListSelector} {
				margin-top: 0;
			}
		}

		.membercount-hint-svg {
			position: relative;
			top: -1px;
		}

		.membercount-history-container {
			display: flex;
			flex: 1 1 0;
			flex-flow: wrap row;
			min-height: 64px;
			max-height: 128px;
			overflow-y: overlay;

			& button {
				max-width: 80px;
				margin: 1svmin;
			}
		}

		/* Context Menu Item 
		.membercount-menu-icon::before {
			content: '';
			-webkit-mask-image: url('data:image/svg+xml;utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${menuIconSvg}"/></svg>');
			mask-image: url('data:image/svg+xml;utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${menuIconSvg}"/></svg>');
		}*/
	`;

	const updateStyle = () => {
		DOM.removeStyle(CSSKey);
		DOM.addStyle(CSSKey, getCss());
	};

	/* Settings */
	
	const defaults = {
		/**
		 * List of server ids where the counter will not be rendered.
		 * @type {!string[]}
		 */
		blacklisted: [],
		marginSpacing: 0,
		displayType: 0,
		online: false
	};
	/**
	 * @type {!typeof defaults}
	 */
	let settings = Utils.extend({}, defaults);

	/**
	 * @typedef DiscordComponents
	 * @property {!React.FC} Switch
	 * @property {!React.FC} ThemeContext
	 * @property {!React.FC} TooltipWrapper
	 */
	/**
	 * @type {!Prettify<DiscordComponents>}
	 */
	const Discord = {
		Switch: null,
		ThemeContext: null,
		TooltipWrapper: null
	};
	[
		Discord.Switch,
		Discord.ThemeContext,
		Discord.TooltipWrapper
	] = modules;

	/**
	 * ErrorBoundary Component Definition
	 */
	const ErrorBoundary = class ErrorBoundary extends React.Component {
		state = { hasError: false };

		/**
		 * @param {!Error} error
		 */
		static getDerivedStateFromError (error) {
			const hasError = Boolean(error);
			return { hasError };
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
				/**
				 * @param {!object} props
				 */
				children: (props) => {
					return ce('div', {
						id: 'MemberCount',
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
	 * @param {!number} n
	 */
	const reducer = (n) => n + 1;
	/**
	 * Custom hook for forceUpdate functionality.
	 * @returns {!React.DispatchWithoutAction}
	 */
	const useForceUpdate = () => useReducer(reducer, 0).pop();

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
			note,
			children: label,
			value: checked,
			hideBorder: false,
			disabled: Boolean(disabled),
			onChange
		});
	});
	
	const Divider = () => ce('div', {
		className: Utils.className({
			[formClasses.divider]: typeof formClasses.divider !== 'undefined',
			[formClasses.dividerDefault]: typeof formClasses.dividerDefault !== 'undefined'
		})
	});

	// @ts-ignore
	const Radio = withThemeContext((props) => {
		// @ts-ignore
		const { label = 'Radio label', note = 'Radio note', options = [], defaultValue = 0, disabled = false, onChange = console.log } = props;

		return ce('div', {
			className: formClasses.container,
			children: [
				ce('div', {
					className: formClasses.labelRow,
					children: ce('label', {
						className: formClasses.title,
						children: label,
						style: { pointerEvents: 'none' }
					})
				}),
				ce('div', {
					className: formClasses.note,
					children: ce(Api.Components.Text, {
						color: Api.Components.Text.Colors.HEADER_SECONDARY,
						children: note
					})
				}),
				ce(Divider, {}),
				ce(Api.Components.RadioInput, {
					name: label,
					note,
					value: defaultValue,
					disabled: Boolean(disabled),
					options,
					onChange
				}),
				ce(Divider, {})
			]
		});
	});

	const updateMemberList = () => {
		const list = document.querySelector(memberListSelector);
		if (!list) return;
		const owner = ReactUtils.getOwnerInstance(list);
		if (!owner) return;
		owner.forceUpdate?.();
		owner.handleOnScroll?.();
	};

	/**
	 * @typedef GenProps
	 * @property {() => void} onChange
	 */

	/**
	 * @typedef SettingsProps
	 * @type {!Omit<React.ComponentProps<'div'>, 'onChange'> & GenProps}
	 */

	/**
	 * @typedef SettingsOpts
	 * @type {{
	 *	id: string;
	 *	type: string;
	 *	name: string;
	 *	note: string;
	 *	value?: unknown;
	 *	inline?: boolean;
	 *	options?: object[];
	 *	children?: React.ReactNode;
	 *	onChange?: (e: unknown) => void;
	 * }}
	 */

	/**
	 * @typedef SettingsBuildOpts
	 * @type {{
	 *	id: string;
	 *	name: string;
	 *	shown: boolean;
	 *	collapsible: boolean;
	 *	settings: SettingsOpts[];
	 * }}
	 */

	/**
	 * @param {!Prettify<SettingsBuildOpts>} opts
	 * @returns {!React.ReactNode}
	 */
	const buildSettings = (opts) => {
		const {
			id, 
			name,
			shown,
			collapsible,
			settings: data
		} = opts;
		return ce(Api.Components.SettingGroup, {
			id,
			name,
			shown,
			collapsible,
			settings: data ?? []
		});
	};

	const useChangelogHistory = () => {
		/**
		 * @type {!React.ReactNode[]}
		 */
		const history = [
			ce('button', {
				className: 'bd-button bd-button-filled bd-addon-button bd-button-color-brand bd-button-medium',
				onClick () {
					UI.showChangelogModal(Changelogs.ModalData);
				},
				children: [
					ce('div', {
						className: 'bd-button-content',
						children: [
							meta.version
						]
					})
				]
			})
		];

		for (const version in Changelogs.Old) {
			history.push(
				ce('button', {
					className: 'bd-button bd-button-filled bd-addon-button bd-button-color-brand bd-button-medium',
					onClick () {
						const data = Object.assign({}, Changelogs.ModalData);
						data.subtitle = `v${version}`;
						data.changes = Changelogs.Old[version];
						UI.showChangelogModal(data);
					},
					children: [
						ce('div', {
							className: 'bd-button-content',
							children: [
								version
							]
						})
					]
				})
			);
		}

		return history;
	};

	/**
	 * @param {!VoidFunction} onChange
	 * @returns {!VoidFunction}
	 */
	const useChangeCallback = (onChange) => {
		const forceUpdate = useForceUpdate();
		return () => {
			if (typeof onChange === 'function') onChange();
			forceUpdate();
		};
	};

	/**
	 * @param {!VoidFunction} onChange
	 * @returns {![React.ReactNode[], VoidFunction]}
	 */
	const useHookData = (onChange) => [
		useChangelogHistory(),
		useChangeCallback(onChange)
	];

	/**
	 * @returns {!React.RefObject<HTMLDivElement>}
	 */
	const useMemberWrap = () => {
		const ref = useRef();
		useEffect(() => {
			const node = document.querySelector(memberWrap);
			if (ref.current !== node) ref.current = node;
		}, []);
		return ref;
	};

	/**
	 * @param {![React.ReactNode[], VoidFunction]} data
	 */
	const useSettingsPanels = ([history, onChange]) => {
		const wrap = useMemberWrap();

		/**
		 * @returns {!void}
		 */
		const updateSpacing = () => void requestAnimationFrame(() => {
			wrap.current?.classList.remove('space-30', 'space-40', 'space-60');
			wrap.current?.classList.add(getSpacing(settings));
		});

		const sections = [
			{
				id: 'Logs',
				name: 'Changelogs',
				shown: false,
				collapsible: true,
				settings: [
					{
						id: 'logs',
						type: 'custom',
						name: 'History',
						note: 'View changelog history.',
						inline: false,
						children: ce('div', {
							className: 'membercount-history-container',
							children: history
						})
					}
				]
			},
			{
				id: 'Main',
				name: 'Plugin-Settings',
				shown: true,
				collapsible: true,
				settings: [
					{
						id: 'online',
						type: 'switch',
						name: 'Online Counter',
						note: 'Toggles the online members counter.',
						value: settings.online ?? false,
						/**
						 * @param {!boolean} e
						 */
						onChange (e) {
							settings.online = e;
							if (DOM_MODE) refitCounter();
							updateMemberList();
							updateSpacing();
							onChange();
						}
					},
					{
						id: 'display',
						type: 'radio',
						name: 'Display Style',
						note: 'Switch between the classic or new display styles.',
						options: options.style,
						value: settings.displayType ?? 0,
						/**
						 * @param {!number} e
						 */
						onChange (e) {
							settings.displayType = e;
							if (DOM_MODE) reconnect();
							updateMemberList();
							onChange();
						}
					},
					{
						id: 'spacing',
						type: 'radio',
						name: 'Spacing Style',
						note: 'The amount of space left under the counters.',
						options: options.margin,
						value: settings.marginSpacing ?? 0,
						/**
						 * @param {!number} e
						 */
						onChange (e) {
							settings.marginSpacing = e;
							if (DOM_MODE) refitCounter();
							updateMemberList();
							updateSpacing();
							onChange();
						}
					}
				]
			}
		];

		return sections.map(buildSettings);
	};

	/**
	 * @param {!SettingsProps} props
	 * @returns {!React.ReactNode[]}
	 */
	const Settings = ({ onChange }) => useSettingsPanels(useHookData(onChange));

	/**
	 * Root container for settings rendering.
	 */
	const settingRoot = create('div', { id: `&${meta.name}` });

	/**
	 * @typedef React19Wrapper
	 * @property {(...content: unknown[]) => void} render
	 * @property {() => void} unmount
	 */

	/**
	 * @param {!BD.DOMElement} node
	 * @returns {!Prettify<React19Wrapper>}
	 */
	const R19 = (node) => {
		let _root = createRoot(node);
		return {
			render (...content) {
				_root.render(...content);
			},
			unmount () {
				_root.unmount();
				_root = createRoot(node);
			}
		};
	};

	/**
	 * @param {!React.SVGProps<'svg'>} props
	 * @returns {!React.ReactSVGElement}
	 */
	const Person = (props) => ce('svg', {
		className: 'membercount-icon',
		xmlns: 'http://www.w3.org/2000/svg',
		width: '12',
		height: '12',
		viewBox: '0 0 20 20',
		fill: props.fill ?? 'currentColor',
		children: [
			ce('path', {
				d: 'M0 0h24v24H0z',
				fill: 'none'
			}),
			ce('path', {
				d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
			})
		]
	});

	/**
	 * @typedef RowProps
	 * @property {!string} fill
	 * @property {!number} count
	 * @property {!string} string
	 * @property {!number} displayType
	 */

	/**
	 * @param {!RowProps} props
	 * @returns {!Readonly<React.ReactNode[]>}
	 */
	const getRowChildren = (props) => props.displayType === 1
		? [
			ce(Person, { fill: props.fill ?? null }),
			String.fromCodePoint(160),
			ce('span', { className: 'membercount-count' }, props.count),
			String.fromCodePoint(160),
			ce('span', { className: 'membercount-label' }, props.string)
		]
		: [
			ce('span', { className: 'membercount-label' }, props.string),
			' — ',
			ce('span', { className: 'membercount-count' }, props.count)
		];
	/**
	 * @param {!RowProps} props
	 * @returns {!React.ReactHTMLElement<HTMLSpanElement>}
	 */
	const Row = (props) => ce('span', {
		className: 'membercount-row',
		children: getRowChildren(props)
	});

	/**
	 * @param {!number} count
	 * @returns {!(number | 'Loading')}
	 */
	const getCount = (count) => isNil(count) || Number.isNaN(count)
		? 'Loading'
		: count;

	/**
	 * @typedef CounterProps
	 * @property {!number} count
	 * @property {!number} online
	 * @property {!number} displayType
	 */

	/**
	 * @param {!(React.ComponentProps<'div'> & CounterProps)} props
	 * @returns {!React.ReactHTMLElement<HTMLDivElement>}
	 */
	const MemberCount = (props) => {
		const ref = useRef();
		const { ONLINE, MEMBERS } = useStrings();
		const { id, displayType = 0 } = props;

		const [count, online] = useStateFromStores([MemberCountStores], () => [
			MemberCountStores.getMemberCount(id),
			MemberCountStores.getOnlineCount(id)
		]);

		if (DOM_MODE) {
			return ce('h3', {
				ref: ref,
				className: Utils.className({
					[memberListClasses.membersGroup]: typeof memberListClasses.membersGroup !== 'undefined',
					[memberListClasses.container]: typeof memberListClasses.container !== 'undefined',
					[memberListClasses.text]: typeof memberListClasses.text !== 'undefined'
				}),
				children: [
					ce(Row, {
						count: getCount(count),
						string: MEMBERS,
						displayType
					}),
					settings.online && ce(Row, {
						fill: 'hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)',
						count: getCount(online),
						string: ONLINE,
						displayType
					})
				]
			});
		}

		return ce('div', {
			id: 'MemberCount',
			role: 'listitem',
			ref: ref,
			children: [
				ce('h3', {
					className: Utils.className({
						[memberListClasses.membersGroup]: typeof memberListClasses.membersGroup !== 'undefined',
						[memberListClasses.container]: typeof memberListClasses.container !== 'undefined',
						[memberListClasses.text]: typeof memberListClasses.text !== 'undefined'
					}),
					children: [
						ce(Row, {
							count: getCount(count),
							string: MEMBERS,
							displayType
						}),
						settings.online && ce(Row, {
							fill: 'hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)',
							count: getCount(online),
							string: ONLINE,
							displayType
						})
					]
				})
			]
		});
	};
	MemberCount.Wrapped = withErrorBoundary(MemberCount);

	/**
	 * Indicates whether a node was removed.
	 * @param {!NodeListOf<Node>} removed
	 * @param {!Node} root
	 * @returns {!boolean}
	 */
	const isCleared = (removed, root) => {
		if (!removed.length) return false;
		for (let i = 0; i < removed.length; i++) {
			const node = removed[i];
			if (node.contains(root)) return true;
		}
		return false;
	};

	/**
	 * Root DOM element to make use of the inherited `isConnected` property.
	 */
	const counter = create('div', { id: 'MemberCount' });
	const croot = R19(counter);

	/**
	 * DOM rendering fallbacks toggle.
	 */
	const DOM_MODE = false;

	const removeCounter = () => {
		const wrap = document.querySelector(memberWrap);
		if (wrap) {
			wrap.classList.remove('hasCounter', 'space-30', 'space-40', 'space-60');
		}
		counter.isConnected && counter.remove();
	};
	const appendCounter = () => {
		const wrap = document.querySelector(memberWrap);
		// const list = document.querySelector(memberListSelector);
		const gid = SelectedGuildStore.getGuildId();
		const space = getSpacing(settings);
		if (!wrap || counter.isConnected) return;
		if (settings.blacklisted.includes(gid)) {
			wrap.classList.remove('hasCounter', 'space-30', 'space-40', 'space-60');
			return;
		}
		wrap.prepend(counter);
		wrap.classList.add('hasCounter', space);
	};
	const refitCounter = () => {
		removeCounter();
		appendCounter();
	};
	const connect = () => {
		const id = SelectedGuildStore.getGuildId();
		// @ts-ignore
		croot.render(ce(MemberCount.Wrapped, { id, key: `${meta.name}-${id}`, displayType: settings.displayType }));
	};
	const disconnect = () => {
		croot.unmount();
	};
	const reconnect = () => {
		disconnect();
		connect();
	};

	const loadSettings = () => {
		settings = Utils.extend({}, defaults, Data.load('settings'));
		/**
		 * Ad-hoc fix for `BdApi.Utils.extend` converting array data into a plain object.
		 */
		if (settings.blacklisted instanceof Object && !Array.isArray(settings.blacklisted)) settings.blacklisted = Object.values(settings.blacklisted);
	};

	const saveSettings = () => {
		Data.save('settings', settings);
	};

	/* ContextMenu Data & Actions */

	/**
	 * @param {!string} id
	 */
	const blacklistGuild = (id) => {
		if (!id) return;
		settings.blacklisted.push(id);
		saveSettings();
		if (DOM_MODE) {
			refitCounter();
			updateStyle();
		}
		updateMemberList();
	};

	/**
	 * @param {!string} id
	 */
	const unlistGuild = (id) => {
		if (!id) return;
		settings.blacklisted = settings.blacklisted.filter((gid) => gid !== id);
		saveSettings();
		if (DOM_MODE) {
			refitCounter();
			updateStyle();
		}
		updateMemberList();
	};

	/**
	 * @param {!boolean} blacklisted
	 * @returns {!string}
	 */
	const getLabel = (blacklisted) => {
		const { INCLUDE, EXCLUDE } = useStrings();
		return blacklisted
			? INCLUDE
			: EXCLUDE;
	};

	/**
	 * @param {!string} id
	 * @param {!boolean} blacklisted
	 * @returns {!VoidFunction}
	 */
	const getAction = (id, blacklisted) => blacklisted
		? () => unlistGuild(id)
		: () => blacklistGuild(id);

	/**
	 * @returns {!React.ReactSVGElement}
	 */
	const getHintSVG = () => ce('svg', {
		className: 'membercount-hint-svg',
		xmlns: 'http://www.w3.org/2000/svg',
		width: '20',
		height: '20',
		viewBox: '0 0 24 24',
		fill: 'currentColor',
		children: [
			ce('path', { d: menuIconSvg })
		]
	});

	/**
	 * @param {!string} id
	 */
	const parseId = (id) => {
		const blacklisted = settings.blacklisted.includes(id);
		return {
			id: 'membercount-toggle',
			hint: getHintSVG(),
			label: getLabel(blacklisted),
			action: getAction(id, blacklisted)
		};
	};

	/* Patches */

	const Patches = class Patches {
		/**
		 * Cache for patches not stored by BdApi's `Patcher` module, e.g. the patches created via BdApi's `ContextMenu` module.
		 * @type {!VoidFunction[]}
		 */
		static #cache = [];
		/**
		 * @type {!BD.Patches<typeof Patches>}
		 */
		static #patches = {
			MemberList (state) {
				if (DOM_MODE || state.cancelled) return;
				if (!ListThin) return;
				/**
				 * Duplicate protection predicate function.
				 * @param {{ key?: string }} item
				 * @returns {!boolean}
				 */
				const fn = (item) => item?.key?.startsWith(meta.name);
				/**
				 * @param {!object} that
				 * @param {!unknown[]} args
				 * @param {!any} value
				 */
				const onMemberList = (that, args, value) => {
					const [data] = args;
					if (!data['data-list-id'] || !data['data-list-id'].startsWith('members-')) return value;
					const ret = Array.isArray(value)
						? value
						: Array.of(value);
					const id = SelectedGuildStore.getGuildId();
					const wrap = document.querySelector(memberWrap);
					if (!wrap) return ret;
					if (settings.blacklisted.includes(id)) {
						wrap.classList.remove('hasCounter', 'space-30', 'space-40', 'space-60');
						return ret;
					}
					const counter = ce(MemberCount.Wrapped, {
						id,
						key: `${meta.name}-${id}`,
						displayType: settings.displayType
					});
					if (ret.some(fn)) return ret;
					ret.unshift(counter);
					if (!wrap.classList.contains('hasCounter')) {
						wrap.classList.add('hasCounter', getSpacing(settings));
					}
					return ret;
				};
				Patcher.after(ListThin, 'render', onMemberList);
				updateMemberList();
			},
			ContextMenu (state) {
				if (state.cancelled) return;
				/**
				 * Duplicate protection predicate function.
				 * @param {{ key?: string }} item
				 * @returns {!boolean}
				 */
				const fn = (item) => item?.key?.startsWith(meta.name);
				/**
				 * Context menu helper function.
				 * - Lazily checks that the context menu is rendering only the `Hide Muted Channels` option.
				 * - Appending our item behind that leaves us as the last item in the context menu.
				 * @param {!React.ReactNode[]} children
				 * @returns {!boolean}
				 */
				const isLastItem = (children) => {
					return children.length === 2;
				};
				/**
				 * @param {!React.ReactElement} fiber
				 * @param {!{ guild: { id: string; } }} props
				 */
				const onContextMenu = (fiber, props) => {
					const { navId } = fiber.props;
					const { guild } = props;
					if (navId !== 'guild-context' || !guild) return fiber;
					const data = parseId(guild.id);
					const group = ce(ContextMenu.Group, {
						key: `${meta.name}-MenuGroup`,
						children: [
							ce(ContextMenu.Item, { className: 'membercount-menu-icon', ...data }),
							!isLastItem(fiber.props.children) && ce(ContextMenu.Separator, {})
						]
					});
					if (!Array.isArray(fiber.props.children)) fiber.props.children = [fiber.props.children];
					if (!fiber.props.children.some(fn)) fiber.props.children.splice(1, 0, group);
					return fiber;
				};
				/**
				 * @type {!VoidFunction}
				 */
				const patch = ContextMenu.patch('guild-context', onContextMenu);
				this.#cache.push(patch);
			}
		};
		static apply () {
			for (const target in this.#patches) {
				this.#patches[target].call(this, promises.state);
			}
		}
		static clear () {
			Patcher.unpatchAll();
			while (this.#cache.length > 0) {
				const cancel = this.#cache.pop();
				cancel();
			}
			updateMemberList();
		}
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
	 * @type {Readonly<-1 | 0 | 1>}
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
			const local = Object.freeze(Data.load(Versions.key));
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
				type: Changelogs.Types.Improved.TYPE,
				title: Changelogs.Types.Improved.TITLE,
				items: [
					'Default styling now accounts for Discord\'s gradient themes.'
				]
			}
		];

		/**
		 * @type {!Record<string, Prettify<BD.Changes>[]>}
		 */
		static Old = {
			'3.0.10': [
				{
					type: Changelogs.Types.Improved.TYPE,
					title: Changelogs.Types.Improved.TITLE,
					items: [
						'Refactored settings code.'
					]
				},
				{
					type: Changelogs.Types.Fixed.TYPE,
					title: Changelogs.Types.Fixed.TITLE,
					items: [
						'Fixed the settings-to-ui sync for spacing style related settings, e.g. online counter and spacing style. It now correctly updates the spacing upon changing the setting.'
					]
				}
			],
			'3.0.9': [
				{
					type: Changelogs.Types.Improved.TYPE,
					title: Changelogs.Types.Improved.TITLE,
					items: [
						'Refactored how the plugin stores and displays changelog history.'
					]
				}
			],
			'3.0.8': [
				{
					type: Changelogs.Types.Added.TYPE,
					title: Changelogs.Types.Added.TITLE,
					items: [
						'Changelog history - previous changelogs starting from version `3.0.7` may be viewed from the settings panel.'
					]
				},
				{
					type: Changelogs.Types.Progress.TYPE,
					title: Changelogs.Types.Progress.TITLE,
					items: [
						'Moved individual module queries into a single `getBulk` query.',
						'Rendering is back to patching the memberlist instead of using `DOM_MODE` rendering.'
					]
				}
			],
			'3.0.7': [
				{
					type: Changelogs.Types.Fixed.TYPE,
					title: Changelogs.Types.Fixed.TITLE,
					items: [
						'React version `19.0.0` update.'
					]
				}
			]
		};

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
			DOM.addStyle(CSSKey, getCss());
			if (DOM_MODE) {
				appendCounter();
				connect();
			}
			Patches.apply();
			Changelogs.show();
		},
		stop () {
			promises.cancel();
			Patches.clear();
			if (DOM_MODE) {
				removeCounter();
				disconnect();
			}
			DOM.removeStyle(CSSKey);
		},
		/**
		 * @type {!BD.Plugin['getSettingsPanel']}
		 */
		getSettingsPanel () {
			return ce(Settings, {
				onChange: () => {
					saveSettings();
					if (DOM_MODE) {
						reconnect();
					}
				}
			});
		},
		/**
		 * Global observer provided by BD.
		 * @param {!MutationRecord} change
		 */
		observer (change) {
			if (DOM_MODE) {
				if (!counter.isConnected) {
					reconnect();
					appendCounter();
				}
			}
		}
	});

	/* Finalize */

	applyBinds(plugin);
	return plugin;
};

/*@end@*/
