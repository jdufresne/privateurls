const redirectUrls = [
    {
        'host': 'google',
        'path': '/url',
        'param': 'url',
    },
    {
        'host': 'slack-redir',
        'path': '/link',
        'param': 'url',
    },
];

function resolveRedirectUrls(url) {
    let modified = false;
    let run = true;
    while (run) {
        const parts = url.hostname.split('.');
        const host = parts[parts.length - 2];
        for (let redirectUrl of redirectUrls) {
            if (redirectUrl.host === host && redirectUrl.path === url.pathname) {
                const newUrl = url.searchParams.get(redirectUrl.param);
                if (newUrl) {
                    url = new URL(newUrl);
                    modified = true;
                    continue;
                }
            }
        }
        run = false;
    }

    return modified ? url : null;
}


const patterns = [
    new RegExp('^utm_'),
];

function stripParams(url) {
    let modified = false;
    const newParams = new URLSearchParams(url.searchParams);
    for (let param of url.searchParams.keys()) {
        for (let re of patterns) {
            if (param.match(re)) {
                newParams.delete(param);
                modified = true;
            }
        }
    }

    let newUrl = null;
    if (modified) {
        newUrl = new URL(url.href);
        newUrl.search = newParams.toString();
    }
    return newUrl;
}


function rewriteUrl(details) {
    const modifiers = [
        resolveRedirectUrls,
        stripParams,
    ];

    let modified = false;
    let url = new URL(details.url);
    for (let modifier of modifiers) {
        const newUrl = modifier(url);
        if (newUrl) {
            url = newUrl;
            modified = true;
        }
    }

    const result = {};
    if (modified) {
        result.redirectUrl = url.href;
    }
    return result;
}


browser.webRequest.onBeforeRequest.addListener(
    rewriteUrl,
    {urls: ['<all_urls>']},
    ['blocking']
);
