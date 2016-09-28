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
1) Hae `oppijanumerorekisteri.yml`-tiedosto luokalta ja vie se haluamaasi hakemistoon.
2) Käännä projekti komennolla `mvn clean install` projektin juurihakemistossa (voi käyttää myös projektin mukana tullutta `mvnw.cmd/mvnw clean install`)
3) Aja projekti lokaalisti `mvn spring-boot:run "-Drun.jvmArguments=-Dspring.profiles.active=dev -Dspring.config.location=<path/to/configfile>/oppijanumerorekisteri.yml"`

IntelliJ ei osaa sulkea spring-boot:run ajettua tomcattia oikein. Kannattaa siis tehdä spring-boot ajokonfiguraatio `OppijanumerorekisteriServiceApplication.java`-tiedostolle seuraavilla VM Options:lla `-Dspring.profiles.active=dev -Dspring.config.location=C:\Users\pryhanen\oph-configuration\oppijanumerorekisteri.yml`

Vaihtoehtoisesti voidaan ajaa kohdan 3 tavalla komentorivillä.
