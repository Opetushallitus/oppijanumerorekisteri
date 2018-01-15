import fetch from 'isomorphic-fetch'
import PropertySingleton from './globals/PropertySingleton'

const parseResponseBody = (response) => {
    return new Promise((resolve) => ((response.headers.get('content-type')
        && response.headers.get('content-type').toLowerCase().startsWith('application/json'))
        ? response.json()
        : response.text())
        .then((data) => resolve({
            status: response.status,
            ok: response.ok,
            data,
        })));
};

const resolveResponse = (response, resolve, reject) => {
    if (response.ok) {
        return resolve(response.data);
    }
    // extract the error from the server's json
    return reject(response.data);
};

const getCommonOptions = () => ({
    mode: 'cors',
    headers: {
        "External-Permission-Service": PropertySingleton.getState().externalPermissionService || '',
    },
    credentials: 'include',
});

// externalPermissionService header is required only for users not having access through
// normal privilege group but from SURE/HAKU
export const http = {
    get: (url) => new Promise((resolve, reject) => fetch(url, {
        ...getCommonOptions(),
        }).then(parseResponseBody)
        .then((response) => resolveResponse(response, resolve, reject))
        .catch((error) => reject({networkError: error.message,}))
    ),
    delete: (url) => new Promise((resolve, reject) => fetch(url, {
        ...getCommonOptions(),
        method: 'DELETE',
        }).then(parseResponseBody)
        .then((response) => resolveResponse(response, resolve, reject))
        .catch((error) => reject({networkError: error.message,}))
    ),
    put: (url, payload) => new Promise((resolve, reject) => fetch(url, {
        ...getCommonOptions(),
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
            ...getCommonOptions().headers,
            'Content-Type': 'application/json; charset=utf-8',
        },
        }).then(parseResponseBody)
        .then((response) => resolveResponse(response, resolve, reject))
        .catch((error) => reject({networkError: error.message,}))
    ),
    post: (url, payload) => new Promise((resolve, reject) => fetch(url, {
        ...getCommonOptions(),
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            ...getCommonOptions().headers,
            'Content-Type': 'application/json; charset=utf-8',
        },
        }).then(parseResponseBody)
        .then((response) => resolveResponse(response, resolve, reject))
        .catch((error) => reject({networkError: error.message,}))
    ),
};
