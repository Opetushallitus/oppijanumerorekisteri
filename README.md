# Oppijanumerorekisteri

## Rakenne
### oppijanumerorekisteri
Main
### oppijanumerorekisteri-api
Rajapintojen palauttamat luokat kuten DTO:t ja enumeraatiot
### oppijanumerorekisteri-domain
Domain model
### oppijanumerorekisteri-service
Palvelinpuoli

## Ajaminen lokaalisti
1) Hae `oppijanumerorekisteri-service.properties`-tiedosto luokalta (nimellä `common.properties`) ja vie se kotihakemistosi `oph-configuration`-kansioon.
2) Käännä projekti komennolla `mvn clean install` projektin juurihakemistossa (voi käyttää myös projektin mukana tullutta `mvnw.cmd/mvnw clean install`)
3) Aja projekti lokaalisti `mvn spring-boot:run -Dspring.profiles.active=dev` kansiossa `oppijanumerorekisteri-service`
