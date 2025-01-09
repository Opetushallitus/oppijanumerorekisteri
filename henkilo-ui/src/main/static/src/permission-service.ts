const queryParameters = new URLSearchParams(window.location.search);
const externalPermissionService = queryParameters.get('permissionCheckService');

export const permissionServiceHeaders = externalPermissionService
    ? { 'External-Permission-Service': externalPermissionService }
    : {};
