const trimTrailingSlash = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    return value.replace(/\/+$/, '');
};

const firstDefined = (...values) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return trimTrailingSlash(value.trim());
        }
    }
    return '';
};

const USER_SERVICE_FALLBACK = 'http://127.0.0.1:5001';
const STORE_SERVICE_FALLBACK = 'http://127.0.0.1:5002';
const USER_SERVICE_DEV_PROXY_PATH = '/user-api';
const STORE_SERVICE_DEV_PROXY_PATH = '/store-api';

export const getUserServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_USER_SERVICE_PROXY_PATH,
            USER_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        import.meta.env.VITE_USER_SERVICE_URL,
        import.meta.env.VITE_USER_SERVICE_URL_LOCAL,
        USER_SERVICE_FALLBACK
    );
};

export const getStoreServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_STORE_SERVICE_PROXY_PATH,
            STORE_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        import.meta.env.VITE_STORE_SERVICE_URL,
        import.meta.env.VITE_STORE_SERVICE_URL_LOCAL,
        STORE_SERVICE_FALLBACK
    );
};
