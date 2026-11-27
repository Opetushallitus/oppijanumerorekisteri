export const getSamlLogoutUrl = () =>
    process.env.CAS_LOGOUT_ENABLED === 'true'
        ? `/cas/logout?service=${encodeURIComponent(window.location.origin)}`
        : '/service-provider-app/saml/logout';
