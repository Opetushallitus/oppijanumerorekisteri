const queryParameters = new URLSearchParams(window.location.search);
const externalPermissionService = queryParameters.get('permissionCheckService');

export const permissionServiceHeaders = externalPermissionService
    ? { 'External-Permission-Service': externalPermissionService }
    : {};

const getCookie = (name: string) => {
    const cookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.substring(name.length + 1);

    if (!cookie) {
        return undefined;
    }

    try {
        return decodeURIComponent(cookie);
    } catch {
        return cookie;
    }
};

export const getCommonOptions: () => RequestInit = () => ({
    mode: 'cors',
    headers: {
        'Caller-Id': '1.2.246.562.10.00000000001.henkilo-ui',
        CSRF: getCookie('CSRF'),
        ...permissionServiceHeaders,
    } as HeadersInit,
    credentials: 'include',
});

type ApiError = { status: number; data: { message: string; errorType?: string } };

export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error != null &&
        'status' in error &&
        typeof error.status === 'number' &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data != null &&
        'message' in error.data &&
        typeof error.data.message === 'string'
    );
}
