/**
 * @version 3.0.0
 * @package GuardianSuit - Multilanguage Captive Portal Template for OPNsense
 * @author Mirosław Majka (mix@proask.pl)
 * @copyright (C) 2025 Mirosław Majka <mix@proask.pl>
 * @license GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */

const initializePortal = async () => {
    await $.loadSettings();
    await initResources();

    setupLanguage();
    initializeVantaEffect();
    useWCAG();
    updateLogo();
    setupRulesSection();
    configureInputFocusBehavior();
    setupAuthHandlers();
    setupRulesLink();
    checkConnectionStatus();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortal, { once: true });
} else {
    initializePortal();
}

const initResources = async () => {
    if (settings.css_params) {
        const vars = {};

        Object.entries(settings.css_params).forEach(([key, value]) => {
            if (settings.layout.a11y && settings.layout.a11y_contrast) {
                value = $.adjustContrast(value, {
                    factor: settings.layout.a11y_factor,
                    threshold: settings.layout.a11y_threshold
                });
            }

            vars[key] = value;
        });

        applyCssVariables(vars);
    }

    if (settings.layout?.force_locales_data) {
        forceLocalesData();
    }

    const flagsDir = settings.layout.lang_flags_dir || '4x3';
    const langLayout = settings.layout.lang_layout;

    if (langLayout === 'flags-only-select' || langLayout === 'flags-select') {
        let styleEl = document.getElementById('flags');

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'flags';

            document.head.appendChild(styleEl);
        }

        styleEl.textContent = Object.keys(settings.langs)
        .map(lang => {
            const flag = langsFlags[lang] || lang;
            const url = `/images/flags/${flagsDir}/${flag}.svg`;
            return `#${lang}::before {background-image: url("${url}");}`;
        })
        .join('');
    }

    const cssResources = [];
    const jsResources  = [
        'bootstrap538.min.js',
        'sprintf.min.js',
        'css_browser_selector.js',
        'cpModal.min.js',
        'jquery.polyglot.language.switcher.js'
    ];

    if (settings.layout.enable_menu) {
        cssResources.push('offcanvas_menu.css');
    }

    await $.getMultiResources(cssResources);
    await $.getMultiResources(jsResources);

    const portal = document.querySelector('.captiveportal');
    if (portal) {
        portal.style.transition = 'opacity 0.3s ease';
        portal.style.opacity = '1';

        portal.addEventListener('transitionend', () => {
            portal.removeAttribute('style');
        }, { once: true });
    }
};

const applyCssVariables = (variables) => {
    let styleEl = document.getElementById('gs-theme-vars');

    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'gs-theme-vars';

        const masterCss = document.querySelector('link[href$="master.css"]');

        if (masterCss) {
            masterCss.parentNode.insertBefore(styleEl, masterCss);
        } else {
            document.head.prepend(styleEl);
        }
    }

    const css = Object.entries(variables).map(([key, value]) => `--${key}: ${value};`).join('\n');
    styleEl.textContent = `:root {\n${css}\n}`;
};

const useWCAG = () => {
    if (!settings.layout.a11y) {
        return;
    }

    document.body.classList.add('a11y');

    if (settings.layout.a11y_contrast) {
        document.body.classList.add('a11y-contrast');
    }

    if (settings.layout.a11y_highlight) {
        document.body.classList.add('a11y-highlight');
    }

    if (settings.layout.a11y_mono) {
        document.body.classList.add('a11y-mono');
    }

    if (settings.layout.a11y_keyboard) {
        document.body.classList.add('a11y-keyboard');
        $.initKeyboardAccessibility();

        if (settings.layout.a11y_helper) {
            document.body.classList.add('a11y-helper');

            const resources = [
                'tour.min.css',
                'tour-rtl.min.css',
                'tour.min.js'
            ];

            $.getMultiResources(resources, 'tourguide').then(() => {
                if (typeof $.initTour === 'function') {
                    const tour = $.initTour();
                    if (tour) {
                        const launchBtn = document.getElementById("launchTour");
                        if (launchBtn) {
                            launchBtn.addEventListener("click", () => {
                                tour.start();
                            });
                        }
                    }
                } else {
                    console.warn("Bootstrap Tour does not exist after loading resources!");
                }
            })
            .catch(err => {
                console.error("Error loading Bootstrap Tour resources:", err);
            });
        }
    }
}

const initializeVantaEffect = () => {
    if (!settings.animate?.effect) {
        return;
    }

    const effect = settings.animate.effect.toLowerCase();
    const preset = settings.animate.preset[effect];

    const vantaResources = [
        'vanta.css',
        'three.r134.min.js',
        `vanta.${effect}.min.js`
    ];

    $.getMultiResources(vantaResources, 'vanta').then(() => {
        window['VANTA'][effect.toUpperCase()]({
            ...settings.animate.params,
            ...preset
        });

        if (settings.layout.a11y) {
            document.querySelectorAll('.vanta-canvas').forEach(canvas => {
                canvas.setAttribute('role', 'presentation');
                canvas.setAttribute('aria-hidden', 'true');
            });
        }
    });
};

const updateLogo = async () => {
    const logoContainer = document.querySelector('#logo');
    const fallback = '/images/default-logo.svg';
    const extensions = ['svg', 'png', 'jpg'];
    const basePath = '/images/logo';
    
    const setLogo = (src) => {
        if (!logoContainer) {
            return;
        }

        const image = document.createElement('img');
        image.className = 'brand-logo';
        image.src = src;
        image.height = 150;
        image.width = 150;
        image.alt = 'Logo';
        logoContainer.replaceChildren(image);
    };

    if (settings.logo && settings.logo.startsWith('data:image/')) {
        setLogo(settings.logo);

        return;
    }

    if (settings.logo && typeof settings.logo === 'string') {
        try {
            const res = await fetch(settings.logo, { method: 'HEAD' });

            if (res.ok) {
                setLogo(settings.logo);

                return;
            }
        } catch (e) {}
    }

    const urls = extensions.map(ext => `${basePath}.${ext}`);

    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD' });

            if (res.ok) {
                setLogo(url);

                return;
            }
        } catch (e) {}
    }

    setLogo(fallback);
};

const setupLanguage = async () => {
    const browserLang = (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
    let lang = $.getCookie('lang') || browserLang;

    if (!(lang in settings.langs)) {
        lang = settings.default_lang;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = langsRTL.includes(lang) ? 'rtl' : 'ltr';

    if (!$.getCookie('lang')) {
        $.createCookie('lang', lang, 31);
    }

    await $.loadLangs(lang);

    const hasMultipleLanguages = Object.keys(settings.langs).length > 1;
    const portal = document.querySelector('.captiveportal');

    if (portal) {
        portal.classList.toggle('multiple-langs', hasMultipleLanguages);
        portal.classList.toggle('single-lang', !hasMultipleLanguages);
    }

    if (hasMultipleLanguages) {
        $.setLangLayout(settings.langs, lang, '#polyglotLanguageSwitcher');
    }
};

const setupRulesSection = () => {
    if (settings.layout.enable_rules) {
        toggleSignInButtons('#login-rules', '#signin');
        toggleSignInButtons('#login-rules-anon', '#signin_anon');
    } else {
        document.querySelectorAll('.rules-checkbox').forEach(element => {
            element.replaceChildren(document.createElement('br'));
        });
    }
};

const toggleSignInButtons = (checkboxSelector, buttonSelector) => {
    const checkbox = document.querySelector(checkboxSelector);
    const button = document.querySelector(buttonSelector);

    if (!checkbox || !button) {
        return;
    }

    checkbox.checked = false;
    button.disabled = true;

    checkbox.addEventListener('change', () => {
        button.disabled = !checkbox.checked;
    });
};

const configureInputFocusBehavior = () => {
    document.querySelectorAll('input[readonly]').forEach(input => {
        input.addEventListener('focus', () => {
            input.readOnly = false;
        });
    });

    document.querySelectorAll('input:not([readonly])').forEach(input => {
        input.addEventListener('blur', () => {
            input.readOnly = true;
        });
    });
};

const setupAuthHandlers = () => {
    if (settings.layout?.qrcode_scanner) {
        const resources = ['jsqr.min.js'];

        $.getMultiResources(resources, 'jsqr').then(() => {
            if (typeof $.initQrcodeScanner === 'function') {
                document.body.classList.add('qrcode-scanner');

                const startScanner = () => {
                    $.initQrcodeScanner().then(data => {
                        if (data?.user && data?.password) {
                            const usernameInput = document.querySelector('#inputUsername');
                            const passwordInput = document.querySelector('#inputPassword');

                            if (usernameInput) {
                                usernameInput.value = data.user;
                            }

                            if (passwordInput) {
                                passwordInput.value = data.password;
                            }

                            if (settings.layout.qrcode_scanner_autologin) {
                                authenticateUser({
                                    user: data.user,
                                    password: data.password
                                });
                            }
                        }

                        startScanner();
                    });
                };

                startScanner();
            } else {
                console.warn('initQrcodeScanner does not exist after loading resources!');
            }
        })
        .catch(err => {
            console.error('Error loading accessibility QR resources:', err);
        });
    }

    document.querySelector('#signin')?.addEventListener('click', handleSignIn);
    document.querySelector('#signin_anon')?.addEventListener('click', handleAnonymousSignIn);
    document.querySelector('#logoff')?.addEventListener('click', handleLogoff);
};

const handleSignIn = (event) => {
    event.preventDefault();
    authenticateUser({
        user: document.querySelector('#inputUsername')?.value,
        password: document.querySelector('#inputPassword')?.value,
    });
};

const handleAnonymousSignIn = (event) => {
    event.preventDefault();
    authenticateUser({ user: '', password: '' });
};

const handleLogoff = async (event) => {
    event.preventDefault();

    try {
        const response = await fetch('/api/captiveportal/access/logoff/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: new URLSearchParams({ user: '', password: '' })
        });

        if (!response.ok) {
            throw new Error(`Logoff request failed: ${response.status}`);
        }

        await response.json();
        window.location.reload();
    } catch {
        $.connectionFailed();
    }
};

const authenticateUser = async (credentials) => {
    let data;

    try {
        const response = await fetch('/api/captiveportal/access/logon/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: new URLSearchParams(credentials)
        });

        if (!response.ok) {
            throw new Error(`Authentication request failed: ${response.status}`);
        }

        data = await response.json();
    } catch {
        $.connectionFailed();
        return;
    }

    $.clientInfo(data);
    $.connectionLogon(data);
};

const setupRulesLink = () => {
    document.querySelectorAll('[id^="rules"].link').forEach(link => {
        link.addEventListener('click', $.showRules);
    });
};

const checkConnectionStatus = async () => {
    let data;

    try {
        const response = await fetch('/api/captiveportal/access/status/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: new URLSearchParams({
                user: document.querySelector('#inputUsername')?.value ?? '',
                password: document.querySelector('#inputPassword')?.value ?? ''
            })
        });

        if (!response.ok) {
            throw new Error(`Connection status request failed: ${response.status}`);
        }

        data = await response.json();
    } catch {
        setTimeout($.connectionFailed, 1000);
        return;
    }

    $.clientInfo(data);
    $.connectionStatus(data);
};
