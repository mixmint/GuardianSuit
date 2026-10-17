/**
 * @version 3.0.0
 * @package GuardianSuit - Multilanguage Captive Portal Template for OPNsense
 * @author Mirosław Majka (mix@proask.pl)
 * @copyright (C) 2025 Mirosław Majka <mix@proask.pl>
 * @license GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */

let settings = {},
    layout = {},
    langText = {},
    lang,
    localId,
    langsRTL = ['ar','he','fa','ur','dv','sy','ku','ps','yi'],
    _root = document.querySelector(':root'),
    attempt = 0,
    preparedMenu = '',
    preparedMenuConfig = {},
    langsFlags = {
        aa: "er", af: "za", ak: "gh", am: "et", ar: "sa", ay: "bo", az: "az", be: "by", bg: "bg", bm: "bf", bn: "bd",
        bo: "bo", bs: "ba", ca: "es-ct", cs: "cz", cy: "gb", da: "dk", de: "de", dv: "mv", dz: "bt", el: "gr", en: "gb",
        es: "es", et: "ee", eu: "es", fa: "ir", fi: "fi", fr: "fr", ga: "ie", gl: "es", gn: "py", gu: "in", ha: "ng",
        he: "il", hi: "in", hr: "hr", ht: "ht", hu: "hu", hy: "am", id: "id", is: "is", it: "it", ja: "jp", ka: "ge",
        kk: "kz", km: "kh", kmr: "tr", kn: "in", ko: "kr", ku: "iq", ky: "kg", la: "va", lb: "lu", lo: "la", lt: "lt",
        lv: "lv", me: "me", mg: "mg", mi: "nz", mk: "mk", ml: "in", mn: "mn", mr: "in", ms: "my", mt: "mt", my: "mm",
        nb: "no", nd: "zw", ne: "np", nl: "nl", nn: "no", no: "no", pa: "in", pl: "pl", ps: "af", pt: "pt", qu: "pe",
        rn: "bi", ro: "ro", ru: "ru", rw: "rw", si: "lk", sk: "sk", sl: "si", sm: "ws", sn: "zw", so: "so", sq: "al",
        sr: "rs", ss: "sz", st: "ls", sv: "se", sw: "ke", sy: "sy", ta: "in", te: "in", tg: "tj", th: "th", ti: "er",
        tl: "ph", tn: "bw", to: "to", tr: "tr", uk: "ua", ur: "pk", uz: "uz", vi: "vn", xh: "za", yi: "il", zh: "cn",
        zu: "za"
    },
    langISOMap = {
        aa: "aa-ER", af: "af-ZA", ak: "ak-GH", am: "am-ET", ar: "ar-SA", ay: "ay-BO", az: "az-AZ", be: "be-BY", bg: "bg-BG", bm: "bm-BF", bn: "bn-BD",
        bo: "bo-BO", bs: "bs-BA", ca: "ca-ES", cs: "cs-CZ", cy: "cy-GB", da: "da-DK", de: "de-DE", dv: "dv-MV", dz: "dz-BT", el: "el-GR", en: "en-GB",
        es: "es-ES", et: "et-EE", eu: "eu-ES", fa: "fa-IR", fi: "fi-FI", fr: "fr-FR", ga: "ga-IE", gl: "gl-ES", gn: "gn-PY", gu: "gu-IN", ha: "ha-NG",
        he: "he-IL", hi: "hi-IN", hr: "hr-HR", ht: "ht-HT", hu: "hu-HU", hy: "hy-AM", id: "id-ID", is: "is-IS", it: "it-IT", ja: "ja-JP", ka: "ka-GE",
        kk: "kk-KZ", km: "km-KH", kmr: "ku-TR", kn: "kn-IN", ko: "ko-KR", ku: "ku-TR", ky: "ky-KG", la: "la-VA", lb: "lb-LU", lo: "lo-LA", lt: "lt-LT",
        lv: "lv-LV", me: "sr-ME", mg: "mg-MG", mi: "mi-NZ", mk: "mk-MK", ml: "ml-IN", mn: "mn-MN", mr: "mr-IN", ms: "ms-MY", mt: "mt-MT", my: "my-MM",
        nb: "nb-NO", nd: "nd-ZW", ne: "ne-NP", nl: "nl-NL", nn: "nb-NO", no: "nb-NO", pa: "pa-IN", pl: "pl-PL", ps: "ps-AF", pt: "pt-PT", qu: "qu-PE",
        rn: "rn-BI", ro: "ro-RO", ru: "ru-RU", rw: "rw-RW", si: "si-LK", sk: "sk-SK", sl: "sl-SI", sm: "sm-WS", sn: "sn-ZW", so: "so-SO", sq: "sq-AL",
        sr: "sr-RS", ss: "ss-SZ", st: "st-LS", sv: "sv-SE", sw: "sw-KE", sy: "ar-SY", ta: "ta-IN", te: "te-IN", tg: "tg-TJ", th: "th-TH", ti: "ti-ER",
        tl: "tl-PH", tn: "tn-BW", to: "to-TO", tr: "tr-TR", uk: "uk-UA", ur: "ur-PK", uz: "uz-UZ", vi: "vi-VN", xh: "xh-ZA", yi: "he-IL", zh: "zh-CN",
        zu: "zu-ZA"
    };
    qrScannerActive = false,
    qrScannerResolve = null;

const shortcutMap = {
    u: "#inputUsername",
    p: "#inputPassword",
    a: "#login-rules",
    r: "#rules",
    i: "#signin, #signin_anon",
    o: "#logoff",
    l: ".trigger, a.current",
    h: "#launchTour",
    q: "#qrcode",
    m: "#menuTrigger"
};

const allowedAttrs = ['aria-label', 'title'];
const hour12Countries = ['us','ca','ph','au','nz','mx','co','pk','in','ie','my','sg','bd','jm','gb','gh'];

var loadedScripts = new Set();
var loadedStyles = new Set();

const isAllowedAttr = (attr) => allowedAttrs.includes(attr.toLowerCase()) || attr.toLowerCase().startsWith('data-');

const loadJson = (path, file) => {
    return $.ajax({ url: `${path}/${file}.json`, dataType: 'json' });
}

const waitForObject = async (element, maxWait = 2000) => {
    const startTime = Date.now();
    while (Object.keys(element).length === 0) {
        if (Date.now() - startTime > maxWait) {
            console.error('Timeout waiting for \'element\' object to load');
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return true;
};

const formatISO = (timeStamp = Date.now()) => {
    return new Date(timeStamp - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0,-5).split('T');
}

const updateUIWithLangText = (texts) => {
    Object.entries(texts).forEach(([key, value]) => {
        if (key.startsWith('attr_')) {
            const targetId = key.replace('attr_', '');
            if (typeof value === 'object') {
                Object.entries(value).forEach(([attrName, attrValue]) => {
                    if (isAllowedAttr(attrName)) {
                        $(`#${targetId}`).attr(attrName, attrValue);
                    }
                });
            }
        } else if (settings.layout.enable_menu && key.includes('menu') && typeof value === 'object') {
            preparedMenu = buildOffcanvasMenu(value, texts);
        } else if (typeof value === 'object' && !key.includes('menu')) {
            const content = Object.entries(value)
            .map(([k, v]) => `<div class="${k}">${v}</div>`)
            .join('');
            $(`#${key}`).html(content);
        } else if (key.includes('pagetitle')) {
            $('title').text(value);
        } else if (key.includes('_placeholder')) {
            $(`#${key.replace('_placeholder', '')}`).attr('placeholder', value);
        } else {
            $(`#${key}`).text(value);
        }
    });
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

const showModal = ({ title, subtitle, content, iconText = '&#9888;', customStyles = {}, callback, onOpen, onClose }) => {
    const offcanvas = document.querySelector('.offcanvas');
    const defaultStyles = {
        padding: 20,
        headerColor: settings.modal.show_rules_header_color,
        iconColor: settings.modal.icon_color,
        background: settings.modal.bg_color,
        overlayColor: settings.modal.overlay_color,
        borderBottom: false,
        zindex: settings.modal.zindex,
        timeout: false,
        timeoutProgressbar: false,
        iframe: false,
        iframeHeight: 800,
        iframeURL: '',
        pauseOnHover: false,
        closeButton: true,
        closeOnEscape: true,
        overlayClose: true
    };

    const styles = { ...defaultStyles, ...customStyles };

    if (settings.layout.a11y && settings.layout.a11y_contrast) {
        Object.entries(styles).forEach(([key, value]) => {
            styles[key] = $.adjustContrast(value, {
                factor: settings.layout.a11y_factor,
                threshold: settings.layout.a11y_threshold
            });
        });
    }

    $('#MSG').cpModal({
        title,
        subtitle,
        headerColor: styles.headerColor,
        iconColor: styles.iconColor,
        background: styles.background,
        iconText: iconText,
        padding: styles.padding,
        width: styles.width,
        top: styles.top,
        rtl: document.documentElement.dir === 'rtl',
        borderBottom: styles.borderBottom,
        zindex: styles.zindex,
        timeout: styles.timeout,
        timeoutProgressbar: styles.timeoutProgressbar,
        pauseOnHover: styles.pauseOnHover,
        overlayColor: styles.overlayColor,
        closeButton: styles.closeButton,
        closeOnEscape: styles.closeOnEscape,
        overlayClose: styles.overlayClose,
        onOpening: () => {
            if (onOpen) {
                onOpen();
            }
        },
        onClosed: () => {
            $('#MSG').replaceWith('<div id="MSG"></div>');
            if (onClose) {
                onClose();
            }
        },
        afterRender: () => {
            $('#MSG .cpModal-content').append(content);
        }
    });

    $('#MSG').cpModal('open');
};

const forceLocalesData = () => {
    if (!settings.layout?.force_locales_data || !navigator?.language) {
        return;
    }

    const navLang = navigator.language.replace('_', '-');
    const parts = navLang.split('-');

    if (parts.length !== 2) {
        return;
    }

    const lang = parts[0].toLowerCase();
    const region = parts[1].toUpperCase();

    if (langsFlags.hasOwnProperty(lang)) {
        langsFlags[lang] = region.toLowerCase();
    }

    if (langISOMap.hasOwnProperty(lang)) {
        langISOMap[lang] = `${lang}-${region}`;
    }
};

const buildOffcanvasMenu = (menuConfig, langText) => {
    preparedMenuConfig = menuConfig;

    let html = '';

    Object.entries(menuConfig).forEach(([key, group]) => {
        if (!key.startsWith('group') || !Array.isArray(group.items) || !group.items.length) {
            return;
        }

        const itemsHtml = group.items
            .filter(ref => ref.startsWith('item'))
            .map(ref => {
                const item = menuConfig[ref];
                return item ? createMenuItemHTML(ref, item) : '';
            })
            .join('');

        if (!itemsHtml) {
            return;
        }

        html += `
            <div class="menu-group ${key}">
                <h6 class="menu-group-title">${group.title || ''}</h6>
                <ul class="nav flex-column">
                    ${itemsHtml}
                </ul>
            </div>
        `;
    });

    const looseItems = Object.entries(menuConfig)
        .filter(([key, item]) => key.startsWith('item') && !item.items && !Object.values(menuConfig).some(g => g.items?.includes(key)))
        .map(([key, item]) => createMenuItemHTML(key, item))
        .join('');

    if (looseItems) {
        html += `<ul class="nav flex-column">${looseItems}</ul>`;
    }

    return html;
};

const createMenuItemHTML = (() => {
    const colors = [
        '#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4',
        '#009688','#4caf50','#ff9800','#ff5722','#795548','#607d8b','#9e9e9e',
        '#ffeb3b','#ffc107','#00bcd4','#8bc34a','#cddc39','#ff4081','#536dfe',
        '#00e676','#76ff03','#ff6e40','#d500f9','#651fff','#2979ff','#64ffda'
    ];

    let availableColors = [];

    return (key, item) => {
        const hasIcon = item.icon && item.icon.trim() !== '';
        let icon = '';
        let link_class = '';

        if (hasIcon) {
            const isSingleChar = item.icon.length === 1 && !item.icon.startsWith('&#');
            if (isSingleChar) {
                if (availableColors.length === 0) availableColors = [...colors];

                const idx = Math.floor(Math.random() * availableColors.length);
                const bg = availableColors.splice(idx, 1)[0];

                const r = parseInt(bg.slice(1,3),16);
                const g = parseInt(bg.slice(3,5),16);
                const b = parseInt(bg.slice(5,7),16);
                const brightness = 0.299*r + 0.587*g + 0.114*b;
                const textColor = brightness > 186 ? '#000' : '#fff';

                icon = `<span class="link-icon char-icon" style="background-color:${bg};color:${textColor};">${item.icon}</span>`;
            } else {
                icon = `<span class="link-icon">${item.icon}</span>`;
            }
            link_class = ' d-flex align-items-center';
        }

        let dataset = '';
        let onclick = '';

        if (typeof item.href === 'object' && item.href.type === 'modal') {
            dataset = `data-modal-key="${key}"`;
            onclick = `onclick="$.handleMenuModalClick(this); return false;"`;
        }

        const href = typeof item.href === 'string' ? item.href : '#';
        const target = item.target || '_self';

        return `
            <li class="nav-item ${key}">
                <a class="nav-link ${key}-link${link_class}" href="${href}" target="${target}" role="menuitem" ${dataset} ${onclick}>
                    ${icon}<span>${item.title || ''}</span>
                </a>
            </li>
        `;
    };
})();

$.handleMenuModalClick = function(el) {
    const key = el.dataset.modalKey;
    if (!key || !preparedMenuConfig) {
        return;
    }

    const item = preparedMenuConfig[key];
    if (!item || !item.href || item.href.type !== 'modal') {
        return;
    }

    const modalData = {
        title: langText[item.href.title] || '',
        subtitle: langText[item.href.subtitle] || '',
        content: langText[item.href.content] || '',
        iconText: item.href.iconText || null,
        customStyles: item.href.customStyles || {}
    };

    showModal(modalData);

    const offcanvasEl = document.getElementById('menu');
    bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
};

$.getMultiResources = function(batch, basePath) {
    var executeInOrder = function(source, code, resolve) {
        if (source == batch[0]) {
            batch.shift();

            if (source.endsWith('.js') && !loadedScripts.has(source)) {
                Function(`"use strict";${code}`)($);
                loadedScripts.add(source);
            } else if (source.endsWith('.css') && !loadedStyles.has(source)) {
                var style = document.createElement('style');
                style.textContent = code;
                document.head.appendChild(style);
                loadedStyles.add(source);
            }

            resolve();
        } else {
            setTimeout(function() { executeInOrder(source, code, resolve); }, 10);
        }
    };

    var _arr = $.map(batch, function(source) {
        var url = source;

        if (!source.includes('/')) {
            var folderPath = basePath ? basePath + '/' : '';
            if (source.endsWith('.js')) {
                url = 'js/' + folderPath + source;
            } else if (source.endsWith('.css')) {
                url = 'css/' + folderPath + source;
            }
        }

        return new Promise(function(resolve) {
            $.ajax({
                type: "GET",
                url: url,
                dataType: "text",
                cache: true,
                success: function(code) { executeInOrder(source, code, resolve); }
            });
        });
    });

    _arr.push($.Deferred(function(deferred) { $(deferred.resolve); }));

    return $.when.apply($, _arr);
};

$.getUrlparams = () => {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = (typeof hash[1] !== 'undefined' ? hash[1].replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `http://${nonSchemmaUrl}`) : '');
    }

    return vars;
}

$.loadSettings = async () => {
    try {
        const response = await loadJson('/config', 'settings');
        Object.assign(settings, response);

    } catch (error) {
        console.error("Failed to load settings:", error);
    }
};

$.loadLangs = async (language = settings.default_lang) => {
    try {
        const response = await loadJson('/langs', language);
        Object.assign(langText, response);
        updateUIWithLangText(langText);

        if (settings.layout.enable_menu && preparedMenu) {
            const isRTL = document.documentElement.dir === 'rtl';
            const position = (
                isRTL
                ? { left: 'end',  right: 'start' }
                : { left: 'start', right: 'end' }
            )[settings.layout?.menu_position] || 'start';

            const offcanvasHtml = `
                <div class="menu-wrapper menu-${position}">
                    <div id="menu" class="offcanvas offcanvas-${position}" tabindex="-1" aria-labelledby="menuTitle">
                        <div class="offcanvas-header flex-wrap position-relative">
                            <h5 class="offcanvas-title" id="menuTitle">${langText.menu.title || ''}</h5>
                            <div id="menuTrigger" class="menu-trigger" role="button" aria-controls="menu" aria-expanded="false">
                                <div class="icon"></div>
                            </div>
                        </div>
                        <div class="offcanvas-body">
                            <ul class="nav flex-column" id="menuContainer">
                                ${preparedMenu}
                            </ul>
                        </div>
                    </div>
                </div>
            `;

            $('.menu-wrapper').remove();
            $('.captiveportal').prepend(offcanvasHtml);

            const menuEl = document.getElementById('menu');
            const trigger = document.querySelector('.menu-trigger');

            if (menuEl && trigger) {
                const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(menuEl);

                trigger.addEventListener('click', () => {
                    const isOpen = menuEl.classList.contains('show');
                    isOpen ? offcanvas.hide() : offcanvas.show();
                });

                menuEl.addEventListener('shown.bs.offcanvas', () => {
                    trigger.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                });

                menuEl.addEventListener('hidden.bs.offcanvas', () => {
                    trigger.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                });

                const menuLinks = menuEl.querySelectorAll('#menuContainer a.nav-link');
                menuLinks.forEach(link => {
                    link.addEventListener('click', () => offcanvas.hide());
                });
            }
        }
    } catch {
        showModal({
            title: 'An error occurred',
            subtitle: 'Translation content is unavailable',
            content: `<p>Unfortunately, the language file could not be loaded. The login system will automatically switch to ${settings.langs[settings.default_lang]}.</p>`,
            iconText: '&#9888;',
            customStyles: {
                headerColor: settings.modal.auth_failed_header_color,
                overlayColor: settings.modal.overlay_color,
                timeout: settings.modal.timeout,
                timeoutProgressbar: true,
                pauseOnHover: true
            },
            onOpen: async () => {
                await $.loadLangs(settings.default_lang);
            },
            onClose: () => {
                $.setLangLayout(settings.langs, settings.default_lang, '#polyglotLanguageSwitcher');
                $.createCookie('lang', settings.default_lang, 31);
            }
        });
    }
};

$.setLang = (id) => {
    $(id).polyglotLanguageSwitcher({
        effect: 'slide',
        noRefresh: true,
        onChange: (evt) => {
            $.createCookie('lang', evt.selectedItem, 31);
            langText = {};
            $.loadLangs(evt.selectedItem);

            if (typeof $('#inputUsername') !== 'undefined') {
                $('#inputUsername').prop('readonly', false).focus();
            }
        }
    });
}

$.setLangLayout = (langs, selectedLang, container) => {
    const layoutType = settings.layout.lang_layout || 'select';
    const langFlagsDir = settings.layout.lang_flags_dir || '4x3';
    let html = '';

    switch (layoutType) {
        case 'flags-select':
            html = `
                <form action="javascript:void(0);">
                    <select id="polyglot-language-options" class="flags-select ${langFlagsDir}">
                        ${Object.entries(langs).map(([key, value]) =>
                            `<option id="${key}" value="${key}" data-title="${value}" aria-label="${value}"${key === selectedLang ? ' selected' : ''}>
                                ${value}
                            </option>`).join('')}
                    </select>
                </form>`;
            break;

        case 'flags-only-select':
            html = `
                <form action="javascript:void(0);">
                    <select id="polyglot-language-options" class="flags-only-select ${langFlagsDir}">
                        ${Object.entries(langs).map(([key, value]) =>
                            `<option id="${key}" value="${key}" data-title="${value}" aria-label="${value}"${key === selectedLang ? ' selected' : ''}>
                                &nbsp;
                            </option>`).join('')}
                    </select>
                </form>`;
            break;

        case 'flags-list':
            html = `
                <ul id="polyglotLanguageSwitcher" class="d-flex flex-wrap justify-content-end gap-3 pb-3">
                    ${Object.entries(langs).map(([key, value]) => {
                        const flag = langsFlags[key] || key;
                        return `
                            <li id="${key}" data-lang="${key}" class="flag-item${key === selectedLang ? ' selected' : ''}" title="${value}" aria-label="${value}" role="button" tabindex="0">
                                <img src="/images/flags/${langFlagsDir}/${flag}.svg" alt="${value}" data-title="${value}" />
                            </li>`;
                    }).join('')}
                </ul>`;
            break;

        case 'select':
        default:
            html = `
                <form action="javascript:void(0);">
                    <select id="polyglot-language-options">
                        ${Object.entries(langs).map(([key, value]) =>
                            `<option id="${key}" value="${key}" data-title="${value}" aria-label="${value}"${key === selectedLang ? ' selected' : ''}>
                                ${value}
                            </option>`).join('')}
                    </select>
                </form>`;
            break;
    }

    $(container).addClass(layoutType + ' flags-' + langFlagsDir);
    $(container).attr('aria-label', $(container).attr('aria-label') || langText.cp_portal_select_lang);
    $(container).attr('data-trigger-label', langText.cp_portal_select_lang);

    $(container).html(html);
    $.setLang(container);

    if (layoutType === 'flags-list') {
        $('#polyglotLanguageSwitcher li').on('click', function () {
            const lang = $(this).data('lang');
            $.createCookie('lang', lang, 31);

            const url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            url.hash = '#';
            window.location.href = url.toString();
        });
    }
};

$.clientInfo = async (data, selector = null) => {
    await waitForObject(langText);

    const container = selector ? $(selector) : $(`#cp_portal_event_${data.authType}`);

    if (!container.length) {
        return;
    }

    const appendInfo = (wrapperClass, title, value, className = 'config-address') => container.append(`<p class="${wrapperClass}"><span class="if-title">${title}</span> <span class="${className}">${value}</span></p>`);

    data.ipAddress && appendInfo('flex-50', langText.cp_portal_ifconfig_ip_address, data.ipAddress);
    data.macAddress && appendInfo('flex-50', langText.cp_portal_ifconfig_mac_address, data.macAddress);

    if (typeof data.startTime === 'number') {
        const date = new Date(data.startTime * 1000);
        const lang = document.documentElement.lang;
        const locale = langISOMap[lang] || null;
        const country = langsFlags[lang];
        const hour12 = country ? hour12Countries.includes(country.toLowerCase()) : false;

        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12
        };

        const formatted = locale
            ? date.toLocaleString(locale, options)
            : formatISO(data.startTime * 1000).join(' ');

        appendInfo('flex-100', langText.cp_session_start_time, formatted, 'config-info');
    }

    if (data.acc_session_timeout != null && $('.wrapperTimeLeft').length === 0) {
        let timeLeft = parseInt(data.acc_session_timeout, 10);
        const sinceLogon = (Date.now() / 1000) - parseInt(data.startTime, 10);
        timeLeft = Math.max(timeLeft - sinceLogon, 0);

        appendInfo('wrapperTimeLeft flex-100', langText.cp_session_time_left, updateTimeLeft(timeLeft), 'time-left-value');

        const timer = setInterval(() => {
            timeLeft -= 60;

            if (timeLeft <= 0) {
                clearInterval(timer);
                showModal({
                    title: langText.cp_session_timeout_title,
                    subtitle: langText.cp_session_timeout_info_title,
                    content: langText.cp_session_timeout_content,
                    iconText: '&#x27f3;',
                    customStyles: {
                        timeout: settings.modal.timeout,
                        timeoutProgressbar: true,
                        pauseOnHover: true
                    },
                    onClose: () => window.location.reload()
                });
            }

            $('.wrapperTimeLeft .time-left-value').text(updateTimeLeft(timeLeft));
        }, 60000);
    }
};

const updateTimeLeft = (timeLeft) => {
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    const formatTime = (value, texts) => {
        if (value === 0) {
            return '';
        }

        const lastTwoDigits = value % 100;
        const lastDigit = value % 10;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${value} ${texts.other}`;
        }

        if (value === 1) {
            return `${value} ${texts.one}`;
        }

        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value} ${texts.few}`;
        }

        return `${value} ${texts.other}`;
    };

    const daysText = formatTime(days, {
        one: langText.cp_session_time_left_one_day,
        few: langText.cp_session_time_left_two_four_days,
        other: langText.cp_session_time_left_other_days
    });

    const hoursText = formatTime(hours, {
        one: langText.cp_session_time_left_one_hour,
        few: langText.cp_session_time_left_two_four_hours,
        other: langText.cp_session_time_left_other_hours
    });

    const minutesText = (days === 0 && hours === 0 && minutes < 1)
        ? langText.cp_session_time_left_less_than_minute
        : formatTime(minutes, {
            one: langText.cp_session_time_left_one_minute,
            few: langText.cp_session_time_left_two_four_minutes,
            other: langText.cp_session_time_left_other_minutes
        });

    return [daysText, hoursText, minutesText].filter(Boolean).join(', ');
};

$.createCookie = (name, value, days) => {
    var d = new Date();

    d.setTime(d.getTime() + (days*24*60*60000));

    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

$.getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

$.authorisationFailed = (onClose = null) => {
    var modal = {
        title: langText.cp_error_login_err,
        subtitle: langText.cp_error_info_title,
        content: langText.cp_error_info + langText.cp_error_solution_title + langText.cp_error_solution,
        iconText: '&#9888;',
        customStyles: {
            headerColor: settings.modal.auth_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            timeout: settings.modal.timeout,
            timeoutProgressbar: true,
            pauseOnHover: true
        }
    };

    if (onClose instanceof Object) {
        Object.assign(modal, onClose);
    }

    showModal(modal);
}

$.showRules = () => {
    showModal({
        title: langText.cp_rules_title,
        subtitle: langText.cp_rules_info_title,
        content: langText.cp_rules_content,
        iconText: '&#167;',
        customStyles: {
            width: 800,
            top: 70,
            bottom: 70
        }
    });
};

$.connectionFailed = () => {
    showModal({
        title: langText.cp_error_title,
        subtitle: langText.cp_error_server_connection,
        iconText: '&#9888;',
        customStyles: {
            headerColor: settings.modal.conn_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            borderBottom: false,
        }
    });
}

$.connectionBlocked = (loginDelay) => {
    showModal({
        title: langText.cp_login_attempt_title,
        subtitle: langText.cp_login_attempt_info_title,
        iconText: '&#9888;',
        content: sprintf(langText.cp_login_attempt_content, settings.login.attempts, settings.login.delay, (settings.login.delay == 1 ? langText.cp_login_attempt_minute : langText.cp_login_attempt_minutes)),
        customStyles: {
            headerColor: settings.modal.conn_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            borderBottom: false,
            timeout: new Date(loginDelay - Date.now()).getTime(),
            timeoutProgressbar: true,
            overlayClose: false,
            closeButton: false,
            closeOnEscape: false
        }
    });
};

$.connectionLogon = (data) => {
    if ($.isAttempt(data)) {
        $.connectionBlocked(data.local);
    }

    if (data.clientState == 'AUTHORIZED') {
        if (settings.login.control && typeof data.loginTime !== 'undefined') {
            delete data.loginTime;
        }

        if (settings.layout.redirect_url.length > 0 && isValidUrl(settings.layout.redirect_url)) {
            window.location.replace(settings.layout.redirect_url);
        } else if ($.getUrlparams()['redirurl'] != undefined) {
            window.location = $.getUrlparams()['redirurl'] + '?refresh';
        } else {
            window.location.reload();
        }
    } else {
        $('#inputUsername, #inputPassword').val('');

        if (settings.login.control && settings.login.attempts > 0) {
            attempt++;
            var ts = Date.now();
            data.loginTime = new Date(Date.now());

            if (settings.login.attempts - attempt === 0) {
                data.loginTime.setTime(data.loginTime.getTime() + settings.login.delay*60000);
                document.cookie = "loginTime=" + data.loginTime + ";expires=" + data.loginTime + ";path=/";
                $.authorisationFailed(
                    {onClose: () => $.connectionBlocked(data.loginTime)}
                );
                $.setAttempt(data);
            }
        }

        $.authorisationFailed();
    }
}

$.connectionStatus = (data) => {
    if (data.clientState != 'AUTHORIZED' && data.authType != undefined && null == localId) {
        localId = [...data.ipAddress].map((x, i) => (x.codePointAt() ^ data.authType.charCodeAt(i % data.authType.length) % 255).toString(16).padStart(2,'0')).join('');
    }

    if (data.clientState == 'AUTHORIZED') {
        $('#login_normal').addClass('d-none');
        $('#logout_undefined').removeClass('d-none');
    } else if (data.authType == 'none') {
        $('#login_normal').addClass('d-none');
        $('#login_none').removeClass('d-none');
    } else {
        if (settings.login.control && settings.login.attempts > 0 && $.isAttempt(data)) {
            $.connectionBlocked(data.local);
        }
        $('#login_normal').removeClass('d-none');
    }

    $('.row, .footer-isp-info').addClass('ready');
}

$.isAttempt = (data) => {
    $.getAttempt(data);
    if (null == data.local) {
        return false;
    }

    var now = new Date(Date.now());
    var control = new Date($.getCookie('loginTime'));
    data.local = new Date(
        JSON.parse(
            String.fromCharCode(...(data.local).match(/.{1,2}/g).map((e,i) => parseInt(e, 16) ^ localId.charCodeAt(i % localId.length) % 255))
        ).loginTime
    );

    if (now >= data.local) {
        window.localStorage.removeItem('loginAttempt');
        return false;
    }

    if (now < data.local || control != data.local) {
        return true;
    }

    return false;
}

$.setAttempt = (batch) => {
    batch = JSON.stringify(batch);
    batch = [...batch].map((x, i) => (x.codePointAt() ^ localId.charCodeAt(i % localId.length) % 255).toString(16).padStart(2,'0')).join('');
    window.localStorage.setItem('loginAttempt', batch);
}

$.getAttempt = (data) => {
    data.local = window.localStorage.getItem('loginAttempt');
    return data;
}

$.adjustContrast = (value, opts = {}) => {
    if (!settings?.layout?.a11y) {
        return value;
    }

    if (typeof value !== 'string') {
        return value;
    }

    const FACTOR = typeof opts.factor === 'number' ? Math.max(0, Math.min(1, opts.factor)) : 0.2;
    const LIGHT_THRESHOLD = typeof opts.threshold === 'number' ? opts.threshold : 0.5;

    const clamp = (v, a = 0, b = 255) => Math.max(a, Math.min(b, Math.round(v)));

    const srgbToLinear = (c) => {
        c = c / 255;

        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const luminance = (r,g,b) => 0.2126*srgbToLinear(r) + 0.7152*srgbToLinear(g) + 0.0722*srgbToLinear(b);

    const parseHex = (hex) => {
        const h = hex.replace('#','');
        if (h.length === 3) {
            return {
                r: parseInt(h[0]+h[0],16),
                g: parseInt(h[1]+h[1],16),
                b: parseInt(h[2]+h[2],16),
                a: 1,
                format: 'hex3'
            };
        }

        if (h.length === 4) {
            return {
                r: parseInt(h[0]+h[0],16),
                g: parseInt(h[1]+h[1],16),
                b: parseInt(h[2]+h[2],16),
                a: parseInt(h[3]+h[3],16)/255,
                format: 'hex4'
            };
        }

        if (h.length === 6) {
            return {
                r: parseInt(h.slice(0,2),16),
                g: parseInt(h.slice(2,4),16),
                b: parseInt(h.slice(4,6),16),
                a: 1,
                format: 'hex6'
            };
        }

        if (h.length === 8) {
            return {
                r: parseInt(h.slice(0,2),16),
                g: parseInt(h.slice(2,4),16),
                b: parseInt(h.slice(4,6),16),
                a: parseInt(h.slice(6,8),16)/255,
                format: 'hex8'
            };
        }

        return null;
    };

    const parseRgb = (str) => {
        const m = str.match(/rgba?\(\s*([^\)]+)\s*\)/i);

        if (!m) {
            return null;
        }

        const parts = m[1].split(',').map(p => p.trim());
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        const a = parts.length === 4 ? parseFloat(parts[3]) : 1;

        return { r, g, b, a, format: parts.length === 4 ? 'rgba' : 'rgb' };
    };

    const formatColor = (col) => {
        if (col.origFormat.startsWith('hex')) {
            const toHex = n => n.toString(16).padStart(2,'0');
            if (col.origFormat === 'hex4' || col.origFormat === 'hex8') {
                const alpha = clamp(Math.round(col.a * 255), 0, 255);
                return `#${toHex(col.r)}${toHex(col.g)}${toHex(col.b)}${toHex(alpha)}`;
            }

            return `#${toHex(col.r)}${toHex(col.g)}${toHex(col.b)}`;
        }

        if (col.origFormat === 'rgb') {
            return `rgb(${col.r}, ${col.g}, ${col.b})`;
        }

        if (col.origFormat === 'rgba') {
            return `rgba(${col.r}, ${col.g}, ${col.b}, ${+col.a.toFixed(3)})`;
        }

        return null;
    };

    const adjustRGB = (r,g,b,a, origFormat) => {
        const lum = luminance(r,g,b);
        const isLight = lum >= LIGHT_THRESHOLD;
        let nr, ng, nb;

        if (isLight) {
            nr = clamp(r + (255 - r) * FACTOR);
            ng = clamp(g + (255 - g) * FACTOR);
            nb = clamp(b + (255 - b) * FACTOR);
        } else {
            nr = clamp(r * (1 - FACTOR));
            ng = clamp(g * (1 - FACTOR));
            nb = clamp(b * (1 - FACTOR));
        }
        return { r: nr, g: ng, b: nb, a, origFormat };
    };

    const colorRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\(\s*([^)]+)\)/g;

    if (!value.match(colorRegex)) {
        return value;
    }

    const replaced = value.replace(colorRegex, (match) => {
        match = match.trim();
        let parsed = null;

        if (match.startsWith('#')) {
            parsed = parseHex(match);

            if (!parsed) {
                return match;
            }

            parsed.origFormat = parsed.format.startsWith('hex') ? parsed.format : 'hex6';
        } else if (match.toLowerCase().startsWith('rgb')) {
            parsed = parseRgb(match);

            if (!parsed) {
                return match;
            }

            parsed.origFormat = parsed.format;
        } else {
            return match;
        }

        const adjusted = adjustRGB(parsed.r, parsed.g, parsed.b, parsed.a, parsed.origFormat);
        return formatColor(adjusted);
    });

    return replaced;
};

$.initKeyboardAccessibility = () => {
    if (!settings?.layout?.a11y) {
        return;
    }

    const baseSelectors = [
        "#inputUsername",
        "#inputPassword",
        "#login-rules",
        "#rules",
        "#signin",
        "#signin_anon",
        "#logoff",
        ".cpModal-button-close",
        "a.current",
        "#menuTrigger"
    ];

    const langSelectors = Object.keys(langsFlags).map(lang => `#${lang}`);
    const selectors = [...baseSelectors, ...langSelectors];
    const elements = document.querySelectorAll(selectors.join(","));

    elements.forEach(el => {
        if (!el.hasAttribute("tabindex")) {
            el.setAttribute("tabindex", "0");
        }

        el.addEventListener("focus", () => el.classList.add("kbd-focus"));
        el.addEventListener("blur", () => el.classList.remove("kbd-focus"));

        el.addEventListener("keydown", e => {
            switch (e.key) {
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (el.type === "checkbox" && e.key === " ") {
                        el.checked = !el.checked;
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                    } else {
                        el.click();
                    }
                    break;

                case "Escape":
                    document.querySelector(".cpModal-button-close")?.click();
                    break;

                case "ArrowLeft": {
                    const prevLang = Array.from(langSelectors)
                    .map(sel => document.querySelector(sel))
                    .find(x => x && x.classList.contains("current"));
                    if (prevLang) {
                        let idx = langSelectors.indexOf(`#${prevLang.id}`);
                        idx = (idx - 1 + langSelectors.length) % langSelectors.length;
                        document.querySelector(langSelectors[idx])?.click();
                    }
                    break;
                }

                case "ArrowRight": {
                    const currLang = Array.from(langSelectors)
                    .map(sel => document.querySelector(sel))
                    .find(x => x && x.classList.contains("current"));
                    if (currLang) {
                        let idx = langSelectors.indexOf(`#${currLang.id}`);
                        idx = (idx + 1) % langSelectors.length;
                        document.querySelector(langSelectors[idx])?.click();
                    }
                    break;
                }
            }
        });
    });

    let keyBuffer = [];
    let bufferTimeout;

    const pressedKeys = new Set();
    const maxCodeLength = Math.max(...Object.keys(langsFlags).map(k => k.length));

    const resetBuffer = () => {
        keyBuffer = [];
        clearTimeout(bufferTimeout);
        bufferTimeout = null;
    };

    const checkLangBuffer = () => {
        for (let len = Math.min(keyBuffer.length, maxCodeLength); len > 0; len--) {
            const attempt = keyBuffer.slice(-len).join("");
            if (langsFlags[attempt]) {
                triggerLang(attempt);
                resetBuffer();
                return true;
            }
        }

        return false;
    };

    const triggerLang = code => {
        const langEl = document.getElementById(code);
        if (langEl) {
            langEl.click();
            langEl.classList.add("flash");
            setTimeout(() => langEl.classList.remove("flash"), 300);
        }
    };

    const triggerShortcut = letter => {
        const selector = shortcutMap[letter];
        if (!selector) {
            return;
        }

        for (const sel of selector.split(",")) {
            const el = document.querySelector(sel.trim());
            if (!el || el.offsetParent === null) {
                continue;
            }

            if (el.tagName === "INPUT") {
                if (el.type === "checkbox" || el.type === "radio") {
                    el.checked = !el.checked;
                    el.dispatchEvent(new Event("change", { bubbles: true }));
                } else {
                    el.focus();
                }
            } else if (el.tagName === "TEXTAREA") {
                el.focus();
            } else {
                el.click();
            }

            break;
        }
    };

    let leftShiftPressed = false;
    let leftAltPressed = false;

    document.addEventListener("keydown", e => {
        const activeInput = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
        const key = e.key.toLowerCase();

        if (e.code === "ShiftLeft") {
            leftShiftPressed = true;
        }

        if (e.code === "AltLeft") {
            leftAltPressed = true;
        }

        if (leftAltPressed && leftShiftPressed && /^[a-z]$/.test(key)) {
            e.preventDefault();
            triggerShortcut(key);
        }

        if (!activeInput && !leftAltPressed && e.shiftKey && /^[a-z]$/.test(key)) {
            keyBuffer.push(key);
            if (keyBuffer.length > maxCodeLength) {
                keyBuffer.shift();
            }

            if (bufferTimeout) {
                clearTimeout(bufferTimeout);
            }

            bufferTimeout = setTimeout(checkLangBuffer, 1000);

            if (!activeInput) {
                e.preventDefault();
            }

            return;
        }
    });

    document.addEventListener("keyup", e => {
        if (e.code === "ShiftLeft") {
            leftShiftPressed = false;
        }

        if (e.code === "AltLeft") {
            leftAltPressed = false;
        }

        pressedKeys.delete(e.key.toLowerCase());
    });
};

$.initTour = () => {
    if (!langText) {
        return null;
    }

    const portal = document.querySelector(".captiveportal");
    if (!portal) {
        return null;
    }

    const breakpoint = settings?.layout?.a11y_helper_breakpoint || 1200;

    const allowedAttrs = new Set([
        "data-title",
        "data-content",
        "data-step",
        "data-group",
        "data-position",
        "data-disable-interaction",
        "data-tooltip-class",
        "data-highlight-class"
    ]);

    const createTourTrigger = () => {
        if (!document.getElementById("a11y-keys-wrapper")) {
            const keysWrapper = document.createElement("div");
            keysWrapper.id = "a11y-keys-wrapper";
            keysWrapper.innerHTML = `
                <div id="a11y-keys"></div>
                <div id="a11y-lang-keys"></div>
            `;

            portal.appendChild(keysWrapper);
        }

        if (!document.getElementById("tourBtn")) {
            const tourWrapper = document.createElement("div");
            tourWrapper.id = "tourBtn";
            tourWrapper.style.display = "block";
            tourWrapper.innerHTML = `
                <div class="helper help-btn">
                    <a id="launchTour" href="javascript:void(0);">
                        <h3>
                            <small>${langText.a11y_helper1 || "Need help?"}</small>
                            <div>${langText.a11y_helper2 || "Click here"}</div>
                        </h3>
                    </a>
                </div>
            `;
            portal.appendChild(tourWrapper);
        }
    };

    const updateTourTriggerVisibility = () => {
        const tourBtn = document.getElementById("tourBtn");
        const keysWrapper = document.getElementById("a11y-keys-wrapper");
        const isWide = window.innerWidth >= breakpoint;

        if (isWide) {
            if (!tourBtn || !keysWrapper) {
                createTourTrigger();
            }

            const newTourBtn = document.getElementById("tourBtn");

            if (newTourBtn && newTourBtn.style.display !== "block") {
                newTourBtn.style.display = "block";
            }
        } else {
            if (tourBtn && tourBtn.style.display !== "none") {
                tourBtn.style.display = "none";
            }
        }
    };

    createTourTrigger();
    updateTourTriggerVisibility();
    window.addEventListener("resize", () => {
        updateTourTriggerVisibility();
    });

    const isVisible = (el) => {
        if (!el) {
            return false;
        }

        let current = el;
        while (current && current !== document.body) {
            const style = window.getComputedStyle(current);
            if (style.display === "none" || current.classList.contains("d-none")) {
                return false;
            }

            current = current.parentElement;
        }
        return true;
    };

    const findShortcutForElement = (containerEl) => {
        for (const [letter, selectorString] of Object.entries(shortcutMap)) {
            const selectors = selectorString.split(",").map(s => s.trim()).filter(Boolean);
            for (const sel of selectors) {
                const targets = document.querySelectorAll(sel);
                for (const target of targets) {
                    if (!target) {
                        continue;
                    }

                    if (target === containerEl || containerEl.contains(target)) {
                        return `Shift + Alt + ${letter.toUpperCase()}`;
                    }
                }
            }
        }
        return "";
    };

    const getLabelForElement = (targetEl) => {
        let label = targetEl.getAttribute("aria-label") || "";
        if (!label) {
            const ariaChild = targetEl.querySelector("[aria-label]");
            if (ariaChild && isVisible(ariaChild)) {
                label = ariaChild.getAttribute("aria-label").trim();
            }
        }

        if (!label) {
            const lbl = targetEl.querySelector("label[for]");
            if (lbl && isVisible(lbl)) {
                label = lbl.textContent.trim();
            }
        }

        if (!label) {
            const innerField = targetEl.querySelector("input, textarea, select, button");
            if (innerField && innerField.placeholder && isVisible(innerField)) {
                label = innerField.placeholder.trim();
            }
        }

        if (!label) {
            label = targetEl.textContent.trim();
        }

        return label;
    };

    let steps = [];
    let processedElements = new Set();

    const fillSteps = () => {
        let allDone  = true;
        steps.length = 0;

        for (const langKey of Object.keys(langText)) {
            const idx = langKey.indexOf("_data-");
            if (idx === -1) {
                continue;
            }

            const prefix = langKey.substring(0, idx);
            const attrWithData = langKey.substring(idx + 1);
            if (!allowedAttrs.has(attrWithData)) {
                continue;
            }

            const targetEl = document.getElementById(prefix);
            if (!targetEl || !isVisible(targetEl)) {
                allDone = false;
                continue;
            }

            let value = String(langText[langKey] || "").trim();
            if (!value) {
                continue;
            }

            const shortcut = findShortcutForElement(targetEl);
            const label = getLabelForElement(targetEl);

            try {
                value = sprintf(value, shortcut, label);
            } catch (e) {
            }

            let step = steps.find(s => s.target === `#${prefix}`);
            if (!step) {
                step = { target: `#${prefix}` };
                steps.push(step);
            }

            const key = attrWithData.replace("data-", "");
            step[key] = value;
        }

        for (const step of steps) {
            if (step.step) {
                step.order = parseInt(step.step, 10) || 999;
                delete step.step;
            }
        }

        return allDone;
    };

    const maxRetries = 10;
    let retries = 0;

    const retryInterval = setInterval(() => {
        const done = fillSteps();
        retries++;
        if (done || retries >= maxRetries) {
            clearInterval(retryInterval);
        }
    }, 200);

    const finalSteps = steps.sort((a, b) => {
        const ao = a.order || 999;
        const bo = b.order || 999;
        return ao - bo;
    });

    const tourOptions = {
        steps: finalSteps,
        completeOnFinish: true,
        showButtons: true,
        showStepDots: true,
        showStepProgress: true,
        autoScroll: true,
        debug: false,
        nextLabel: langText.a11y_helper_next || 'Next',
        prevLabel: langText.a11y_helper_prev || 'Back',
        finishLabel: langText.a11y_helper_done || 'Done'
    };

    if (typeof tourguide === "undefined" || typeof tourguide.TourGuideClient !== "function") {
        console.warn("TourGuide library not found.");
        return null;
    }

    const tour = new tourguide.TourGuideClient(tourOptions);

    return tour;
};

$.initQrcodeScanner = () => {
    if (qrScannerActive) {
        console.warn('QR scanner: already running, skipping new init');
        return Promise.resolve(null);
    }

    qrScannerActive = true;

    return new Promise((resolve) => {
        if (!settings.layout?.qrcode_scanner) {
            qrScannerActive = false;
            return resolve(null);
        }

        qrScannerResolve = resolve;

        const usernameField = document.getElementById('fieldUsername');
        const passwordField = document.getElementById('fieldPassword');

        if (!usernameField || !passwordField) {
            console.warn('QR scanner: required fields not found');
            qrScannerActive = false;
            return resolve(null);
        }

        const wrapper = usernameField.closest('.form-fields-wrapper') || usernameField.parentNode;
        if (getComputedStyle(wrapper).position === 'static') {
            wrapper.classList.add('position-relative');
        }

        (async () => {
            try {
                if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
                    qrScannerActive = false;
                    return resolve(null);
                }

                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = Array.isArray(devices) && devices.some(d => d.kind === 'videoinput');

                if (!hasVideo) {
                    qrScannerActive = false;
                    return resolve(null);
                }

                usernameField.classList.replace('w-100', 'w-85');
                passwordField.classList.replace('w-100', 'w-85');
            } catch (err) {
                qrScannerActive = false;
                return resolve(null);
            }

            let qrDiv = wrapper.querySelector('#qrcode');
            if (!qrDiv) {
                qrDiv = document.createElement('div');
                qrDiv.id = 'qrcode';
                qrDiv.classList.add('position-absolute');
                qrDiv.style.cursor = 'pointer';
                qrDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z"/>
                    <path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z"/>
                    <path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z"/>
                    <path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z"/>
                    <path d="M12 9h2V8h-2z"/>
                </svg>`;
                wrapper.appendChild(qrDiv);
            }

            if (qrDiv._qrClickBound) {
                requestAnimationFrame(() => {
                    updateQrPosition();
                });
            } else {
                qrDiv._qrClickBound = true;
                qrDiv.addEventListener('click', () => {
                    if (!scanning) {
                        startScan();
                    } else {
                        stopScan();
                    }
                });
            }

            let scanning = false;
            let stream = null;
            let video = null;
            let overlayCanvas = null;
            let overlayCtx = null;
            let scanTimer = null;

            if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
                navigator.mediaDevices.ondevicechange = async () => {
                    try {
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const hasVideo = Array.isArray(devices) && devices.some(d => d.kind === 'videoinput');

                        if (!hasVideo) {
                            stopScan();
                            if (qrDiv && qrDiv.parentNode) {
                                qrDiv.parentNode.removeChild(qrDiv);
                            }

                            usernameField.classList.remove('w-85');
                            usernameField.classList.add('w-100');
                            passwordField.classList.remove('w-85');
                            passwordField.classList.add('w-100');
                        }
                    } catch (err) {
                        console.warn('QR scanner: devicechange handler error', err);
                    }
                };
            }

            const SCAN_W = 320, SCAN_H = 240;

            const scanCanvas = document.createElement('canvas');
            const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });
            scanCanvas.width = SCAN_W;
            scanCanvas.height = SCAN_H;

            const hideClasses = ['w-0','h-0','m-0','p-0','opacity-0','z-n1','overflow-hidden'];
            const showClasses = ['w-85','opacity-100'];

            const addClassesToChildren = (el, classes) => Array.from(el.children).forEach(c => c.classList.add(...classes));
            const removeClassesFromChildren = (el, classes) => Array.from(el.children).forEach(c => c.classList.remove(...classes));

            const getOffsetWithinAncestor = (el, ancestor) => {
                let offset = 0;
                while (el && el !== ancestor) {
                    offset += el.offsetTop || 0;
                    el = el.offsetParent;
                }
                return offset;
            };

            const updateQrPosition = () => {
                if (!qrDiv) {
                    return;
                }

                if (qrDiv.parentNode !== wrapper) {
                    wrapper.appendChild(qrDiv);
                }

                let topPx = 0;

                if (scanning && video) {
                    const rect = video.getBoundingClientRect();
                    const wrapperRect = wrapper.getBoundingClientRect();
                    topPx = rect.top + rect.height / 2 - wrapperRect.top - qrDiv.offsetHeight / 2;
                } else {
                    const uBottom = getOffsetWithinAncestor(usernameField, wrapper) + usernameField.offsetHeight;
                    const pTop = getOffsetWithinAncestor(passwordField, wrapper);
                    topPx = (uBottom + pTop) / 2 - qrDiv.offsetHeight / 2;
                }

                const wrapH = wrapper.clientHeight || wrapper.getBoundingClientRect().height || 0;
                if (topPx < 0) {
                    topPx = 0;
                }

                if (wrapH > 0 && topPx + qrDiv.offsetHeight > wrapH) {
                    topPx = wrapH - qrDiv.offsetHeight;
                }

                qrDiv.style.top = Math.round(topPx) + 'px';

                updateQrLines();
            };

            const updateQrLines = () => {
                if (!qrDiv) {
                    return;
                }

                let topBound, bottomBound;

                if (scanning && video) {
                    const rect = video.parentNode.getBoundingClientRect();
                    topBound = rect.top;
                    bottomBound = rect.bottom;
                } else {
                    topBound = usernameField.getBoundingClientRect().top;
                    bottomBound = passwordField.getBoundingClientRect().bottom;
                }

                const qrRect = qrDiv.getBoundingClientRect();

                const beforeHeight = qrRect.top - topBound;
                const afterHeight = bottomBound - qrRect.bottom;

                qrDiv.style.setProperty('--before-height', `${beforeHeight}px`);
                qrDiv.style.setProperty('--after-height', `${afterHeight}px`);
            };

            const startScan = async () => {
                if (scanning) {
                    return;
                }

                scanning = true;

                usernameField.classList.add(...hideClasses);
                passwordField.classList.add(...hideClasses);
                addClassesToChildren(usernameField, hideClasses);
                addClassesToChildren(passwordField, hideClasses);

                let scanContainer = wrapper.querySelector('.qr-scan-container');
                if (!scanContainer) {
                    scanContainer = document.createElement('div');
                    scanContainer.classList.add('qr-scan-container', 'position-relative', 'w-85');
                    usernameField.parentNode.insertBefore(scanContainer, usernameField);
                } else {
                    scanContainer.innerHTML = '';
                }

                video = document.createElement('video');
                video.autoplay = true;
                video.playsInline = true;
                video.muted = true;

                video.classList.add('field-type-qr','d-block','w-100','h-auto');
                scanContainer.appendChild(video);

                overlayCanvas = document.createElement('canvas');
                overlayCanvas.classList.add('position-absolute');
                overlayCanvas.style.pointerEvents = 'none';
                scanContainer.appendChild(overlayCanvas);

                overlayCtx = overlayCanvas.getContext('2d', { willReadFrequently: true });

                requestAnimationFrame(updateQrPosition);

                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                    video.srcObject = stream;

                    video.addEventListener('loadedmetadata', () => {
                        const videoRect = video.getBoundingClientRect();
                        const containerRect = scanContainer.getBoundingClientRect();

                        overlayCanvas.width = video.videoWidth;
                        overlayCanvas.height = video.videoHeight;
                        overlayCanvas.style.left = `${videoRect.left - containerRect.left}px`;
                        overlayCanvas.style.top = `${videoRect.top - containerRect.top}px`;
                        overlayCanvas.style.width = `${videoRect.width}px`;
                        overlayCanvas.style.height = `${videoRect.height}px`;
                        updateQrPosition();
                    });

                    await video.play();
                    scanLoop();
                } catch (err) {
                    console.error('QR scanner: failed to start camera', err);
                    stopScan();
                }
            };

            const stopScan = () => {
                scanning = false;

                if (scanTimer) {
                    clearTimeout(scanTimer);
                    scanTimer = null;
                }

                if (stream) {
                    stream.getTracks().forEach(t => t.stop());
                    stream = null;
                }

                const scanContainer = wrapper.querySelector('.qr-scan-container');
                if (scanContainer && scanContainer.parentNode) {
                    scanContainer.parentNode.removeChild(scanContainer);
                }

                video = null;
                overlayCanvas = null;
                overlayCtx = null;

                usernameField.classList.remove(...hideClasses);
                usernameField.classList.add(...showClasses);
                passwordField.classList.remove(...hideClasses);
                passwordField.classList.add(...showClasses);

                removeClassesFromChildren(usernameField, hideClasses);
                removeClassesFromChildren(passwordField, hideClasses);

                updateQrPosition();

                if (qrScannerResolve) {
                    qrScannerResolve(null);
                    qrScannerResolve = null;
                }

                qrScannerActive = false;
            };

            const scanLoop = () => {
                if (!scanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
                    scanTimer = setTimeout(scanLoop,100);
                    return;
                }

                scanCtx.clearRect(0,0,SCAN_W,SCAN_H);
                scanCtx.drawImage(video, 0, 0, SCAN_W, SCAN_H);

                const imageData = scanCtx.getImageData(0,0,SCAN_W,SCAN_H);
                const code = jsQR(
                    imageData.data,
                    SCAN_W,
                    SCAN_H,
                    {
                        inversionAttempts: 'attemptBoth'
                    }
                );

                if (overlayCtx && overlayCanvas) {
                    overlayCtx.clearRect(0,0,overlayCanvas.width,overlayCanvas.height);
                }

                if (code && overlayCtx && overlayCanvas) {
                    const scaleX = overlayCanvas.width/SCAN_W;
                    const scaleY = overlayCanvas.height/SCAN_H;
                    const tl = { x: code.location.topLeftCorner.x*scaleX, y: code.location.topLeftCorner.y*scaleY };
                    const tr = { x: code.location.topRightCorner.x*scaleX, y: code.location.topRightCorner.y*scaleY };
                    const br = { x: code.location.bottomRightCorner.x*scaleX, y: code.location.bottomRightCorner.y*scaleY };
                    const bl = { x: code.location.bottomLeftCorner.x*scaleX, y: code.location.bottomLeftCorner.y*scaleY };

                    overlayCtx.strokeStyle = 'lime';
                    overlayCtx.lineWidth   = Math.max(2, Math.round(4*((overlayCanvas.width/SCAN_W+overlayCanvas.height/SCAN_H)/2)));
                    overlayCtx.beginPath();
                    overlayCtx.moveTo(tl.x, tl.y);
                    overlayCtx.lineTo(tr.x, tr.y);
                    overlayCtx.lineTo(br.x, br.y);
                    overlayCtx.lineTo(bl.x, bl.y);
                    overlayCtx.closePath();
                    overlayCtx.stroke();

                    try {
                        const data = JSON.parse(code.data);
                        if (data?.user && data?.password) {
                            qrDiv.classList.remove('qr-ready');
                            qrDiv.classList.add('qr-ready');
                            setTimeout(() => qrDiv.classList.remove('qr-ready'), 750);
                            playBeep();

                            scanning = false;
                            scanTimer = setTimeout(() => {
                                const resolver = qrScannerResolve;
                                qrScannerResolve = null;
                                stopScan();
                                resolver?.(data);
                            }, 350);
                            return;
                        }
                    } catch (e) { }
                }

                scanTimer = setTimeout(scanLoop,100);
            };

            const playBeep = () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();

                const beep = (startTime) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1100, startTime);

                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.015);
                    gain.gain.linearRampToValueAtTime(0, startTime + 0.18);

                    osc.connect(gain).connect(ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.18);
                };

                const now = ctx.currentTime;
                beep(now);
                beep(now + 0.17);
            };

            const waitForLayout = () => new Promise(resolve => {
                const check = () => {
                    if (usernameField.offsetHeight && passwordField.offsetHeight && wrapper.clientHeight) {
                        resolve(true);
                    } else {
                        requestAnimationFrame(check);
                    }
                };
                check();
            });

            waitForLayout().then(updateQrPosition);
        })();
    });
};