/**
 * @name MemberCount
 * @author Arashiryuu
 * @version 1.0.0
 * @description Displays a server's member-count at the top of the member-list, can be styled with the #MemberCount selector.
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
 * @param {!BD.MetaData} meta
 * @returns {!BD.Plugin}
 */
module.exports = (meta) => {
	// @ts-ignore
	const Api = new BdApi(meta.name);
	const { UI, Data, React, Utils, Themes, Plugins, Patcher, Webpack, ReactDOM, ReactUtils, ContextMenu } = Api;
	const { createElement: ce, useRef, useMemo, useState, useEffect, useReducer, useCallback, useLayoutEffect } = React;
	const { render, findDOMNode, unmountComponentAtNode: unmount } = ReactDOM;
	const { getModule, getWithKey, waitForModule } = Webpack;
	const DOM = new Api.DOM.constructor(`${meta.name}-stylesheet`);

	const Filters = Object.create(Webpack.Filters);
	Object.assign(Filters, {
		byId: (id = '1') => (...m) => m.pop() === String(id),
		byName: (name = '') => Filters.byDisplayName(name),
		byStore: (name = '') => (m) => m?._dispatchToken && m?.getName() === name,
		byProtos: Filters.byPrototypeFields
	});

	const Flux = Webpack.getByKeys('connectStores');
	const GuildPopoutActions = Webpack.getByKeys('fetchGuildForPopout');
	const GuildPopoutStore = Webpack.getStore('GuildPopoutStore');
	const MemberCountStores = Webpack.getStore('GuildMemberCountStore');
	const SelectedGuildStore = Webpack.getStore('SelectedGuildStore');
	const LangUtils = getModule((m) => Array.isArray(m?._events?.locale));

	const { ComponentDispatcher } = Webpack.getByKeys('ComponentDispatch');
	const { useStateFromStores } = Webpack.getByKeys('useStateFromStores');
	const { inspect } = Webpack.getByKeys('inspect', 'promisify');

	const formClasses = Webpack.getByKeys('dividerDefault');
	const CDispatch = new ComponentDispatcher();

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

	const strings = {
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
	};

	/**
	 * @returns {!BD.i18nStrings<typeof strings['en']>}
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
	 * @type {!BD.PromiseStateManager}
	 */
	const promises = {
		state: { cancelled: false },
		cancel () { this.state.cancelled = true; },
		restore () { this.state.cancelled = false; }
	};
	applyBinds(promises);

	/**
	 * Creates clean objects with a `Symbol.toStringTag` value describing the object.
	 * @param {!(string | symbol)} value
	 * @returns {!object}
	 */
	const _Object = (value = 'NullObject') => Object.create(null, {
		[Symbol.toStringTag]: {
			enumerable: false,
			value
		}
	});

	/**
	 * Determines if something is null or undefined.
	 * @param {*} anything
	 * @returns {!boolean}
	 */
	const isNil = (anything) => anything === null || anything === undefined;

	/**
	 * @type {!BD.Logger}
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
		for (const level of ['log', 'info', 'warn', 'debug', 'error']) {
			Logger[level] = function () {
				console.groupCollapsed(...useParts(meta.name));
				console[level].apply(null, arguments);
				console.groupEnd();
			};
		}
		Logger.ins = function ins () {
			const output = Array.from(arguments, (arg) => inspect(arg, { colors: true }));
			console.groupCollapsed(...useParts(meta.name));
			for (const out of output) console.log(out);
			console.groupEnd();
		};
		Logger.dir = function dir () {
			console.groupCollapsed(...useParts(meta.name));
			for (const out of [...arguments]) console.dir(out);
			console.groupEnd();
		};
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
	const normalizeEventName = (key) => key === 'doubleclick'
		? 'dblclick'
		: key;

	/**
	 * @param {!string} key
	 * @returns {!string}
	 */
	const normalizeDataAttr = (key) => key.replace(/([A-Z]{1})/g, '-$1').toLowerCase();

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
						const event = normalizeEventName(key.slice(2).toLowerCase());
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
	 * @param {!(string | Node)[]} [children] 
	 * @returns {!DocumentFragment}
	 */
	const fragment = (children = []) => {
		const frag = new DocumentFragment();
		if (children.length) frag.append(...children);
		return frag;
	};

	/**
	 * @type {!BD.Plugin}
	 */
	const plugin = _Object(meta.name);

	/* Setup */

	/**
	 * Converts a classname string into a class selector.
	 * @param {!string} className
	 * @returns {!string}
	 */
	const toSelector = (className) => `.${className.split(' ').join('.')}`;

	const memberListClasses = {
		...Webpack.getByKeys('members', 'container'),
		...getModule((m) => Filters.byProps('container')(m) && m.container.endsWith('98d'))//getByKeys('container', { first: false }).find((m) => m.container.endsWith('98d'))
	};
	/**
	 * Current selectors for the member-list.
	 */
	const memberListSelector = toSelector(memberListClasses.members);
	const memberWrap = toSelector(memberListClasses.membersWrap);

	/**
	 * Converts a template literal interpolated string from a human-readable format into a one-liner for use in stylesheets.
	 * @param {!TemplateStringsArray} ss
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
	const css = (ss, ...vars) => {
		let string = '';
		for (let i = 0, len = ss.length; i < len; i++) string += `${ss[i]}${vars[i] ?? ''}`;
		return string.split(/\s+/g).join(' ').trim();
	};

	/**
	 * @param {{ marginSpacing: number, online: boolean }} props
	 * @returns {!string}
	 */
	const getSpacing = ({ marginSpacing, online }) => {
		let min = 40;
		let max = 60;
		
		if (marginSpacing === 0) {
			min = 30;
			max = 40;
		}

		return !online
			? `${min}px`
			: `${max}px`;
	};

	const getCss = () => css`
		.theme-light #MemberCount {
			--_hsla: 0, 0%, 0%, 0.04;
		}

		#MemberCount {
			--_hsla: 0, 0%, 100%, 0.04;
			display: flex;
			background: var(--background-secondary);
			position: absolute;
			color: var(--channels-default, var(--text-secondary, --text-primary));
			width: 240px;
			padding: 0;
			z-index: 1;
			top: 0;
			margin-top: 0;
			border-bottom: 1px solid hsla(var(--_hsla));
		}

		#MemberCount h3 {
			display: flex;
			padding: 12px 8px;
			height: auto;
			flex-direction: column;
		}

		#MemberCount .membercount-row {
			display: flex;
			justify-content: center;
		}

		#MemberCount .membercount-icon {
			margin-top: 1px;
			margin-right: 1px;
		}

		${memberWrap}.hasCounter ${memberListSelector} {
			margin-top: ${getSpacing(settings)};
		}

		${memberWrap}.hasCounter_thread #MemberCount {
			position: sticky;
		}

		${memberWrap}.hasCounter_thread ${memberListSelector} {
			margin-top: 0;
		}

		/* Error Component */
		#MemberCount.${meta.name}-error {
			display: flex;
			justify-content: center;
			padding: 12px 0;
			height: auto;
			color: red;
			font-size: 18px;
			font-weight: 600;
			text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black,
						 0 0 1px black, 0 0 2px black, 0 0 3px black,
						 0 0 1px black, 0 0 2px black, 0 0 3px black;
		}
	`;

	const updateStyle = () => {
		DOM.removeStyle();
		DOM.addStyle(getCss());
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
	 * Discord Components
	 */
	const BulkModule = getModule((m) => m?.Tooltip && m?.Text);
	const Discord = {
		Switch: BulkModule.FormSwitch,
		TooltipWrapper: BulkModule.Tooltip,
		ThemeContext: BulkModule.ThemeContextProvider
	};

	/**
	 * Custom hook for forceUpdate functionality.
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
			onChange
		});
	});

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
						style: {
							pointerEvents: 'none'
						}
					})
				}),
				ce('div', {
					className: formClasses.note,
					children: ce(BulkModule.FormText, {
						type: BulkModule.FormTextTypes.DESCRIPTION,
						children: note
					})
				}),
				ce(BulkModule.RadioGroup, {
					className: formClasses.dividerDefault,
					noteOnTop: true,
					options: options,
					value: defaultValue,
					disabled: Boolean(disabled),
					onChange: (e) => {
						onChange(e.value);
						CDispatch.dispatch('SETTINGS_UPDATE');
					}
				}),
				ce(BulkModule.FormDivider, {
					className: formClasses.dividerDefault
				})
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
	 * @param {!React.ComponentProps<'div'>} props
	 * @returns {!React.ReactHTMLElement<'div'>}
	 */
	const Settings = (props) => {
		const forceUpdate = useForceUpdate();
		const onChange = useCallback((e) => {
			if (typeof props.onChange === 'function') props.onChange(e);
			forceUpdate();
		}, []);

		useEffect(() => {
			CDispatch.subscribe('SETTINGS_UPDATE', onChange);
			return () => CDispatch.unsubscribe('SETTINGS_UPDATE', onChange);
		}, []);
		
		return ce('div', {
			key: 'Plugin-Settings',
			className: 'plugin-settings',
			children: [
				ce(Switch, {
					label: 'Online Counter',
					note: 'Toggles the online members counter.',
					checked: settings.online ?? false,
					onChange: (e) => {
						settings.online = e;
						updateStyle();
						updateMemberList();
					}
				}),
				ce(Radio, {
					label: 'Display Style',
					note: 'Switch between the classic or newer display style.',
					options: options.style,
					defaultValue: settings.displayType ?? 0,
					onChange: (e) => {
						settings.displayType = e;
						updateMemberList();
					}
				}),
				ce(Radio, {
					label: 'Spacing Style',
					note: 'The amount of space left under the counters.',
					options: options.margin,
					defaultValue: settings.marginSpacing ?? 0,
					onChange: (e) => {
						settings.marginSpacing = e;
						updateStyle();
						updateMemberList();
					}
				})
			],
			onChange
		});
	};

	/**
	 * Root container for settings rendering.
	 */
	const settingRoot = create('div', { id: `__${meta.name}-react-settings-root__` });

	/**
	 * @param {!React.SVGProps<'svg'>} props
	 * @returns {!React.ReactSVGElement}
	 */
	const Person = (props) => ce('svg', {
		className: 'membercount-icon',
		xmlns: 'http://www.w3.org/2000/svg',
		width: '12px',
		height: '12px',
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
	 * @param {{ fill: string, count: number, string: string, displayType: number }} props
	 * @returns {!React.ReactChildren[]}
	 */
	const getRowChildren = (props) => props.displayType === 1
		? [
			ce(Person, { fill: props.fill ?? null }),
			String.fromCodePoint(160),
			props.count,
			String.fromCodePoint(160),
			props.string
		]
		: [
			props.string,
			' — ',
			props.count
		];
	/**
	 * @returns {!React.ReactHTMLElement<'span'>}
	 */
	const Row = (props) => ce('span', {
		className: 'membercount-row',
		children: getRowChildren(props)
	});

	/**
	 * @param {!number} count
	 * @returns {!(string | number | 'Loading')}
	 */
	const getCount = (count) => count || 'Loading';

	/**
	 * @param {!(React.ComponentProps<'div'> & { count: number, online: number, displayType: number })} props
	 * @returns {!React.ReactHTMLElement<'div'>}
	 */
	const MemberCount = (props) => {
		const ref = useRef();
		const strings = useStrings();
		const { id, count, online, displayType } = props;

		useEffect(() => {
			if (!online && !GuildPopoutStore.isFetchingGuild(id)) {
				GuildPopoutActions.fetchGuildForPopout(id);
			}
		}, [online]);

		return ce('div', {
			id: 'MemberCount',
			role: 'listitem',
			ref: ref,
			children: [
				ce('h3', {
					className: Utils.className({
						[memberListClasses.membersGroup]: true,
						[memberListClasses.container]: true
					}),
					children: [
						ce(Row, {
							count: getCount(count),
							string: strings.MEMBERS,
							displayType
						}),
						settings.online && ce(Row, {
							fill: 'hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)',
							count: getCount(online),
							string: strings.ONLINE,
							displayType
						})
					]
				})
			]
		});
	};

	const Counter = Flux.connectStores([MemberCountStores, GuildPopoutStore], () => ({
		count: MemberCountStores.getMemberCount(SelectedGuildStore.getGuildId()),
		/**
		 * We can tally all the non-invisible accounts on a server via `MemberCountStores.getOnlineCount(SelectedGuildStore.getGuildId())`.
		 * However, we want to include invisibles.
		 */
		online: GuildPopoutStore.getGuild(SelectedGuildStore.getGuildId())?.presenceCount
	}))(MemberCount);
	Counter.Wrapped = withErrorBoundary(Counter);

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

	const loadSettings = () => {
		settings = Utils.extend({}, defaults, Data.load('settings'));
		// Ad-hoc fix for `BdApi.Utils.extend` converting array data into a plain object.
		if (typeof settings.blacklisted === 'object' && !Array.isArray(settings.blacklisted)) settings.blacklisted = Object.keys(settings.blacklisted);
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
		updateMemberList();
	};

	/**
	 * @param {!string} id
	 */
	const unlistGuild = (id) => {
		if (!id) return;
		settings.blacklisted = settings.blacklisted.filter((gid) => gid !== id);
		saveSettings();
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
		xmlns: 'http://www.w3.org/2000/svg',
		width: '24px',
		height: '24px',
		viewBox: '0 0 300 300',
		fill: 'currentColor',
		style: {
			position: 'relative',
			top: '-1px'
		},
		children: [
			ce('path', {
				d: css`M89.452,123.229c5.185-6.581,8.109-14.79,8.109-23.34c0-20.808-16.932-37.735-37.74-37.735S22.08,79.082,22.08,99.889
				c0,8.688,3.006,17.009,8.331,23.627C11.887,136.099,0,159.854,0,185.836c0,3.957,3.213,7.168,7.169,7.168h105.938
				c3.958,0,7.168-3.211,7.168-7.168C120.275,159.602,108.218,135.726,89.452,123.229z M14.692,178.667
				c2.166-21.436,13.917-39.843,30.6-47.059c2.389-1.036,4.03-3.278,4.287-5.869c0.259-2.597-0.913-5.12-3.052-6.606
				c-6.338-4.387-10.118-11.584-10.118-19.25c0-12.905,10.501-23.398,23.403-23.398c12.905,0,23.403,10.494,23.403,23.398
				c0,7.575-3.712,14.72-9.931,19.112c-2.126,1.5-3.272,4.042-2.992,6.632c0.282,2.585,1.941,4.823,4.345,5.831
				c16.874,7.113,28.766,25.585,30.936,47.208H14.692z`
			}),
			ce('path', {
				d: css`M176.705,102.872c-2.801-2.8-7.337-2.8-10.137,0l-14.57,14.566l-14.562-14.566c-2.801-2.8-7.339-2.8-10.14,0
				c-2.8,2.8-2.8,7.337,0,10.137l14.563,14.566l-14.563,14.563c-2.8,2.8-2.8,7.337,0,10.137c1.4,1.4,3.234,2.101,5.071,2.101
				c1.834,0,3.668-0.7,5.068-2.101l14.57-14.562l14.562,14.562c1.4,1.4,3.238,2.101,5.073,2.101c1.834,0,3.673-0.7,5.073-2.101
				c2.8-2.8,2.8-7.337,0-10.137l-14.571-14.563l14.571-14.566C179.505,110.208,179.505,105.672,176.705,102.872z`
			}),
			ce('path', {
				d: css`M228.01,119.603c-3.593,0-6.646,0.467-9.143,1.396c-1.498,0.565-3.574,1.715-6.249,3.461l3.15-19.231h35.927V90.546
				h-48.402l-6.174,48.596l15.499,0.728c1.372-2.627,3.412-4.429,6.109-5.399c1.54-0.527,3.351-0.789,5.456-0.789
				c4.438,0,7.705,1.55,9.805,4.64c2.096,3.099,3.146,6.889,3.146,11.378c0,4.574-1.12,8.363-3.36,11.379
				c-2.24,3.015-5.498,4.518-9.773,4.518c-3.715,0-6.534-1.018-8.476-3.062c-1.932-2.045-3.248-4.947-3.93-8.709h-17.23
				c0.606,8.251,3.594,14.617,8.971,19.116c5.376,4.485,12.246,6.729,20.609,6.729c10.384,0,18.183-3.196,23.4-9.586
				c5.209-6.389,7.812-13.646,7.812-21.786c0-9.343-2.702-16.456-8.115-21.354C241.624,122.044,235.286,119.603,228.01,119.603z`
			})
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
		 * @type {!Readonly<Record<string, BD.PatchFunction>>}
		 */
		static #patches = {
			MemberList (state) {
				if (!BulkModule.ListThin || state.cancelled) return;
				const isThread = (props) => {
					return !props['data-list-id'] && props.className.startsWith('members');
				};
				const fn = (fiber) => fiber?.key?.startsWith(meta.name);
				Patcher.after(BulkModule.ListThin, 'render', (that, args, value) => {
					const val = Array.isArray(value)
						? value.find((item) => item && !item.key)
						: value;
					const props = getProp(val, 'props');
					const type = props?.['data-list-id']?.split('-')[0] ?? props.className.split('_')[0];
					if (!props || type !== 'members') return value;
	
					const id = SelectedGuildStore.getGuildId();
					const list = document.querySelector(memberWrap);
					if (settings.blacklisted.includes(id)) {
						if (list) list.classList.remove('hasCounter', 'hasCounter_thread');
						return value;
					}
					
					if (!Array.isArray(value)) value = [value];
					if (value.some(fn)) return value;
	
					const element = ce(Counter.Wrapped, {
						id,
						key: `${meta.name}-${id}`,
						displayType: settings.displayType
					});
	
					if (isThread(props)) {
						const mlist = getProp(props, 'children.0.props.children.props');
						if (!mlist || !mlist.children) return value;
	
						if (!Array.isArray(mlist.children)) mlist.children = [mlist.children];
						if (!mlist.children.some(fn)) {
							if (list && !list.classList.contains('hasCounter_thread')) list.classList.add('hasCounter_thread');
							mlist.children.unshift(element);
						}
	
						return value;
					}
	
					if (list && !list.classList.contains('hasCounter')) list.classList.add('hasCounter');
					value.unshift(element);
					return value;
				});
				updateMemberList();
			},
			ContextMenu (state) {
				if (state.cancelled) return;
				const fn = (item) => item?.key?.startsWith(meta.name);
				const patch = ContextMenu.patch('guild-context', (fiber, props) => {
					const { navId } = fiber.props;
					const { guild } = props;
					if (navId !== 'guild-context') return fiber;
					const data = parseId(guild.id);
					const group = ce(BulkModule.MenuGroup, {
						key: `${meta.name}-MenuGroup`,
						children: [
							ce(BulkModule.MenuItem, data),
							ce(BulkModule.MenuSeparator, {})
						]
					});
					if (!Array.isArray(fiber.props.children)) fiber.props.children = [fiber.props.children];
					if (!fiber.props.children.some(fn)) fiber.props.children.splice(1, 0, group);
					return fiber;
				});
				// @ts-ignore
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

	/* Build */

	Object.assign(plugin, {
		start () {
			promises.restore();
			loadSettings();
			DOM.addStyle(getCss());
			Patches.apply();
		},
		stop () {
			promises.cancel();
			Patches.clear();
			DOM.removeStyle();
		},
		getSettingsPanel () {
			const panel = ce(Settings, {
				onChange: saveSettings
			});
			render(panel, settingRoot);
			return settingRoot;
		},
		/**
		 * Global observer provided by BD.
		 * @param {!MutationRecord} change
		 */
		observer (change) {
			if (isCleared(change.removedNodes, settingRoot)) unmount(settingRoot);
		}
	});

	/* Finalize */

	applyBinds(plugin);
	return plugin;
};

/*@end@*/
