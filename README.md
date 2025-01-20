# Oppijanumerorekisteri

## Technologies & Frameworks

Below is non-exhaustive list of the key technologies & frameworks used in the project.

### Backend

* Spring Boot
* Spring Security (CAS)
* Postgresql
* QueryDSL
* JPA / Hibernate
* Flyway
* Orika
* Lombok
* Swagger
* DB-scheduler
* JSONPath

## Rakenne
### oppijanumerorekisteri
Main
### oppijanumerorekisteri-api
Rajapintojen palauttamat luokat kuten DTO:t ja enumeraatiot. **Tänne ei riippuvuuksia muihin API-moduuleihin**
### oppijanumerorekisteri-service
Palvelinpuoli

## Ajaminen

```bash
./start-local-env.sh
```

### Vaatimukset

* tmux
* mvn
* Docker
* Java 21

## Auditlokitus
Koska käsitellään henkilötietoja kaikki servicekutsut lokitetaan alla olevan projektin mukaisesti
https://github.com/Opetushallitus/auditlogger

## Apidokumentaatio
Rest API on dokumentoitu swaggerin avulla ja löytyy osoitteesta https://virkailija.opintopolku.fi/oppijanumerorekisteri-service/swagger-ui/
