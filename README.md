# Oppijanumerorekisteri

## Technologies & Frameworks

Below is non-exhaustive list of the key technologies & frameworks used in the project.

### Backend

* Spring Boot
* Spring Security (CAS)
* Postgresql
* QueryDSL
* JPA / Hibernate5
* Flyway
* Orika
* Lombok
* Swagger
* DB-scheduler
* JSONPath

## Vaatimukset
- PostgreSQL 10.6
- Java 11
- Maven 3.6

## Rakenne
### oppijanumerorekisteri
Main
### oppijanumerorekisteri-api
Rajapintojen palauttamat luokat kuten DTO:t ja enumeraatiot. **Tänne ei riippuvuuksia muihin API-moduuleihin**
### oppijanumerorekisteri-domain
Domain model
### oppijanumerorekisteri-service
Palvelinpuoli

## Kääntäminen

    mvn clean install

## Tietokanta

    docker run --name oppijanumerorekisteri-db -p 5432:5432 -e POSTGRES_USER=oph -e POSTGRES_PASSWORD=oph -e POSTGRES_DB=oppijanumerorekisteri -d postgres:10.6

## Ajaminen

    java -jar oppijanumerorekisteri-service/target/oppijanumerorekisteri-service-<versio>.jar

Ilman parametreja sovellus käyttää [application.yml](oppijanumerorekisteri-service/src/main/resources/application.yml)
-tiedoston mukaisia oletuskonfiguraatioita. Tavallisesti tämä ei toimi, koska yhteyttä vaadittuihin palveluihin ei saada, joten palveluiden sijainti tulee uudelleenmääritellä.

Konfiguraatioiden muuttaminen komentoriviparametreilla (baseUrl-parametrilla määritellään missä osoitteessa muut
sovelluksen käyttämät palvelut sijaitsevat):

    java -DbaseUrl=https://<testiympäristö_host> \
        -Dspring.datasource.username=<tietokannan_tunnus> \
        -Dspring.datasource.password=<tietokannan_salasana> \
        -Dauthentication.default.username=<oma_virkailija_tunnus> \
        -Dauthentication.default.password=<oma_virkailija_salasana> \
        -jar oppijanumerorekisteri-service/target/oppijanumerorekisteri-service-<versio>.jar

Helpointa on osoittaa `oppijanumerorekisteri-service` käyttämään palveluita esim. dev- tai test-ympäristöstä (esim. `https://virkailija.untuvaopintopolku.fi`). Huomaa, että palveluita varten tulee määritellä myös tunnus ja salasana (ks. yllä).

Kaikki paitsi baseUrl-konfiguraatio on myös mahdollista laittaa erilliseen tiedostoon:

```yaml
spring.datasource.username: <tietokannan_tunnus>
spring.datasource.password: <tietokannan_salasana>
authentication.default.username: <oma_virkailija_tunnus>
authentication.default.password: <oma_virkailija_salasana>
```

...jolloin ajaminen:

    java -jar oppijanumerorekisteri-service/target/oppijanumerorekisteri-service-0.1.2-SNAPSHOT.jar \
        -DbaseUrl=https://<testiympäristö_host> \
        -Dspring.config.additional-location=<path/to/configfile>/oppijanumerorekisteri.yml

Palvelu löytyy käynnistymisen jälkeen osoitteesta <http://localhost:8080/oppijanumerorekisteri-service>.

### Ajaminen lokaalisti dev-moodissa

_Tämä ei ole tällä hetkellä yleensä käytetty kehitystapa_

1) Hae `oppijanumerorekisteri.yml`-tiedosto EC2-kontilta ja vie se haluamaasi hakemistoon.
2) Käännä projekti komennolla `mvn clean install` projektin juurihakemistossa (voi käyttää myös projektin mukana tullutta `mvnw.cmd/mvnw clean install`)
3) Aja projekti lokaalisti `mvn spring-boot:run "-Drun.jvmArguments=-Dspring.profiles.active=dev -Dspring.config.additional-location=<path/to/configfile>/oppijanumerorekisteri.yml"`

IntelliJ ei osaa sulkea spring-boot:run ajettua tomcattia oikein. Kannattaa siis tehdä spring-boot ajokonfiguraatio `OppijanumerorekisteriServiceApplication.java`-tiedostolle seuraavilla VM Options:lla `-Dspring.profiles.active=dev -Dspring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml`

Vaihtoehtoisesti voidaan ajaa kohdan 3 tavalla suoraan komentorivillä tai alla olevan esimerkin tavoin suoraan javan kautta: 

`java -jar oppijanumerorekisteri-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml`

Huom! Valitse tunnukseksi jonkin luokalla olevan käyttäjän OID. Tällöin oidia kysyvät rajapinnat toimivat oikein.

## Lombok
Käytössä on lombok joten IDE tarvitsee pluginin ymmärtääkseen tämän annotaatioita.

## Url.properties ja CSRF
Aina ulkoisia riippuvuuksia lisättäessä lisättävä osoite url.properties:iin
https://github.com/Opetushallitus/java-utils/tree/master/java-properties

Näiden hakemiseen käytetään httpclient:ia jos CAS autentikointia ei tarvita
https://github.com/Opetushallitus/java-utils/tree/master/httpclient

Jos CAS autentikointia tarvitaan on käytettävä muuta clientia.

## Auditlokitus
Koska käsitellään henkilötietoja kaikki servicekutsut lokitetaan alla olevan projektin mukaisesti
https://github.com/Opetushallitus/auditlogger

Muutokset laitetaan oppijanumerorekisterin omaan pakettiin 
https://github.com/Opetushallitus/auditlogger/tree/master/src/main/java/fi/vm/sade/auditlog/oppijanumerorekisteri

## Lokitus
Normaalissa kehityskäytössä lokitetaan vain konsoliin. Jos kehitysympäristössä tai muissa ympäristöissä halutaan lokittaa tiedostoon on sovellukselle annettava polku `logback.xml`-tiedostoon. Tällöin ajokomento voi näyttää esimerkiksi seuraavanlaiselta: 
`java -jar oppijanumerorekisteri-service-<versio>.jar --spring.profiles.active=dev --spring.config.additional-location=C:\Users\username\oph-configuration\oppijanumerorekisteri.yml -Dlogging.config=file:C:\Users\username\oph-configuration\logback.xml`

## Apidokumentaatio
Rest API on dokumentoitu swaggerin avulla ja löytyy osoitteesta https://virkailija.opintopolku.fi/oppijanumerorekisteri-service/swagger-ui.html
