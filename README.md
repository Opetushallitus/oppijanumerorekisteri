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

Vaihtoehtoisesti voidaan ajaa kohdan 3 tavalla suoraan komentorivillä tai alla olevan esimerkin tavoin suoraan javan kautta: 

`java -jar oppijanumerorekisteri-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.location=C:\Users\pryhanen\oph-configuration\oppijanumerorekisteri.yml`

## Lokaalin CAS palvelimen kanssa
1) Hae luokalta `authentication`-projektin `common.properties`-tiedosto ja lisää se omaan oph-configuration-hakemistoosi nimellä `cas.properties`
2) Käännä authentication projecti `mvn clean package`
3) Kopioi `cas/target/cas-9.3-SNAPSHOT.war` tomcatin oletuskansioon `webapps` tai määrittämääsi kansioon ja uudelleennimeä se `cas.war`
4) Aja tomcat `startup.bat` / `startup.sh`
5) Muuta oppijanumerorekisterin lokaali konfiguraatiosi alla olevat kentät
```yaml
cas:
  service: http://localhost:8180/oppijanumerorekisteri-service
  url: http://localhost:8080/cas
server:
  port: 8180
```
5) Aja oppijanumerorekisteri
