import fetch from 'isomorphic-fetch'

const parseResponse = response => {
    if(response.status < 300) {
        if(response.headers.get('content-type') && response.headers.get('content-type').toLowerCase().startsWith('application/json')) {
            return response.json();
        }
        return response.text();
    }
    throw response;
};

// externalPermissionService header is required only for users not having access through
// normal privilege group but from SURE/HAKU
export const http = {
    get: (url) => fetch(url, {
        credentials: 'include',
        mode: 'cors',
        headers: {
            "External-Permission-Service": window.externalPermissionService ? window.externalPermissionService : '',
        },
    }).then(parseResponse),
    delete: (url, externalPermissionService) => fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
        headers: {
            "External-Permission-Service": window.externalPermissionService ? window.externalPermissionService : '',
        },
    }).then(parseResponse),
    put: (url, payload, externalPermissionService) => fetch(url, {
        credentials: 'include',
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            "External-Permission-Service": window.externalPermissionService ? window.externalPermissionService : '',
        },
        mode: 'cors',
    }).then(parseResponse),
    post: (url, payload, externalPermissionService) => fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            "External-Permission-Service": window.externalPermissionService ? window.externalPermissionService : '',
        },
        mode: 'cors',
    }).then(parseResponse),

};
