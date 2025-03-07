# Henkilö UI

Spring-boot backend that just serves html files and static assets. The frontend is a React app. Playwright tests with manually maintained [mocked API responses](src/main/static/mock-api/) from other Opintopolku microservices.

## Frontend app

React with Redux (with an ongoing Redux Toolkit refactoring project). The React app has two separate bundles `main` and `kayttaja` as it servers both users with a CAS session (`main`) and users without a session (`kayttaja`). The sessionful SPA fetches a lot of stuff regarding the user and access rights on page load while the sessionless mostly needs just translations.

## Local env

Don't bother with the Java backend. Run Webpack dev server with the script mentioned below. The script starts the webapp as well as an nginx server to proxy requests outside of the React app to a real Opintopolku test environment (testiopintopolku.fi by default).

### Prerequisites

Install
- node 20
- docker
- tmux

Install npm dependencies e.g. `cd src/main/static; nvm use 20; npm install`

### Setup

1. Run `./start-local-env.sh` in project root
2. Login at http://localhost:8080

### Approach

![deployment](http://www.plantuml.com/plantuml/png/JOr1RiKW34JtdC9YpmMwg7AFgWiALa41cnf8qjj_-0fIDcW6pvlPQhFIUaxAkiO2lQ8enxam8JMWtqZNmv_uKwpRmLRGItiyO507YbOkSVUWnnScBdaYI4SKfgdrvBW4fUOC6CydcSzxvFt2iAlt0tH0scDYqoC8_dMihUexkE1HDvCs9U0MK1x1LMI-lAq1_VVQci0w5k7hNwiDoVUSNW00)

[//]: # (image source: http://www.plantuml.com/plantuml/uml/JOr1RiKW34JtdC9YpmMwg7AFgWiALa41cnf8qjj_-0fIDcW6pvlPQhFIUaxAkiO2lQ8enxam8JMWtqZNmv_uKwpRmLRGItiyO507YbOkSVUWnnScBdaYI4SKfgdrvBW4fUOC6CydcSzxvFt2iAlt0tH0scDYqoC8_dMihUexkE1HDvCs9U0MK1x1LMI-lAq1_VVQci0w5k7hNwiDoVUSNW00)

- UI Access via nginx proxy
- henkilo-ui requests proxied to local webpack dev server
- All other requests proxied to selected development environment (see [nginx.conf](nginx/nginx.conf))

### Troubleshooting

#### I seem to be logged in as some strange "Varius Strabo" guy

Just hard-reload the page. This is a feature of other part of the whole. Authentication is not properly
picked up by _virkailija raamit_ component.

#### There is something wrong with docker

Nginx needs to access services in host machine. Some platforms (mac, win) has made this easy by adding
virtual domain name _host.docker.internal_ which resolves to host address.

_host.docker.internal_ can be replaced by IP address of the host or by some other clever trick.

#### I want to connect to different development environment

Go through [nginx.conf](nginx/nginx.conf) and replace all references to development environment with the desired one.
Restart nginx. Delete cookies. Try again.
