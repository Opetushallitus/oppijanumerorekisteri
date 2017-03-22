import fetch from 'isomorphic-fetch'

export const http = {
    get: (url) => fetch(url, {credentials: 'include', mode: 'cors'})
        .then(response => response.json()),
    delete: (url) => fetch(url, {method: 'DELETE', credentials: 'include', mode: 'cors'})
        .then(response => response.json()),
};

