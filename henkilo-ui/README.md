# Henkilö UI

## Teknologiat
* Java 8
* Spring Boot
* Maven 3
* React
* Redux
* ES6

## Ennakkovaatimukset
* Asennettu Java 8
* henkiloui.yml (löytyy integraatiopalvelimelta tai kysy muilta kehittäjiltä)
  * Lisää front propertyt esim. seuraavasti:
  ```
  front:
    kayttooikeus:
      baseUrl: http://localhost:<port>
    lokalisointi:
      baseUrl: http://localhost:<port>
    organisaatio:
      baseUrl: http://localhost:<port>
    koodisto:
      baseUrl: http://localhost:<port>
  ```
  * Näihin voi myös laittaa integraatiopalvelimen osoitteen kehittäjän tarpeista riippuen

## Backend

### Kääntäminen:
`mvn clean install`

Tämä ajaa testit ja luo 

### Ajaminen:
Idea: SpringBoot VMOptions `-Dspring.profiles.active=dev -Dspring.config.location=<path-to-local-henkiloui.yml>/henkiloui.yml` 
JAR:  `java -jar target\henkiloui-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.location=<path-to-local-henkiloui.yml>/henkiloui.yml`

## Frontend
Voidaan käyttää suoraan backendin kautta mutta kehityksessä on parempi käyttää webpack-dev-server:iä seuraavasti:

`npm install`

`npm start`
