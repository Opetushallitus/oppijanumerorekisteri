# Henkilö UI

## Teknologiat
* Java 8
* Spring Boot
* Maven 3
* React
* Redux
* ES6
* NPM 5

## Ennakkovaatimukset
* Asennettu Java 8
* henkiloui.yml (löytyy integraatiopalvelimelta tai kysy muilta kehittäjiltä)
  * Lisää front propertyt esim. seuraavasti:
  ```
  server:
    port: 8280
  front:
    kayttooikeus:
      baseUrl: http://localhost:<port>
    lokalisointi:
      baseUrl: http://localhost:<port>
    organisaatio:
      baseUrl: http://localhost:<port>
    koodisto:
      baseUrl: http://localhost:<port>
    oppijanumerorekisteri:
      baseUrl: http://localhost:<port>
  ```
  * Näihin voi myös laittaa integraatiopalvelimen osoitteen kehittäjän tarpeista riippuen
  * Jos käytät kirjautumista vaativia integraatiopalvelimen rajapintoja muista käydä kirjautumassa sinne ja tarvittaessa avaa dev konsolissa näkyvät linkit erikseen ennen sivun uudelleenpäivitystä!

## Backend

### Kääntäminen:
`mvn clean install`

Tämä ajaa testit ja luo 

### Ajaminen:
Idea: SpringBoot VMOptions `-Dspring.profiles.active=dev -Dspring.config.location=<path-to-local-henkiloui.yml>/henkiloui.yml`

JAR:  `java -jar target/henkiloui-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --spring.config.additional-location=<path-to-local-henkiloui.yml>/henkiloui.yml`

Ui löytyy osoitteesta http://localhost:8280/henkilo-ui/

## Frontend
Voidaan käyttää suoraan backendin kautta mutta kehityksessä on parempi käyttää webpack-dev-server:iä seuraavasti:

`npm install`

`npm run flow-install`

`npm start`


### Flowjs
Voit ajaa tyyppitarkistukset lokaalisti komennolla `npm run flowrun`. Tämä ei kuitenkaa seuraa muutoksia, vaan prosessi päättyy heti ajon jälkeen. Kannattanee asentaa omaan IDEn plugin, joka hoitaa jatkuvan tyyppitarkistuksen.

### Riippuvuudet

Varmista että npm 5 (tai uudempi) on käytössä

`npm --version`

Uuden riippuvuuden lisääminen

`npm install <riippuvuus> --save`

Päivittäminen

`npm install <riippuvuus>@<versio>`

Poistaminen

`npm uninstall <riippuvuus> --save`

Commitoi sekä package.json että package-lock.json -tiedostot.

### CORS
Integraatiopalvelinta vastaan kehitettäessä on käytettävästä 
selaimesta otettava pois käytöstä tietoturva-asetuksia. Myös lokaalisti ajettavaa palvelinta kehitettäessä (eri localhost portti)

<b>Chrome:</b>

Sulje kaikki chrome instanssit ennen seuraavan ajamista.

Linux `$ google-chrome --disable-web-security`

Windows `chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security` 

OSX `$ open -a Google\ Chrome --args --disable-web-security --user-data-dir`

Tämän jälkeen avaa sessio haluttuihin palveluihin integraatiopalvelimelle tekemällä niihin jokin kysely. 

<b>Huom. ei turvallinen selailuun kehityksen aikana! Käytä tällöin rinnalla eri selainta.</b>

## API-dokumentaatio

Rest API on dokumentoitu swaggerin avulla ja löytyy osoitteesta: 
https://virkailija.opintopolku.fi/henkilo-ui/swagger-ui.html

Tämä sisältää vain UI:n pakolliset rajapinnat ja sitä ei ole tarkoitettu kutsuttavaksi mistään muualta.
