import fetch from 'isomorphic-fetch'

export const http = {
    get: (url) => fetch(url, {credentials: 'include', mode: 'cors',})
        .then(response => response.json()),
    delete: (url) => fetch(url, {method: 'DELETE', credentials: 'include', mode: 'cors',})
        .then(response => response.json()),
    put: (url, entity) => fetch(url, {
        credentials: 'include',
        method: 'PUT',
        body: JSON.stringify(entity),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
    }).then(response => response.text()),
    post: (url, entity) => fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(entity),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
    }).then(response => response.json()),
};
