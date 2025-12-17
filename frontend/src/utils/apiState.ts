// TODO : 인증에 그냥 통합

let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
    isLoggingOut = value;
};

export const getIsLoggingOut = (): boolean => {
    return isLoggingOut;
};
