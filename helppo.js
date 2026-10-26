// Helpon tilan kysymykset – tätä tiedostoa voi muokata vapaasti.
//
// Jokaisessa kysymyksessä on vaihtoehdot "Ei muutosta" (automaattinen), "Vähän" ja "Paljon".
// Tasot valitsevat taustalla VM:n toimenpiteitä (id:t näkyvät tiedostossa data/ryhmittely.csv ja data/verot.csv),
// joten helpon tilan valinnat näkyvät sellaisinaan myös tarkassa tilassa.
// Euromäärät lasketaan automaattisesti datasta – älä kirjoita niitä teksteihin.

window.HELPPO = {
  osiot: [
    { id: "meno", otsikko: "Mistä leikataan?" },
    { id: "vero", otsikko: "Mitä verotetaan enemmän?" },
  ],

  kysymykset: [
    // ---------- Menot ----------
    {
      id: "indeksit",
      osio: "meno",
      otsikko: "Jäädytetäänkö etuuksien ja menojen indeksikorotukset?",
      kuvaus: "Moni etuus ja meno nousee joka vuosi hintojen mukana. Jäädytys vuosiksi 2028–2031 tarkoittaa, ettei niitä koroteta lainkaan.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Kelan etuudet, kuten kansaneläke, työttömyysturva ja opintoraha, eivät nouse neljään vuoteen.",
          toimet: ["SOS-59"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Kaikki indeksikorotukset jäädytetään: etuudet, työeläkkeet, kuntien valtionosuudet sekä koulutuksen ja puolustuksen rahoitus.",
          toimet: ["IND-05"],
        },
      ],
    },
    {
      id: "henkilosto",
      osio: "meno",
      otsikko: "Vähennetäänkö julkisen sektorin henkilöstöä ja palkkaetuja?",
      kuvaus: "Koskee valtion, kuntien ja hyvinvointialueiden työntekijöitä, esimerkiksi hoitajia, opettajia ja virkamiehiä.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Henkilöstöä vähennetään 1 %, lomarahat pienenevät hieman ja pisimmät vuosilomat lyhenevät kahdella päivällä.",
          toimet: ["VAL-41", "VAL-50", "VAL-49"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Eläkkeelle jäävien tilalle ei palkata uusia, lomarahat puolitetaan ja pisimmät vuosilomat lyhenevät 38 päivästä 30 päivään.",
          toimet: ["VAL-42", "VAL-51", "VAL-48"],
        },
      ],
    },
    {
      id: "hallinto",
      osio: "meno",
      otsikko: "Karsitaanko valtionhallintoa ja poliittista koneistoa?",
      kuvaus: "Virastojen, ministeriöiden ja valtion avustusjärjestelmän tehostamista.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Virastoille tuottavuusvaatimus, hankinnat ja tietojärjestelmät tehokkaammiksi, vähemmän matkustamista.",
          toimet: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi valtionavustukset uudistetaan, ministeriöitä yhdistetään, puoluetukea, poliittisia avustajia, eduskunnan joululahjarahoja ja kansanedustajien määrää karsitaan, ja budjetin varauksia pienennetään.",
          toimet: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63", "VAL-24", "VAL-28", "VAL-18", "VAL-12", "VAL-16", "VAL-08", "VAL-15"],
        },
      ],
    },
    {
      id: "yritystuet",
      osio: "meno",
      otsikko: "Leikataanko yritystukia ja tutkimusrahoitusta?",
      kuvaus: "Valtio tukee yrityksiä suoraan ja on sitoutunut kasvattamaan tutkimus- ja kehitysrahoitusta vuoteen 2030 asti.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Suoria yritystukia leikataan 30 %, ja osa tutkimusrahoituksesta katetaan EU-rahoituksella.",
          toimet: ["ELI-25", "ELI-07", "ELI-41"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi tutkimus- ja kehitysrahoitus palautetaan vuoden 2023 tasolle. Tämä voi heikentää talouskasvua pitkällä aikavälillä.",
          toimet: ["ELI-06", "ELI-25", "ELI-07", "ELI-41"],
        },
      ],
    },
    {
      id: "maatalous",
      osio: "meno",
      otsikko: "Leikataanko maataloustuista?",
      kuvaus: "Suomi maksaa maataloudelle EU-tukien lisäksi omaa kansallista tukea.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Kansallista tukea lasketaan asteittain, ja tuet passiiviviljelylle lopetetaan.",
          toimet: ["ELI-56", "ELI-72"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Kansallinen tuki ja kansallinen lisärahoitus EU-tukiin lakkautetaan, ja myös valtion rahoittama lomitus sekä energiaveron palautus loppuvat.",
          toimet: ["ELI-55", "ELI-58", "ELI-72", "ELI-16", "SOS-68"],
        },
      ],
    },
    {
      id: "ulkomaat",
      osio: "meno",
      otsikko: "Leikataanko kehitysyhteistyöstä ja ulkomaille annettavasta avusta?",
      kuvaus: "Kehitysyhteistyöstä on jo leikattu kuluvalla vaalikaudella.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Kehityspoliittiset lainat ja sijoitukset loppuvat, ja edustustoja sekä siviilikriisinhallintaa karsitaan.",
          toimet: ["HAL-19", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Varsinainen kehitysyhteistyö ja humanitaarinen apu lakkautetaan ja Ukrainan tukemisen momentti poistetaan.",
          toimet: ["HAL-16", "HAL-17", "HAL-19", "HAL-20", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
      ],
    },
    {
      id: "puolustus",
      osio: "meno",
      otsikko: "Hidastetaanko puolustusmenojen kasvua?",
      kuvaus: "Suomi on sitoutunut Natossa nostamaan puolustusmenot 3,5 prosenttiin bruttokansantuotteesta vuoteen 2035 mennessä.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Tavoitteeseen edetään maltillisemmalla aikataululla.",
          toimet: ["HAL-50"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Menot pidetään noin 3 prosentissa vuoteen 2034 asti ja nostetaan vasta lopuksi. Hankintoja joudutaan lykkäämään, ja kriisinhallintaoperaatioihin osallistutaan vähemmän.",
          toimet: ["HAL-51", "HAL-53"],
        },
      ],
    },
    {
      id: "lapsiperheet",
      osio: "meno",
      otsikko: "Leikataanko lapsiperheiden tuista?",
      kuvaus: "Lapsilisää maksetaan kaikista alle 17-vuotiaista, ja siihen kuluu noin 1,3 miljardia euroa vuodessa.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Lapsilisä on jokaisesta lapsesta yhtä suuri: sisarkorotukset ja alle 3-vuotiaiden korotus poistuvat.",
          toimet: ["SOS-05", "SOS-06"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Lapsilisä lakkautetaan kokonaan, varhaiskasvatusmaksut palautetaan vuotta 2017 edeltävälle tasolle ja joustava hoitoraha poistuu.",
          toimet: ["SOS-08", "KOU-13", "SOS-61"],
        },
      ],
    },
    {
      id: "pienituloiset",
      osio: "meno",
      otsikko: "Leikataanko pienituloisten tuista, kuten asumistuesta ja takuueläkkeestä?",
      kuvaus: "Asumistuki, toimeentulotuki ja pienimmät eläkkeet. VM:n luvuissa on jo huomioitu, että osa säästöstä valuu toimeentulotukeen.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Yleisen asumistuen tukiprosentti laskee, eläkkeensaajan asumistuki rajataan vanhuuseläkeläisiin ja toimeentulotuen perusosa sidotaan ikään.",
          toimet: ["SOS-12", "SOS-42", "SOS-13"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Asumistukea leikataan kaikkialla, eläkkeensaajan asumistuki yhdistetään yleiseen asumistukeen, kansan- ja takuueläkkeet pienenevät ja yleistukeen tulee puolison tulojen tarveharkinta.",
          toimet: ["SOS-11", "SOS-12", "SOS-40", "SOS-33", "SOS-37", "SOS-13", "SOS-14"],
        },
      ],
    },
    {
      id: "koulutus",
      osio: "meno",
      otsikko: "Leikataanko koulutuksesta ja opiskelijoiden tuista?",
      kuvaus: "Koulutus on valtion suurimpia menoeriä, ja sen vaikutukset näkyvät pitkällä aikavälillä.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Valtio rahoittaa vain ensimmäisen korkeakoulututkinnon, korkeakouluihin tulee lukukausimaksut ja opiskelijoiden ateriatuki lakkautetaan.",
          toimet: ["KOU-43", "KOU-45", "KOU-44", "KOU-60"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi korkeakouluopiskelijoiden opintotuki muuttuu kokonaan lainaksi, oppivelvollisuuden pidennys perutaan, vapaan sivistystyön (esim. kansalaisopistojen) rahoitus lakkautetaan ja aikuisten ammatillista koulutusta karsitaan.",
          toimet: ["KOU-43", "KOU-45", "KOU-44", "KOU-60", "KOU-57", "KOU-32", "KOU-27", "KOU-34"],
        },
      ],
    },
    {
      id: "sote",
      osio: "meno",
      otsikko: "Karsitaanko sosiaali- ja terveyspalveluista?",
      kuvaus: "Hyvinvointialueet järjestävät terveydenhuollon, vanhustenhoivan ja sosiaalipalvelut valtion rahoituksella.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Vähähyötyisiä hoitoja vähennetään, ja sairaaloiden erikoispalveluja ja tukipalveluja keskitetään.",
          toimet: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi aikuisten hammashoitoa rajataan, vanhustenhoivan henkilöstömitoitus puretaan, varakkaat maksavat hoivastaan enemmän, nuorten terapiatakuu poistuu, päivystyksiä vähennetään ja yksityislääkärikäyntien Kela-korvaukset loppuvat.",
          toimet: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36", "SOT-29", "SOT-06", "SOT-18", "SOT-11", "SOT-25", "SOS-18"],
        },
      ],
    },
    {
      id: "kulttuuri",
      osio: "meno",
      otsikko: "Leikataanko kulttuurista, Ylestä ja järjestöistä?",
      kuvaus: "Taiteen, kulttuurin, liikunnan ja järjestöjen tuet sekä Ylen rahoitus.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Ylen rahoitusta lasketaan asteittain 10 %, ja kulttuurin ja liikunnan avustuksia vähennetään.",
          toimet: ["ELI-43", "KOU-70", "KOU-77"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Ylen rahoitus laskee 20 %, teattereiden ja museoiden rahoitusta leikataan, liikuntapaikkojen tuki ja Suomi liikkeelle -ohjelma lopetetaan ja itsenäisyyden juhlarahasto Sitra lakkautetaan.",
          toimet: ["ELI-42", "KOU-65", "KOU-70", "KOU-76", "KOU-77", "KOU-78", "KOU-09", "VAL-29"],
        },
      ],
    },
    {
      id: "liikenne",
      osio: "meno",
      otsikko: "Leikataanko teiden ja ratojen rahoituksesta?",
      kuvaus: "Väylien kunnossapito ja uudet liikennehankkeet.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Uusiin liikennehankkeisiin ei osoiteta uutta rahaa.",
          toimet: ["ELI-32"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisen lisäksi teiden ja ratojen kunnossapitoa vähennetään ja joukkoliikenteen sekä maakuntalentojen tukia leikataan.",
          toimet: ["ELI-32", "ELI-33", "ELI-38", "ELI-39"],
        },
      ],
    },

    // ---------- Verot ----------
    {
      id: "alv",
      osio: "vero",
      otsikko: "Korotetaanko arvonlisäveroa?",
      kuvaus: "Arvonlisävero näkyy kaikkien ostosten hinnoissa. Yleinen verokanta on nyt 25,5 %, ja ruoalla, lääkkeillä ja kirjoilla on alempi kanta.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Yleistä verokantaa nostetaan prosenttiyksiköllä 26,5 prosenttiin.",
          toimet: ["VER-51"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Kaikki alennetut verokannat poistuvat: myös ruoka, lääkkeet ja joukkoliikenne ovat 25,5 %:n verolla.",
          toimet: ["VER-50"],
        },
      ],
    },
    {
      id: "tulovero",
      osio: "vero",
      otsikko: "Kiristetäänkö palkkojen ja eläkkeiden verotusta?",
      kuvaus: "Tuloveroa maksavat kaikki palkansaajat ja eläkeläiset. Verotuksen kiristäminen voi heikentää työllisyyttä.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Veroasteikkoa ei korjata inflaation mukaan, jolloin verotus kiristyy vähän kaikilla.",
          toimet: ["VER-15"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisen lisäksi valtion tuloveroa korotetaan kaikissa tuloluokissa prosenttiyksiköllä, ja eläketulojen verotus kiristyy.",
          toimet: ["VER-15", "VER-20", "VER-16"],
        },
      ],
    },
    {
      id: "paaomat",
      osio: "vero",
      otsikko: "Kiristetäänkö yritysten, pääomien ja varallisuuden verotusta?",
      kuvaus: "Osinkojen, yritysten, perintöjen ja kiinteistöjen verotus.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Listaamattomien yhtiöiden osinkojen veroetu pienenee, ja yrittäjävähennys sekä sukupolvenvaihdosten verohelpotukset poistuvat.",
          toimet: ["VER-27", "VER-26", "VER-44"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi yhteisövero, pääomatulovero ja perintövero nousevat prosenttiyksiköllä, ja tonttien kiinteistövero nousee uusien verotusarvojen myötä.",
          toimet: ["VER-27", "VER-26", "VER-44", "VER-30", "VER-23", "VER-24", "VER-45", "VER-82"],
        },
      ],
    },
    {
      id: "energiaverot",
      osio: "vero",
      otsikko: "Kiristetäänkö liikenteen ja energian verotusta?",
      kuvaus: "Polttoaineiden, autojen, lentämisen ja lämmityksen verot.",
      tasot: [
        {
          nimi: "Vähän",
          kuvaus: "Dieselin verotukea pienennetään, otetaan käyttöön lento- ja laivalippuvero, ja valmisteverot nousevat jatkossa hintojen mukana.",
          toimet: ["VER-58", "VER-70", "VER-55"],
        },
        {
          nimi: "Paljon",
          kuvaus: "Edellisten lisäksi ajoneuvovero nousee 100 euroa vuodessa, polttoaineiden vero nousee noin 3 senttiä litralta, ja lämpölaitosten puunpolton sekä lämpöpumppujen verotuet poistuvat.",
          toimet: ["VER-58", "VER-70", "VER-55", "VER-62", "VER-74*3", "VER-67", "VER-69"],
        },
      ],
    },
  ],
};
