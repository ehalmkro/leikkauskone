# Leikkauskone

Interaktiivinen sivu, jolla voi kokeilla, miten valtiovarainministeriön meno- ja rakennekartoituksen (26.10.2026)
toimenpiteillä ja verokartoituksen vaihtoehdoilla päästäisiin seuraavan vaalikauden sopeutustavoitteeseen.

Sivulla on kaksi näkymää:

- **Helppo** (oletus): 17 isoa kysymystä ("Leikataanko lapsiperheiden tuista?"), joihin vastataan *Ei muutosta / Vähän / Paljon*.
- **Tarkka**: kaikki 459 toimenpidettä ryhmiteltyinä, yksittäin valittavina.

Kummassakin näkymässä on samat valinnat: helpon tilan vastaukset näkyvät tarkassa tilassa yksittäisinä toimenpiteinä.

Koodin kommentit, muuttujat ja tiedostonimet ovat englanniksi; sivun tekstit ovat suomeksi.

## Avaaminen

Avaa `index.html` selaimessa (tuplaklikkaus riittää – ei asennuksia eikä palvelinta).

## Tiedostot

| Tiedosto | Mitä se on | Muokataanko? |
|---|---|---|
| `index.html` | Sivun rakenne ja tekstit | Kyllä |
| `style.css` | Ulkoasu. Värit ja mitat ovat muuttujina tiedoston alussa (vaalea ja tumma teema). | Kyllä |
| `questions.js` | Helpon tilan kysymykset ja niiden tasot (mitkä toimenpiteet kukin taso valitsee) | Kyllä |
| `config.js` | Tavoitteet (virstanpylväät), oletusvuosi, pääluokkien selitteet, lähdelinkit | Kyllä |
| `app.js` | Sovelluslogiikka | Tarvittaessa |
| `data/grouping.csv` | Menotoimien pääluokat, alaryhmät ja keskenään yhteensopimattomat toimet | Kyllä (Excelissä) |
| `data/taxes.csv` | Verotoimenpiteet, koneessa käytetty luku ja sen peruste | Kyllä (Excelissä) |
| `data.js` | Sivun käyttämä data – **generoitu**, älä muokkaa käsin | Ei |
| `tools/build_data.py` | Rakentaa `data.js`:n Excelistä ja CSV:istä | – |

## Datan päivittäminen

Kun muokkaat CSV-tiedostoja tai vaihdat Excelin uuteen versioon, aja:

```bash
pip install openpyxl
python3 tools/build_data.py
```

Skripti varoittaa, jos Excelissä on rivejä, jotka puuttuvat tiedostosta `grouping.csv`, tai TAI-vaihtoehtoja ilman vaihtoehtoryhmää.

### CSV-sarakkeet

- `category` / `group` – pääluokka ja alaryhmä, jonka alle toimi kuuluu (uusi nimi luo uuden ryhmän).
- `alternative_group` – samalla tunnuksella merkityistä toimista voi valita vain yhden (esim. Ylen leikkaus 20 % *tai* 10 %).
- `conflicts_with` – välilyönnillä erotetut id:t, joiden kanssa toimi on päällekkäinen (esim. yleinen indeksijäädytys ja yksittäiset indeksitoimet).
- `taxes.csv`: `impact_meur` on koneessa käytetty luku (milj. €/v), `unit_max` tekee rivistä säädettävän (+/−) ja `unit_step` kertoo askeleen koon, `from_year` on ensimmäinen vuosi, jolloin tuotto kertyy, ja `basis` kertoo, mistä luku on peräisin.

### Helpon tilan kysymykset

`questions.js`:ssä jokaisella kysymyksellä on tasot "Vähän" ja "Paljon", ja kumpikin listaa toimenpiteiden id:t
(yksikkötuotoissa askelmäärä tähdellä, esim. `"VER-74*3"`). Euromäärät lasketaan automaattisesti.
Vältä laittamasta eri kysymyksiin toimenpiteitä, jotka ovat keskenään ristiriidassa – muuten yhden kysymyksen
valinta pyyhkii toisen.


## Laskennan periaatteet

- Menotoimien luvut ovat VM:n arvioita vaikutuksesta valtion ja paikallishallinnon talouteen valittuna vuonna. Sosiaaliturvarahastojen vaikutuksen voi kytkeä mukaan tarkassa tilassa.
- Verojen tuottoarviot ovat vuoden 2028 tasossa, ja niiden oletetaan pysyvän samoina. Kun VM ilmoittaa nettovaikutuksen julkiseen talouteen (indeksietuudet ja hintajousto huomioiden), sitä käytetään.
- Virstanpylväät: EU:n 3 %:n alijäämäraja (~4,5 mrd €, karkea arvio), sopeutustavoite 8–11 mrd € vuoteen 2031 (VN julkaisuja 2026:17) ja valtion vuoden 2027 budjetin alijäämä 12,3 mrd €.
- Ryhmittely, helpon tilan kysymykset ja päällekkäisyyksien tunnistus ovat tämän työkalun tekijän tulkintaa. VM ei ole arvioinut toimien yhteisvaikutuksia.
