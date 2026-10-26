// Easy-mode questions – safe to edit.
//
// Every question has the options "Ei muutosta" (no change, added automatically), "Vähän" and "Paljon".
// Each level selects Ministry of Finance measures behind the scenes (ids are listed in data/grouping.csv and
// data/taxes.csv), so easy-mode choices show up as such in the advanced view.
// Unit-yield measures take a step count after an asterisk, e.g. "VER-74*3".
// Euro amounts are calculated from the data automatically – do not write them into the texts.

window.QUESTIONS = {
  sections: [
    { id: "spending", title: "Mistä leikataan?" },
    { id: "tax", title: "Mitä verotetaan enemmän?" },
  ],

  questions: [
    // ---------- Spending ----------
    {
      id: "indexation",
      section: "spending",
      title: "Jäädytetäänkö etuuksien ja menojen indeksikorotukset?",
      description: "Moni etuus ja meno nousee joka vuosi hintojen mukana. Jäädytys vuosiksi 2028–2031 tarkoittaa, ettei niitä koroteta lainkaan.",
      levels: [
        {
          name: "Vähän",
          description: "Kelan etuudet, kuten kansaneläke, työttömyysturva ja opintoraha, eivät nouse neljään vuoteen.",
          measures: ["SOS-59"],
        },
        {
          name: "Paljon",
          description: "Kaikki indeksikorotukset jäädytetään: etuudet, työeläkkeet, kuntien valtionosuudet sekä koulutuksen ja puolustuksen rahoitus.",
          measures: ["IND-05"],
        },
      ],
    },
    {
      id: "public-staff",
      section: "spending",
      title: "Vähennetäänkö julkisen sektorin henkilöstöä ja palkkaetuja?",
      description: "Koskee valtion, kuntien ja hyvinvointialueiden työntekijöitä, esimerkiksi hoitajia, opettajia ja virkamiehiä.",
      levels: [
        {
          name: "Vähän",
          description: "Henkilöstöä vähennetään 1 %, lomarahat pienenevät hieman ja pisimmät vuosilomat lyhenevät kahdella päivällä.",
          measures: ["VAL-41", "VAL-50", "VAL-49"],
        },
        {
          name: "Paljon",
          description: "Eläkkeelle jäävien tilalle ei palkata uusia, lomarahat puolitetaan ja pisimmät vuosilomat lyhenevät 38 päivästä 30 päivään.",
          measures: ["VAL-42", "VAL-51", "VAL-48"],
        },
      ],
    },
    {
      id: "administration",
      section: "spending",
      title: "Karsitaanko valtionhallintoa ja poliittista koneistoa?",
      description: "Virastojen, ministeriöiden ja valtion avustusjärjestelmän tehostamista.",
      levels: [
        {
          name: "Vähän",
          description: "Virastoille tuottavuusvaatimus, hankinnat ja tietojärjestelmät tehokkaammiksi, vähemmän matkustamista.",
          measures: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi valtionavustukset uudistetaan, ministeriöitä yhdistetään, puoluetukea, poliittisia avustajia, eduskunnan joululahjarahoja ja kansanedustajien määrää karsitaan, ja budjetin varauksia pienennetään.",
          measures: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63", "VAL-24", "VAL-28", "VAL-18", "VAL-12", "VAL-16", "VAL-08", "VAL-15"],
        },
      ],
    },
    {
      id: "business-subsidies",
      section: "spending",
      title: "Leikataanko yritystukia ja tutkimusrahoitusta?",
      description: "Valtio tukee yrityksiä suoraan ja on sitoutunut kasvattamaan tutkimus- ja kehitysrahoitusta vuoteen 2030 asti.",
      levels: [
        {
          name: "Vähän",
          description: "Suoria yritystukia leikataan 30 %, ja osa tutkimusrahoituksesta katetaan EU-rahoituksella.",
          measures: ["ELI-25", "ELI-07", "ELI-41"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi tutkimus- ja kehitysrahoitus palautetaan vuoden 2023 tasolle. Tämä voi heikentää talouskasvua pitkällä aikavälillä.",
          measures: ["ELI-06", "ELI-25", "ELI-07", "ELI-41"],
        },
      ],
    },
    {
      id: "agriculture",
      section: "spending",
      title: "Leikataanko maataloustuista?",
      description: "Suomi maksaa maataloudelle EU-tukien lisäksi omaa kansallista tukea.",
      levels: [
        {
          name: "Vähän",
          description: "Kansallista tukea lasketaan asteittain, ja tuet passiiviviljelylle lopetetaan.",
          measures: ["ELI-56", "ELI-72"],
        },
        {
          name: "Paljon",
          description: "Kansallinen tuki ja kansallinen lisärahoitus EU-tukiin lakkautetaan, ja myös valtion rahoittama lomitus sekä energiaveron palautus loppuvat.",
          measures: ["ELI-55", "ELI-58", "ELI-72", "ELI-16", "SOS-68"],
        },
      ],
    },
    {
      id: "foreign-aid",
      section: "spending",
      title: "Leikataanko kehitysyhteistyöstä ja ulkomaille annettavasta avusta?",
      description: "Kehitysyhteistyöstä on jo leikattu kuluvalla vaalikaudella.",
      levels: [
        {
          name: "Vähän",
          description: "Kehityspoliittiset lainat ja sijoitukset loppuvat, ja edustustoja sekä siviilikriisinhallintaa karsitaan.",
          measures: ["HAL-19", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
        {
          name: "Paljon",
          description: "Varsinainen kehitysyhteistyö ja humanitaarinen apu lakkautetaan ja Ukrainan tukemisen momentti poistetaan.",
          measures: ["HAL-16", "HAL-17", "HAL-19", "HAL-20", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
      ],
    },
    {
      id: "defence",
      section: "spending",
      title: "Hidastetaanko puolustusmenojen kasvua?",
      description: "Suomi on sitoutunut Natossa nostamaan puolustusmenot 3,5 prosenttiin bruttokansantuotteesta vuoteen 2035 mennessä.",
      levels: [
        {
          name: "Vähän",
          description: "Tavoitteeseen edetään maltillisemmalla aikataululla.",
          measures: ["HAL-50"],
        },
        {
          name: "Paljon",
          description: "Menot pidetään noin 3 prosentissa vuoteen 2034 asti ja nostetaan vasta lopuksi. Hankintoja joudutaan lykkäämään, ja kriisinhallintaoperaatioihin osallistutaan vähemmän.",
          measures: ["HAL-51", "HAL-53"],
        },
      ],
    },
    {
      id: "families",
      section: "spending",
      title: "Leikataanko lapsiperheiden tuista?",
      description: "Lapsilisää maksetaan kaikista alle 17-vuotiaista, ja siihen kuluu noin 1,3 miljardia euroa vuodessa.",
      levels: [
        {
          name: "Vähän",
          description: "Lapsilisä on jokaisesta lapsesta yhtä suuri: sisarkorotukset ja alle 3-vuotiaiden korotus poistuvat.",
          measures: ["SOS-05", "SOS-06"],
        },
        {
          name: "Paljon",
          description: "Lapsilisä lakkautetaan kokonaan, varhaiskasvatusmaksut palautetaan vuotta 2017 edeltävälle tasolle ja joustava hoitoraha poistuu.",
          measures: ["SOS-08", "KOU-13", "SOS-61"],
        },
      ],
    },
    {
      id: "low-income",
      section: "spending",
      title: "Leikataanko pienituloisten tuista, kuten asumistuesta ja takuueläkkeestä?",
      description: "Asumistuki, toimeentulotuki ja pienimmät eläkkeet. VM:n luvuissa on jo huomioitu, että osa säästöstä valuu toimeentulotukeen.",
      levels: [
        {
          name: "Vähän",
          description: "Yleisen asumistuen tukiprosentti laskee, eläkkeensaajan asumistuki rajataan vanhuuseläkeläisiin ja toimeentulotuen perusosa sidotaan ikään.",
          measures: ["SOS-12", "SOS-42", "SOS-13"],
        },
        {
          name: "Paljon",
          description: "Asumistukea leikataan kaikkialla, eläkkeensaajan asumistuki yhdistetään yleiseen asumistukeen, kansan- ja takuueläkkeet pienenevät ja yleistukeen tulee puolison tulojen tarveharkinta.",
          measures: ["SOS-11", "SOS-12", "SOS-40", "SOS-33", "SOS-37", "SOS-13", "SOS-14"],
        },
      ],
    },
    {
      id: "education",
      section: "spending",
      title: "Leikataanko koulutuksesta ja opiskelijoiden tuista?",
      description: "Koulutus on valtion suurimpia menoeriä, ja sen vaikutukset näkyvät pitkällä aikavälillä.",
      levels: [
        {
          name: "Vähän",
          description: "Valtio rahoittaa vain ensimmäisen korkeakoulututkinnon, korkeakouluihin tulee lukukausimaksut ja opiskelijoiden ateriatuki lakkautetaan.",
          measures: ["KOU-43", "KOU-45", "KOU-44", "KOU-60"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi korkeakouluopiskelijoiden opintotuki muuttuu kokonaan lainaksi, oppivelvollisuuden pidennys perutaan, vapaan sivistystyön (esim. kansalaisopistojen) rahoitus lakkautetaan ja aikuisten ammatillista koulutusta karsitaan.",
          measures: ["KOU-43", "KOU-45", "KOU-44", "KOU-60", "KOU-57", "KOU-32", "KOU-27", "KOU-34"],
        },
      ],
    },
    {
      id: "health-social",
      section: "spending",
      title: "Karsitaanko sosiaali- ja terveyspalveluista?",
      description: "Hyvinvointialueet järjestävät terveydenhuollon, vanhustenhoivan ja sosiaalipalvelut valtion rahoituksella.",
      levels: [
        {
          name: "Vähän",
          description: "Vähähyötyisiä hoitoja vähennetään, ja sairaaloiden erikoispalveluja ja tukipalveluja keskitetään.",
          measures: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi aikuisten hammashoitoa rajataan, vanhustenhoivan henkilöstömitoitus puretaan, varakkaat maksavat hoivastaan enemmän, nuorten terapiatakuu poistuu, päivystyksiä vähennetään ja yksityislääkärikäyntien Kela-korvaukset loppuvat.",
          measures: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36", "SOT-29", "SOT-06", "SOT-18", "SOT-11", "SOT-25", "SOS-18"],
        },
      ],
    },
    {
      id: "culture",
      section: "spending",
      title: "Leikataanko kulttuurista, Ylestä ja järjestöistä?",
      description: "Taiteen, kulttuurin, liikunnan ja järjestöjen tuet sekä Ylen rahoitus.",
      levels: [
        {
          name: "Vähän",
          description: "Ylen rahoitusta lasketaan asteittain 10 %, ja kulttuurin ja liikunnan avustuksia vähennetään.",
          measures: ["ELI-43", "KOU-70", "KOU-77"],
        },
        {
          name: "Paljon",
          description: "Ylen rahoitus laskee 20 %, teattereiden ja museoiden rahoitusta leikataan, liikuntapaikkojen tuki ja Suomi liikkeelle -ohjelma lopetetaan ja itsenäisyyden juhlarahasto Sitra lakkautetaan.",
          measures: ["ELI-42", "KOU-65", "KOU-70", "KOU-76", "KOU-77", "KOU-78", "KOU-09", "VAL-29"],
        },
      ],
    },
    {
      id: "transport",
      section: "spending",
      title: "Leikataanko teiden ja ratojen rahoituksesta?",
      description: "Väylien kunnossapito ja uudet liikennehankkeet.",
      levels: [
        {
          name: "Vähän",
          description: "Uusiin liikennehankkeisiin ei osoiteta uutta rahaa.",
          measures: ["ELI-32"],
        },
        {
          name: "Paljon",
          description: "Edellisen lisäksi teiden ja ratojen kunnossapitoa vähennetään ja joukkoliikenteen sekä maakuntalentojen tukia leikataan.",
          measures: ["ELI-32", "ELI-33", "ELI-38", "ELI-39"],
        },
      ],
    },

    // ---------- Taxes ----------
    {
      id: "vat",
      section: "tax",
      title: "Korotetaanko arvonlisäveroa?",
      description: "Arvonlisävero näkyy kaikkien ostosten hinnoissa. Yleinen verokanta on nyt 25,5 %, ja ruoalla, lääkkeillä ja kirjoilla on alempi kanta.",
      levels: [
        {
          name: "Vähän",
          description: "Yleistä verokantaa nostetaan prosenttiyksiköllä 26,5 prosenttiin.",
          measures: ["VER-51"],
        },
        {
          name: "Paljon",
          description: "Kaikki alennetut verokannat poistuvat: myös ruoka, lääkkeet ja joukkoliikenne ovat 25,5 %:n verolla.",
          measures: ["VER-50"],
        },
      ],
    },
    {
      id: "income-tax",
      section: "tax",
      title: "Kiristetäänkö palkkojen ja eläkkeiden verotusta?",
      description: "Tuloveroa maksavat kaikki palkansaajat ja eläkeläiset. Verotuksen kiristäminen voi heikentää työllisyyttä.",
      levels: [
        {
          name: "Vähän",
          description: "Veroasteikkoa ei korjata inflaation mukaan, jolloin verotus kiristyy vähän kaikilla.",
          measures: ["VER-15"],
        },
        {
          name: "Paljon",
          description: "Edellisen lisäksi valtion tuloveroa korotetaan kaikissa tuloluokissa prosenttiyksiköllä, ja eläketulojen verotus kiristyy.",
          measures: ["VER-15", "VER-20", "VER-16"],
        },
      ],
    },
    {
      id: "capital-tax",
      section: "tax",
      title: "Kiristetäänkö yritysten, pääomien ja varallisuuden verotusta?",
      description: "Osinkojen, yritysten, perintöjen ja kiinteistöjen verotus.",
      levels: [
        {
          name: "Vähän",
          description: "Listaamattomien yhtiöiden osinkojen veroetu pienenee, ja yrittäjävähennys sekä sukupolvenvaihdosten verohelpotukset poistuvat.",
          measures: ["VER-27", "VER-26", "VER-44"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi yhteisövero, pääomatulovero ja perintövero nousevat prosenttiyksiköllä, ja tonttien kiinteistövero nousee uusien verotusarvojen myötä.",
          measures: ["VER-27", "VER-26", "VER-44", "VER-30", "VER-23", "VER-24", "VER-45", "VER-82"],
        },
      ],
    },
    {
      id: "energy-tax",
      section: "tax",
      title: "Kiristetäänkö liikenteen ja energian verotusta?",
      description: "Polttoaineiden, autojen, lentämisen ja lämmityksen verot.",
      levels: [
        {
          name: "Vähän",
          description: "Dieselin verotukea pienennetään, otetaan käyttöön lento- ja laivalippuvero, ja valmisteverot nousevat jatkossa hintojen mukana.",
          measures: ["VER-58", "VER-70", "VER-55"],
        },
        {
          name: "Paljon",
          description: "Edellisten lisäksi ajoneuvovero nousee 100 euroa vuodessa, polttoaineiden vero nousee noin 3 senttiä litralta, ja lämpölaitosten puunpolton sekä lämpöpumppujen verotuet poistuvat.",
          measures: ["VER-58", "VER-70", "VER-55", "VER-62", "VER-74*3", "VER-67", "VER-69"],
        },
      ],
    },
  ],
};
