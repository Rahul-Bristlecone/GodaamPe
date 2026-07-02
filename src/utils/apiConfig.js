const trimTrailingSlash = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    return value.replace(/\/+$/, '');
};

const getRuntimeConfigValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    const runtimeConfig = window.__APP_CONFIG__;
    if (!runtimeConfig || typeof runtimeConfig !== 'object') {
        return '';
    }

    const value = runtimeConfig[key];
    if (typeof value !== 'string') {
        return '';
    }

    return trimTrailingSlash(value.trim());
};

const firstDefined = (...values) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return trimTrailingSlash(value.trim());
        }
    }
    return '';
};

const USER_SERVICE_FALLBACK = '/user-api';
const STORE_SERVICE_FALLBACK = '/store-api';
const PRODUCT_SERVICE_FALLBACK = '/product-api';
const ABS_CONFIG_SERVICE_FALLBACK = '/config-api';
const COMPANY_SERVICE_FALLBACK = '/company-api';
const CUSTOMER_SERVICE_FALLBACK = '/customer-api';
const ORDER_SERVICE_FALLBACK = '/order-api';
const USER_SERVICE_DEV_PROXY_PATH = '/user-api';
const STORE_SERVICE_DEV_PROXY_PATH = '/store-api';
const PRODUCT_SERVICE_DEV_PROXY_PATH = '/product-api';
const ABS_CONFIG_SERVICE_DEV_PROXY_PATH = '/config-api';
const COMPANY_SERVICE_DEV_PROXY_PATH = '/company-api';
const CUSTOMER_SERVICE_DEV_PROXY_PATH = '/customer-api';
const ORDER_SERVICE_DEV_PROXY_PATH = '/order-api';


export const getUserServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_USER_SERVICE_PROXY_PATH,
            USER_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('USER_SERVICE_URL'),
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
        getRuntimeConfigValue('STORE_SERVICE_URL'),
        import.meta.env.VITE_STORE_SERVICE_URL,
        import.meta.env.VITE_STORE_SERVICE_URL_LOCAL,
        STORE_SERVICE_FALLBACK
    );
};

export const getProductServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_PRODUCT_SERVICE_PROXY_PATH,
            PRODUCT_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('PRODUCT_SERVICE_URL'),
        import.meta.env.VITE_PRODUCT_SERVICE_URL,
        import.meta.env.VITE_PRODUCT_SERVICE_URL_LOCAL,
        PRODUCT_SERVICE_FALLBACK
    );
};

export const getAbsConfigServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_ABS_CONFIG_SERVICE_PROXY_PATH,
            ABS_CONFIG_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('ABS_CONFIG_SERVICE_URL'),
        import.meta.env.VITE_ABS_CONFIG_SERVICE_URL,
        import.meta.env.VITE_ABS_CONFIG_SERVICE_URL_LOCAL,
        ABS_CONFIG_SERVICE_FALLBACK
    );
};

export const getCompanyServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_COMPANY_SERVICE_PROXY_PATH,
            COMPANY_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('COMPANY_SERVICE_URL'),
        import.meta.env.VITE_COMPANY_SERVICE_URL,
        import.meta.env.VITE_COMPANY_SERVICE_URL_LOCAL,
        COMPANY_SERVICE_FALLBACK
    );
};

export const getCustomerServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_CUSTOMER_SERVICE_PROXY_PATH,
            CUSTOMER_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('CUSTOMER_SERVICE_URL'),
        import.meta.env.VITE_CUSTOMER_SERVICE_URL,
        import.meta.env.VITE_CUSTOMER_SERVICE_URL_LOCAL,
        CUSTOMER_SERVICE_FALLBACK
    );
};

export const getOrderServiceUrl = () => {
    if (import.meta.env.DEV) {
        return firstDefined(
            import.meta.env.VITE_ORDER_SERVICE_PROXY_PATH,
            ORDER_SERVICE_DEV_PROXY_PATH
        );
    }

    return firstDefined(
        getRuntimeConfigValue('ORDER_SERVICE_URL'),
        import.meta.env.VITE_ORDER_SERVICE_URL,
        import.meta.env.VITE_ORDER_SERVICE_URL_LOCAL,
        ORDER_SERVICE_FALLBACK
    );
};
