import fetch from 'isomorphic-fetch'

const parseResponse = response => {
    if(response.status < 300) {
        if(response.headers.get('content-type').toLowerCase().startsWith('application/json')) {
            return response.json();
        }
        return response.text();
    }
    throw response;
};

export const http = {
    get: (url) => fetch(url, {credentials: 'include', mode: 'cors',})
        .then(parseResponse),
    delete: (url) => fetch(url, {method: 'DELETE', credentials: 'include', mode: 'cors',})
        .then(response => response.json()),
    put: (url, payload) => fetch(url, {
        credentials: 'include',
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
    }).then(response => response.text()),
    post: (url, payload) => fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
    }).then(response => response.json()),
};
