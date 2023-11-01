# Henkilö UI

Spring-boot backend that serves a React frontend app. Playwright tests with [mocked API responses](src/main/static/mock-api/).

## Local env

Don't bother with the java backend. Run webpack dev server with the script mentioned below.

### Prerequisites

Install
- node 18
- docker
- tmux

Install npm dependencies e.g. `cd src/main/static; nvm use 18; npm install`

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
