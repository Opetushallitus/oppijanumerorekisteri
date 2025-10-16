import Cookies from 'universal-cookie';

const cookies = new Cookies();
const queryParameters = new URLSearchParams(window.location.search);
const externalPermissionService = queryParameters.get('permissionCheckService');

export const permissionServiceHeaders = externalPermissionService
    ? { 'External-Permission-Service': externalPermissionService }
    : {};

export const getCommonOptions: () => RequestInit = () => ({
    mode: 'cors',
    headers: {
        'Caller-Id': '1.2.246.562.10.00000000001.henkilo-ui',
        CSRF: cookies.get('CSRF'),
        ...permissionServiceHeaders,
    },
    credentials: 'include',
});
