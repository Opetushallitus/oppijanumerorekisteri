import fetch from 'isomorphic-fetch';
import PropertySingleton from './globals/PropertySingleton';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const parseResponseBody = (response) => {
    return new Promise((resolve) =>
        (response.headers.get('content-type') &&
        response.headers.get('content-type').toLowerCase().startsWith('application/json')
            ? response.json()
            : response.text()
        ).then((data) =>
            resolve({
                status: response.status,
                ok: response.ok,
                data,
            })
        )
    );
};

const resolveResponse = (response, resolve, reject) => {
    if (response.ok) {
        return resolve(response.data);
    }
    // extract the error from the server's json
    return reject(response.data);
};

const resolveResponseWithStatus = (response, resolve, reject) => {
    if (response.ok) {
        return resolve([response.data, response.status]);
    }
    // extract the error from the server's json
    return reject([response.data, response.status]);
};

const getCommonOptions = () => ({
    mode: 'cors',
    headers: {
        'Caller-Id': '1.2.246.562.10.00000000001.henkilo-ui',
        'External-Permission-Service': PropertySingleton.getState().externalPermissionService || '',
        CSRF: cookies.get('CSRF'),
    },
    credentials: 'include',
});

// externalPermissionService header is required only for users not having access through
// normal privilege group but from SURE/HAKU
export const http = {
    get: <T>(url: string) =>
        new Promise<T>((resolve, reject) =>
            fetch(url, {
                ...getCommonOptions(),
            })
                .then(parseResponseBody)
                .then((response: T) => resolveResponse(response, resolve, reject))
                .catch((error) => reject({ networkError: error.message }))
        ),
    delete: <T>(url: string) =>
        new Promise<T>((resolve, reject) =>
            fetch(url, {
                ...getCommonOptions(),
                method: 'DELETE',
            })
                .then(parseResponseBody)
                .then((response: T) => resolveResponse(response, resolve, reject))
                .catch((error) => reject({ networkError: error.message }))
        ),
    put: <T>(url: string, payload?: any) =>
        new Promise<T>((resolve, reject) =>
            fetch(url, {
                ...getCommonOptions(),
                method: 'PUT',
                body: JSON.stringify(payload),
                headers: {
                    ...getCommonOptions().headers,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            })
                .then(parseResponseBody)
                .then((response: T) => resolveResponse(response, resolve, reject))
                .catch((error) => reject({ networkError: error.message }))
        ),
    post: <T>(url: string, payload?: any) =>
        new Promise<T>((resolve, reject) =>
            fetch(url, {
                ...getCommonOptions(),
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    ...getCommonOptions().headers,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            })
                .then(parseResponseBody)
                .then((response: T) => resolveResponse(response, resolve, reject))
                .catch((error) => reject({ networkError: error.message }))
        ),
};

export const httpWithStatus = {
    post: <T>(url: string, payload?: any): Promise<[T, number]> =>
        new Promise<[T, number]>((resolve, reject) =>
            fetch(url, {
                ...getCommonOptions(),
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    ...getCommonOptions().headers,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            })
                .then(parseResponseBody)
                .then((response: T) => resolveResponseWithStatus(response, resolve, reject))
                .catch((error) => reject({ networkError: error.message }))
        ),
};
