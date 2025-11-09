declare global {
    interface Window {
        __RUNTIME_CONFIG__: {
            GITHUB_TOKEN: string;
        };
    }
}

export const getRuntimeConfig = () => {
    return {
        GITHUB_TOKEN: window.__RUNTIME_CONFIG__?.GITHUB_TOKEN || import.meta.env.VITE_GITHUB_TOKEN
    };
};