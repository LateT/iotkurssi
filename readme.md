
# IOT Harjoitustyö

Ryhmä I:n harjoitustyö jolla tavoitellaan arvosanaa 3. Projekti on toteutettu JavaScriptiä ja NodeJs käyttäen.


## Asennus

`pilvipalvelu_src` juuressa

```bash
  npm install
```
Tämä käy asentamassa tarvittavat paketit backendille ja frontendille. Tarvitset tämän lisäksi myös tarvittavat ympäristömuuttujat.

## Ympäristömuuttujat

Jos haluat ajaa koko projektin paikallisesti tarvitset ympäristömuuttujia niin palvelimelle kuin clientille. Palvelimen ympäristömuuttujat tulee sijoittaa `.env` tiedostoon `backend` -hakemiston juureen ja clientin ympäristömuuttujat `raspberry_src` -hakemiston juureen.

#### Palvelimen ympäristömuuttujat

`DBHOSTNAME` SQL-palvelimen isäntänimi tai IP-osoite

`DBPORT` SQL-palvelimen portti

`DBUSERNAME` SQL-käyttäjän käyttäjätunnus

`DBPASSWORD` SQL-käyttäjän salasana

`DBNAME` Tietokannan nimi

`JWTSECRET` Salainen merkkijono, jota käytetään clienttien JWT access tokenien allekirjoittamiseen ja varmentamiseen.

#### Clientin ympäristömuuttujat

`TOKEN` JWT access token, joka antaa clientille oikeuden lähettää sensoridataa palvelimelle. Luodaan käsin `generateClientToken.js`-skriptillä joka sijaitsee `backend`-hakemistossa.


## Ajaminen

#### Palvelin
`pilvipalvelu_src` juuressa

```bash
  npm run
```
#### Client
`raspberry_src` juuressa

```bash
  npm run
```



## Esimerkki emuloidusta datasta

```json
{"deviceId":"Raspberry Pi Web Client","temperature":20.42507966974035,"humidity":50.499101039403655}
```

