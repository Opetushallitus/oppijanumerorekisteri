# Easy local development environment setup

*How I Learned to Stop Worrying and Love the Bomb*

## Purpose

To get local development environment up and running with minimal hassle

Want:
* Minimal configuration
* Fast feedback loop (e.g. webpack hot reload)
* By-pass any CORS issues

## Prerequisites 

* JDK 
* Maven
* Docker
* docker-compose

## Approach

![deployment](http://www.plantuml.com/plantuml/png/JOv1JiGm34NtFeMNi8ZOiwX6uW18S8AaCTDeKZiu3fsvFP6cKRlqzt_FlbJpQctDCCjQX8aDWyfMIK_9Hg7u-NPA-9huVffhqSJN868mPsaH6rlxym2x3DqqBFYEYnWgPV4HOAHkUahxkgZS7xtmswXQnPVmABvM_FZy-du5UBPSb8qxSnpkeC_vm7v4yMqXlgKihgN1JVjhUrri8HqGN8XZM_C_)

* Access UI via webpack dev server (fast feedback loop)
* Webpack dev server proxies requests to local nginx (by-pass CORS)
* nginx proxy divide requests to local backend or selected dev environment (utilize existing services @ untuva)
* spring-boot is run with minimal configuration settings (default settings hit local nginx proxy)  

## Spring-boot configuration

One needs to build runnable jar before trying to start up the application:
```
mvn install
```

Setup expects spring-boot application to be run on port 8081.
```
-Dserver.port=8081
```
Spring-boot needs to use **dev** profile
```
-Dspring.profiles.active=dev
```
Following config is required by application and needs to be found from environment
```
host.host-cas=virkailija.untuvaopintopolku.fi
host.host-virkailija=virkailija.untuvaopintopolku.fi
host.host-shibboleth=*whatever*
henkiloui.palvelukayttajat.lokalisointi.kayttajatunnus=*proper username*
henkiloui.palvelukayttajat.lokalisointi.salasana=*proper passwd*
```
Thus example command line would be:
```
java
    -Dserver.port=8081
    -Dspring.profiles.active=dev
    -Dhost.host-cas=virkailija.untuvaopintopolku.fi
    -Dhost.host-virkailija=virkailija.untuvaopintopolku.fi
    -Dhost.host-shibboleth=''
    -Dhenkiloui.palvelukayttajat.lokalisointi.kayttajatunnus=user
    -Dhenkiloui.palvelukayttajat.lokalisointi.salasana=pass
    -jar target/henkiloui-0.0.1-SNAPSHOT.jar
```

Of course this is probably easier to manage via IDE of choice, good luck setting that up.

## Steps

1. Run spring boot application with minimal configuration
2. Start local nginx with `cd nginx && docker-compose up`
3. Start webpack-dev-server `cd src/main/static && npm start`
4. Access nginx proxy to login http://localhost:8080
5. Now one should be able to use webpack-dev-server http://localhost:3000

## Troubleshooting

### There is something wrong with docker

Nginx needs to access services in host machine. Some platforms (mac, win) has made this easy by adding
virtual domain name *host.docker.internal* which resolves to host address.

*host.docker.internal* can be replaced by IP address of the host or by some other clever trick. 

### Cannot access API

Login flow is quite delicate and may break easily. Usually one may have multiple overlapping `JSESSIONID` cookies. 
1. Breath.
2. Close all tabs having UI open. 
3. Open http://localhost:8080 
4. Open Application tab in devtools and delete all cookies 
5. Reload 
6. Login
7. Rock'n roll
 
