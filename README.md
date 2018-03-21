# Oppijanumerorekisteri

## Vaatimukset
- Java 1.8.0_92 (ei toiminut 1.8.0_60)
- Maven 3.3

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
3) Aja projekti lokaalisti `mvn spring-boot:run "-Drun.jvmArguments=-Dspring.profiles.active=dev -Dspring.config.additional-location=<path/to/configfile>/oppijanumerorekisteri.yml"`

IntelliJ ei osaa sulkea spring-boot:run ajettua tomcattia oikein. Kannattaa siis tehdä spring-boot ajokonfiguraatio `OppijanumerorekisteriServiceApplication.java`-tiedostolle seuraavilla VM Options:lla `-Dspring.profiles.active=dev -Dspring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml`

Vaihtoehtoisesti voidaan ajaa kohdan 3 tavalla suoraan komentorivillä tai alla olevan esimerkin tavoin suoraan javan kautta: 

`java -jar oppijanumerorekisteri-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml`

Huom! Valitse tunnukseksi jonkin luokalla olevan käyttäjän OID. Tällöin oidia kysyvät rajapinnat toimivat oikein.

### Lombok
Käytössä on lombok joten IDE tarvitsee pluginin ymmärtääkseen tämän annotaatioita.

## Lokaalin CAS palvelimen kanssa
1) Hae luokalta `authentication`-projektin `common.properties`-tiedosto ja lisää se omaan oph-configuration-hakemistoosi nimellä `cas.properties`
2) Käännä authentication projecti `mvn clean package`
3) Kopioi `cas/target/cas-9.3-SNAPSHOT.war` tomcatin oletuskansioon `webapps` tai määrittämääsi kansioon ja uudelleennimeä se `cas.war`
4) Aja tomcat `startup.bat` / `startup.sh`
5) Muuta oppijanumerorekisterin lokaali konfiguraatiosi alla olevat kentät
```yaml
cas:
  service: http://localhost:8180/oppijanumerorekisteri-service
server:
  port: 8180
```
5) Aja oppijanumerorekisteri

`java -Dcas.baseUrl=http://localhost:8080 -jar oppijanumerorekisteri-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml`

## Url.properties ja CSRF
Aina ulkoisia riippuvuuksia lisättäessä lisättävä osoite url.properties:iin
https://github.com/Opetushallitus/java-utils/tree/master/java-properties

Näiden hakemiseen käytetään httpclient:ia jos CAS autentikointia ei tarvita
https://github.com/Opetushallitus/java-utils/tree/master/httpclient

Jos CAS autentikointia tarvitaa on käytettävä muuta clientia.

## Auditlokitus
Koska käsitellään henkilötietoja kaikki servicekutsut lokitetaan alla olevan projektin mukaisesti
https://github.com/Opetushallitus/auditlogger

Muutokset laitetaan oppijanumerorekisterin omaan pakettiin 
https://github.com/Opetushallitus/auditlogger/tree/master/src/main/java/fi/vm/sade/auditlog/oppijanumerorekisteri

## Lokitus
Normaalissa kehityskäytössä lokitetaan vain konsoliin. Jos kehitysympäristössä tai muissa ympäristöissä halutaan lokittaa tiedostoon on sovellukselle annettava polku `logback.xml`-tiedostoon. Tällöin ajokomento voi näyttää esimerkiksi seuraavanlaiselta: 
`java -jar oppijanumerorekisteri-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml -Dlogging.config=file:C:\Users\username\oph-configuration\logback.xml`

## Apidokumentaatio
Rest API on dokumentoitu swaggerin avulla ja löytyy osoitteesta https://virkailija.opintopolku.fi/oppijanumerorekisteri-service/swagger-ui.html