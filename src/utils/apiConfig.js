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

export const getUserServiceUrl = () => firstDefined(
    import.meta.env.VITE_USER_SERVICE_URL_LOCAL,
    import.meta.env.VITE_USER_SERVICE_URL,
    USER_SERVICE_FALLBACK
);

export const getStoreServiceUrl = () => firstDefined(
    import.meta.env.VITE_STORE_SERVICE_URL_LOCAL,
    import.meta.env.VITE_STORE_SERVICE_URL,
    STORE_SERVICE_FALLBACK
);
