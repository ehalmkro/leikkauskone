// The climate flow: emission cuts and carbon sinks – safe to edit.
//
// Amounts are rough annual effects in 2035, in million tonnes of CO₂ equivalent (Mt) per year, compared with
// current policies. They come from published estimates (see `source` on each measure); where a source gives a
// range, the middle of it is used. The estimates overlap in places, so totals are indicative.
// Texts are given per language as { fi: "...", en: "..." }.

export const CLIMATE = {
  year: 2035,

  // The bar counts additional cuts on top of current policies; carbon neutrality in 2035 is the target band.
  meter: {
    scaleMax: 40,
    target: { from: 31, to: 34, label: { fi: "Hiilineutraalius 2035", en: "Carbon neutral 2035" } },
    markers: [],
  },

  milestones: [
    {
      value: 31,
      name: { fi: "Hiilineutraalius 2035, alaraja-arvio", en: "Carbon neutrality 2035, low estimate" },
      description: {
        fi:
          "Suomen nettopäästöt ovat nyt noin 46 Mt. Jo päätetyt toimet vähentävät niitä vuoteen 2035 mennessä, ja kone laskee niiden päälle tarvittavat lisätoimet. " +
          "Maankäyttösektori on nykytoimilla vuonna 2035 noin 15,8 Mt:n päästölähde, mutta hiilineutraalius vaatisi Ilmastopaneelin mukaan " +
          "vähintään 15 Mt:n nettonielun. Ero on noin 31 Mt, vaikka muut päästöt vähenisivät suunnitellusti.",
        en:
          "Finland's net emissions are now about 46 Mt. Policies already decided cut them by 2035, and the tool counts the additional measures needed on top. " +
          "With current policies the land use sector is a net source of about 15.8 Mt in 2035, but according to the Climate Change Panel " +
          "carbon neutrality would need a net sink of at least 15 Mt. The difference is about 31 Mt, even if other emissions fall as planned.",
      },
    },
    {
      value: 34,
      name: { fi: "Hiilineutraalius 2035, yläraja-arvio", en: "Carbon neutrality 2035, high estimate" },
      description: {
        fi: "Valtioneuvoston ilmastovuosikertomuksen 2025 mukaan lisätoimien tarve on suuruusluokaltaan jopa 34 Mt.",
        en: "According to the Government's Annual Climate Report 2025, the need for additional measures is as much as 34 Mt.",
      },
    },
  ],

  // Measure types in the order the result text and the share image show them
  types: ["emissions", "sinks"],

  categories: [
    { id: "LII", name: "Liikenne", nameEn: "Transport", measures: ["CL-01", "CL-02", "CL-03", "CL-04", "CL-05", "CL-06"] },
    { id: "ENE", name: "Työkoneet ja rakennukset", nameEn: "Machinery and buildings", measures: ["CL-07", "CL-08", "CL-09", "CL-10"] },
    { id: "MAA", name: "Maatalous ja ruoka", nameEn: "Agriculture and food", measures: ["CL-11", "CL-12", "CL-13", "CL-14", "CL-15"] },
    { id: "MET", name: "Metsät ja maankäyttö", nameEn: "Forests and land use", measures: ["CL-16", "CL-17", "CL-18", "CL-19", "CL-20", "CL-21", "CL-22", "CL-23", "CL-24"] },
    { id: "POI", name: "Hiilidioksidin talteenotto", nameEn: "Carbon capture", measures: ["CL-25", "CL-26"] },
  ],

  measures: {
    // ---------- Transport ----------
    "CL-01": {
      name: "Biopolttoaineiden jakeluvelvoite palautetaan aiemmalle tasolle",
      nameEn: "Biofuel blending obligation restored to its earlier level",
      type: "emissions",
      mt: 0.8,
      source: "Ilmastopaneeli 2026: velvoitteen alentaminen lisäsi päästöjä 3,9 Mt vuosina 2024–2030",
    },
    "CL-02": {
      name: "Jakeluvelvoite nousee 51 %:iin 2035 ja 100 %:iin 2045",
      nameEn: "Blending obligation raised to 51% by 2035 and 100% by 2045",
      type: "emissions",
      mt: 0.3,
      source: "Ilmastopaneelin toimenpidelistaus 2026",
    },
    "CL-03": {
      name: "Bensiinin ja dieselin vero nousee",
      nameEn: "Higher petrol and diesel tax",
      type: "emissions",
      mt: 0.15,
      unit: { step: "10 snt/l", max: 2 },
      source: "Ilmastopaneelin toimenpidelistaus 2026: +20 snt/l noin 0,3 Mt",
    },
    "CL-04": {
      name: "Henkilöautojen sähköistyminen nopeutuu",
      nameEn: "Faster electrification of cars",
      type: "emissions",
      mt: 0.6,
      source: "Karhinen ym. 2026 (SYKE)",
    },
    "CL-05": {
      name: "Paketti- ja kuorma-autojen sähköistyminen nopeutuu",
      nameEn: "Faster electrification of vans and lorries",
      type: "emissions",
      mt: 0.9,
      source: "Karhinen ym. 2026 (SYKE): pakettiautot 0,28 Mt, kuorma-autot 0,65 Mt",
    },
    "CL-06": {
      name: "Ruuhkamaksut Helsingin ja Tampereen seuduille",
      nameEn: "Congestion charges in the Helsinki and Tampere regions",
      type: "emissions",
      mt: 0.05,
      source: "VTT:n arviota päästövaikutuksesta on kuvattu vaatimattomaksi; luku on karkea suuruusluokka",
    },

    // ---------- Machinery and buildings ----------
    "CL-07": {
      name: "Maatalouden polttoaineiden veronpalautus poistetaan",
      nameEn: "Tax refund on farm fuels removed",
      type: "emissions",
      mt: 0.15,
      source: "Ilmastopaneelin toimenpidelistaus 2026: 0,1–0,2 Mt",
    },
    "CL-08": {
      name: "Kevyen polttoöljyn jakeluvelvoite 30 %:iin",
      nameEn: "Blending obligation for light fuel oil raised to 30%",
      type: "emissions",
      mt: 0.6,
      source: "Karhinen ym. 2026 (SYKE): työkoneiden potentiaali yhteensä noin 0,75 Mt",
    },
    "CL-09": {
      name: "Öljylämmitykset vaihdetaan lämpöpumppuihin",
      nameEn: "Oil heating replaced with heat pumps",
      type: "emissions",
      mt: 0.07,
      source: "Karhinen ym. 2026 (SYKE)",
    },
    "CL-10": {
      name: "Rakennusten energiaremontit ja lämmityksen sähköistäminen",
      nameEn: "Energy renovations and electric heating in buildings",
      type: "emissions",
      mt: 0.8,
      source: "Karhinen ym. 2026 (SYKE): rakennusten potentiaali yhteensä noin 0,9 Mt",
    },

    // ---------- Agriculture and food ----------
    "CL-11": {
      name: "Turvepeltoja kosteikoiksi ja märkäviljelyyn",
      nameEn: "Peat fields turned into wetlands or wet farming",
      type: "sinks",
      mt: 0.6,
      source: "Ilmastopaneelin toimenpidelistaus 2026: ilmastokosteikot 0,33–0,55 Mt, märkäviljely 0,11–0,22 Mt",
    },
    "CL-12": {
      name: "Turvepelloille säätösalaojitus ja monivuotiset nurmet",
      nameEn: "Controlled drainage and perennial grass on peat fields",
      type: "sinks",
      mt: 0.3,
      source: "Ilmastopaneelin toimenpidelistaus 2026; Lounasheimo ym. 2026: turvepeltojen hoito yhteensä alle 1 Mt",
    },
    "CL-13": {
      name: "Typpilannoituksen tarkentaminen ja metaania vähentävä rehun lisäaine",
      nameEn: "More precise nitrogen fertilisation and a methane-reducing feed additive",
      type: "emissions",
      mt: 0.4,
      source: "Ilmastopaneelin toimenpidelistaus 2026: typpi 0,2–0,3 Mt, rehun lisäaine 0,1–0,2 Mt",
    },
    "CL-14": {
      name: "Kivennäismaiden peltojen hiilivaraston kasvattaminen",
      nameEn: "Building up carbon in mineral-soil fields",
      type: "sinks",
      mt: 1.15,
      source: "Ilmastopaneelin toimenpidelistaus 2026: 1–1,3 Mt",
    },
    "CL-15": {
      name: "Puolet proteiinista kasveista (50/50-tavoite)",
      nameEn: "Half of protein from plants (50/50 target)",
      type: "emissions",
      mt: 2.3,
      source: "Luke 2022 (Hiilineutraali Suomi 2035): ruokavaliomuutos vähentää päästöjä 2,3 Mt maataloudessa, maankäytössä ja energiassa",
    },

    // ---------- Forests and land use ----------
    "CL-16": {
      name: "Metsät kasvatetaan järeämmiksi ennen päätehakkuuta",
      nameEn: "Trees grown larger before final felling",
      type: "sinks",
      mt: 2.2,
      source: "Ilmastopaneelin AFOLU-hanke (alustava): 2,2 Mt nykyisellä hakkuutasolla, noin 10 €/t",
    },
    "CL-17": {
      name: "Metsät kasvatetaan tiheämpinä",
      nameEn: "Forests kept denser",
      type: "sinks",
      mt: 3,
      source: "Karhinen ym. 2026 (SYKE)",
    },
    "CL-18": {
      name: "Metsiin jätetään enemmän lahopuuta ja säästöpuita",
      nameEn: "More deadwood and retention trees left in forests",
      type: "sinks",
      mt: 1.9,
      source: "Ilmastopaneelin AFOLU-hanke (alustava): 1,3–2,5 Mt",
    },
    "CL-19": {
      name: "Turvemaametsien ojitus luvanvaraiseksi, rehevillä turvemailla ei avohakkuita",
      nameEn: "Peatland forest ditching needs a permit, no clear-cutting on fertile peatland",
      type: "sinks",
      mt: 1,
      source: "Ilmastopaneelin AFOLU-hanke (alustava): avohakkuiden välttäminen 0,7–1,3 Mt",
    },
    "CL-20": {
      name: "Puun energiapoltolle vero – voimaloissa poltetaan puolet vähemmän runkopuuta",
      nameEn: "Tax on burning wood for energy – power plants burn half as much roundwood",
      type: "sinks",
      mt: 7.5,
      source:
        "Voimaloissa poltettiin 2024 noin 11 milj. m³ runkopuuta. Jokainen hakkaamatta jäävä milj. m³ vahvistaa nielua vähintään 1,5 Mt " +
        "(Ilmastopaneeli 2026). Oletus: 5 milj. m³ jää hakkaamatta.",
    },
    "CL-21": {
      name: "Hakkuille yläraja 64 milj. m³ vuodessa",
      nameEn: "Harvest cap of 64 million m³ a year",
      type: "sinks",
      mt: 15,
      source: "Hakkuut noin 74 milj. m³ vuodessa; 10 milj. m³ vähemmän × 1,5 Mt (Ilmastopaneeli 2026)",
    },
    "CL-22": {
      name: "Hakkuille yläraja 60 milj. m³ vuodessa",
      nameEn: "Harvest cap of 60 million m³ a year",
      type: "sinks",
      mt: 21,
      source: "Hakkuut noin 74 milj. m³ vuodessa; 14 milj. m³ vähemmän × 1,5 Mt (Ilmastopaneeli 2026)",
    },
    "CL-23": {
      name: "Maksu metsän raivaamisesta muuhun käyttöön",
      nameEn: "Fee for clearing forest for other uses",
      type: "sinks",
      mt: 1.25,
      source: "Ilmastopaneelin AFOLU-hanke: metsäkadon puolittaminen 1,0–1,5 Mt, 12–18 €/t",
    },
    "CL-24": {
      name: "Metsiä suojellaan lisää",
      nameEn: "More forest protected",
      type: "sinks",
      mt: 0.18,
      unit: { step: "100 000 ha", max: 3 },
      source: "Ilmastopaneelin AFOLU-hanke: 100 000 ha suojelu 0,18 Mt vuodessa, noin 270 €/t",
    },

    // ---------- Carbon capture ----------
    "CL-25": {
      name: "Biolaitosten hiilidioksidi talteen ja varastoon",
      nameEn: "CO₂ from bio-based plants captured and stored",
      type: "sinks",
      mt: 3,
      source: "Ilmastopaneeli 2025: noin 3 Mt vuonna 2035, jos investointipäätökset tehdään pian; 160–260 €/t",
    },
    "CL-26": {
      name: "Talteenoton laajentaminen ja biohiili",
      nameEn: "More carbon capture and biochar",
      type: "sinks",
      mt: 2.5,
      source: "KEITO-skenaario: talteenotto jopa 5,5 Mt; biohiili noin 215 €/t (VTT)",
    },
  },

  sections: [
    { id: "energy", title: { fi: "Liikenne, koneet ja rakennukset", en: "Transport, machinery and buildings" } },
    { id: "food", title: { fi: "Maatalous ja ruoka", en: "Agriculture and food" } },
    { id: "land", title: { fi: "Metsät ja hiilinielut", en: "Forests and carbon sinks" } },
  ],

  questions: [
    // ---------- Transport, machinery and buildings ----------
    {
      id: "biofuels",
      section: "energy",
      title: { fi: "Sekoitetaanko bensaan ja dieseliin enemmän biopolttoainetta?", en: "Blend more biofuel into petrol and diesel?" },
      description: {
        fi: "Jakeluvelvoite määrää, kuinka suuri osa myydystä polttoaineesta on uusiutuvaa. Velvoitetta on laskettu viime vuosina. Bio-osuus nostaa pumppuhintaa.",
        en: "The blending obligation sets how much of the fuel sold must be renewable. It has been lowered in recent years. A higher bio share raises pump prices.",
      },
      levels: [
        {
          description: {
            fi: "Velvoite palautetaan alkuperäiselle tasolle.",
            en: "The obligation goes back to its original level.",
          },
          measures: ["CL-01"],
        },
        {
          description: {
            fi: "Velvoite palautetaan ja sitä nostetaan niin, että vuonna 2045 kaikki liikennepolttoaine on uusiutuvaa.",
            en: "The obligation is restored and raised so that all transport fuel is renewable by 2045.",
          },
          measures: ["CL-01", "CL-02"],
        },
      ],
    },
    {
      id: "fuel-tax",
      section: "energy",
      title: { fi: "Nostetaanko polttoaineveroa?", en: "Raise the fuel tax?" },
      description: {
        fi: "Kalliimpi polttoaine vähentää ajamista ja nopeuttaa siirtymää sähköautoihin. Vero tuo valtiolle tuloja, mutta kiristys osuu eniten maaseudulla asuviin.",
        en: "More expensive fuel means less driving and a faster switch to electric cars. The tax brings in revenue, but hits people in rural areas hardest.",
      },
      levels: [
        { description: { fi: "Vero nousee 10 senttiä litralta.", en: "The tax rises by 10 cents a litre." }, measures: ["CL-03"] },
        { description: { fi: "Vero nousee 20 senttiä litralta.", en: "The tax rises by 20 cents a litre." }, measures: ["CL-03*2"] },
      ],
    },
    {
      id: "electric-vehicles",
      section: "energy",
      title: { fi: "Vauhditetaanko autojen sähköistymistä?", en: "Speed up the switch to electric vehicles?" },
      description: {
        fi: "Esimerkiksi verotuksella, latausverkolla ja hankintatuilla. Tieliikenne on Suomen suurin päästölähde päästökaupan ulkopuolella.",
        en: "With taxes, charging networks and purchase grants, for example. Road transport is Finland's largest source of emissions outside emissions trading.",
      },
      levels: [
        { description: { fi: "Henkilöautot sähköistyvät nykyistä nopeammin.", en: "Cars go electric faster than now." }, measures: ["CL-04"] },
        {
          description: { fi: "Myös paketti- ja kuorma-autot sähköistyvät nopeammin.", en: "Vans and lorries go electric faster too." },
          measures: ["CL-04", "CL-05"],
        },
      ],
    },
    {
      id: "congestion",
      section: "energy",
      title: { fi: "Otetaanko suurissa kaupungeissa käyttöön ruuhkamaksut?", en: "Introduce congestion charges in the largest cities?" },
      description: {
        fi: "Autoilusta maksetaan ruuhka-aikaan. Maksu vähentää ruuhkia ja tuo rahaa joukkoliikenteelle, mutta päästövaikutus on arvioiden mukaan pieni.",
        en: "Drivers pay during rush hours. The charge eases congestion and funds public transport, but its effect on emissions is estimated to be small.",
      },
      levels: [
        {
          description: { fi: "Ruuhkamaksut Helsingin ja Tampereen seuduille.", en: "Congestion charges in the Helsinki and Tampere regions." },
          measures: ["CL-06"],
        },
      ],
    },
    {
      id: "machinery",
      section: "energy",
      title: { fi: "Vähennetäänkö työkoneiden fossiilista polttoainetta?", en: "Cut fossil fuel use in work machines?" },
      description: {
        fi: "Traktorit, kaivinkoneet ja muut työkoneet päästävät noin 2,5 Mt vuodessa. Kevyen polttoöljyn hinta nousisi.",
        en: "Tractors, excavators and other machines emit about 2.5 Mt a year. The price of light fuel oil would rise.",
      },
      levels: [
        {
          description: { fi: "Maatalouden polttoaineiden veronpalautus poistetaan.", en: "The tax refund on farm fuels is removed." },
          measures: ["CL-07"],
        },
        {
          description: {
            fi: "Veronpalautus poistetaan, ja kevyeen polttoöljyyn sekoitetaan 30 % uusiutuvaa.",
            en: "The refund is removed and light fuel oil must contain 30% renewable fuel.",
          },
          measures: ["CL-07", "CL-08"],
        },
      ],
    },
    {
      id: "buildings",
      section: "energy",
      title: { fi: "Tuetaanko öljylämmityksestä luopumista ja energiaremontteja?", en: "Support giving up oil heating and energy renovations?" },
      description: {
        fi: "Avustuksilla ja verotuksella. Suurin osa rakennusten päästöistä on jo päästökaupan piirissä, joten lisävähennys on maltillinen.",
        en: "With grants and taxes. Most building emissions are already in emissions trading, so the extra cut is moderate.",
      },
      levels: [
        {
          description: { fi: "Loputkin öljylämmitykset vaihdetaan lämpöpumppuihin.", en: "The remaining oil heating is replaced with heat pumps." },
          measures: ["CL-09"],
        },
        {
          description: {
            fi: "Öljylämmityksen lisäksi tuetaan energiaremontteja ja lämmityksen sähköistämistä laajasti.",
            en: "Besides oil heating, energy renovations and electric heating get broad support.",
          },
          measures: ["CL-09", "CL-10"],
        },
      ],
    },

    // ---------- Agriculture and food ----------
    {
      id: "peat-fields",
      section: "food",
      title: { fi: "Nostetaanko turvepeltojen vedenpintaa?", en: "Raise the water table in peat fields?" },
      description: {
        fi: "Ojitettu turvepelto on vain kymmenesosa pelloista, mutta yli puolet peltojen päästöistä. Märempänä turve ei hajoa. Viljelijöille maksettaisiin korvaus.",
        en: "Drained peat fields are only a tenth of farmland but more than half of its emissions. Kept wet, the peat stops breaking down. Farmers would be compensated.",
      },
      levels: [
        {
          description: {
            fi: "Huonoimpia turvepeltoja muutetaan kosteikoiksi tai märkäviljelyyn.",
            en: "The poorest peat fields become wetlands or are farmed wet.",
          },
          measures: ["CL-11"],
        },
        {
          description: {
            fi: "Lisäksi muille turvepelloille säätösalaojitus ja monivuotiset nurmet.",
            en: "In addition, controlled drainage and perennial grass on other peat fields.",
          },
          measures: ["CL-11", "CL-12"],
        },
      ],
    },
    {
      id: "farming",
      section: "food",
      title: { fi: "Muutetaanko viljelyä ja karjataloutta ilmastoystävällisemmiksi?", en: "Make farming and livestock more climate-friendly?" },
      description: {
        fi: "Tuilla, jotka maksetaan saavutetusta päästövähennyksestä tai hiilen sidonnasta.",
        en: "With payments based on the emission cuts or carbon storage achieved.",
      },
      levels: [
        {
          description: {
            fi: "Typpilannoitus tarkemmaksi ja lehmille metaania vähentävä rehun lisäaine.",
            en: "More precise nitrogen fertilisation and a methane-reducing feed additive for cattle.",
          },
          measures: ["CL-13"],
        },
        {
          description: {
            fi: "Lisäksi peltojen hiilivarastoa kasvatetaan esimerkiksi kerääjäkasveilla ja nurmilla.",
            en: "In addition, carbon in fields is built up with cover crops and grass, for example.",
          },
          measures: ["CL-13", "CL-14"],
        },
      ],
    },
    {
      id: "diet",
      section: "food",
      title: { fi: "Ohjataanko ruokavaliota kasvispainotteisemmaksi?", en: "Steer diets towards more plant-based food?" },
      description: {
        fi: "Liha- ja maitotuotteet ovat noin kaksi kolmasosaa ruoan ilmastovaikutuksesta. Ilmastopaneeli ehdottaa tavoitetta, että puolet proteiinista tulisi kasveista.",
        en: "Meat and dairy make up about two thirds of the climate impact of food. The Climate Change Panel proposes a target of half of protein coming from plants.",
      },
      levels: [
        {
          description: {
            fi: "Valtio asettaa 50/50-tavoitteen ja ohjaa siihen esimerkiksi julkisissa ruokapalveluissa ja tuilla.",
            en: "The state sets a 50/50 target and steers towards it through public catering and subsidies, for example.",
          },
          measures: ["CL-15"],
        },
      ],
    },

    // ---------- Forests and carbon sinks ----------
    {
      id: "forest-management",
      section: "land",
      title: { fi: "Muutetaanko metsänhoitoa niin, että metsiin sitoutuu enemmän hiiltä?", en: "Change forestry so that forests store more carbon?" },
      description: {
        fi: "Metsälain vaatimuksilla tai maksamalla metsänomistajille hiilen sidonnasta. Metsien nielu on heikentynyt selvästi 2010-luvulta.",
        en: "Through requirements in the Forest Act or by paying forest owners for storing carbon. The forest sink has weakened sharply since the 2010s.",
      },
      levels: [
        {
          description: { fi: "Puut kasvatetaan järeämmiksi ennen päätehakkuuta.", en: "Trees are grown larger before final felling." },
          measures: ["CL-16"],
        },
        {
          description: { fi: "Lisäksi metsät kasvatetaan tiheämpinä harvennusten jälkeen.", en: "In addition, forests are kept denser after thinning." },
          measures: ["CL-16", "CL-17"],
        },
        {
          name: { fi: "Kaikki keinot", en: "Everything" },
          description: {
            fi: "Lisäksi metsiin jätetään enemmän lahopuuta ja säästöpuita.",
            en: "In addition, more deadwood and retention trees are left in forests.",
          },
          measures: ["CL-16", "CL-17", "CL-18"],
        },
      ],
    },
    {
      id: "peatland-forests",
      section: "land",
      title: { fi: "Vähennetäänkö ojitettujen suometsien päästöjä?", en: "Cut emissions from drained peatland forests?" },
      description: {
        fi: "Kun suon pohjavesi on syvällä, turve hajoaa ja vapauttaa hiilidioksidia. Ojitukset tehtäisiin luvanvaraisiksi.",
        en: "When the water table is low, peat breaks down and releases carbon dioxide. Ditching would need a permit.",
      },
      levels: [
        {
          description: {
            fi: "Uudet ojitukset luvanvaraisiksi, eikä reheviä turvemaita avohakata.",
            en: "New ditching needs a permit, and fertile peatland is not clear-cut.",
          },
          measures: ["CL-19"],
        },
      ],
    },
    {
      id: "harvests",
      section: "land",
      title: { fi: "Hakataanko metsiä vähemmän?", en: "Harvest less wood?" },
      description: {
        fi:
          "Hakkuut ovat nousseet noin 74 miljoonaan kuutioon vuodessa. Jokainen hakkaamatta jäävä miljoona kuutiota vahvistaa nielua noin 1,5 Mt. " +
          "Metsäteollisuuden tuotanto, vienti ja metsänomistajien tulot pienenisivät.",
        en:
          "Harvests have risen to about 74 million cubic metres a year. Every million cubic metres left standing strengthens the sink by about 1.5 Mt. " +
          "Forest industry output, exports and forest owners' income would fall.",
      },
      levels: [
        {
          description: {
            fi: "Puun polttamista energiaksi verotetaan, ja voimaloissa poltetaan puolet vähemmän runkopuuta.",
            en: "Burning wood for energy is taxed, and power plants burn half as much roundwood.",
          },
          measures: ["CL-20"],
        },
        {
          description: {
            fi: "Hakkuille asetetaan yläraja 64 miljoonaa kuutiota, esimerkiksi huutokaupattavilla hakkuuoikeuksilla.",
            en: "Harvests are capped at 64 million cubic metres, for example with auctioned harvesting rights.",
          },
          measures: ["CL-21"],
        },
        {
          name: { fi: "Paljon enemmän", en: "Much more" },
          description: {
            fi: "Hakkuiden yläraja on 60 miljoonaa kuutiota.",
            en: "Harvests are capped at 60 million cubic metres.",
          },
          measures: ["CL-22"],
        },
      ],
    },
    {
      id: "land-use-change",
      section: "land",
      title: { fi: "Laitetaanko metsän raivaamiselle maksu?", en: "Charge a fee for clearing forest?" },
      description: {
        fi: "Metsää raivataan pelloiksi, teiksi, rakentamiseen sekä tuuli- ja aurinkovoimaloille. Maksu ohjaisi rakentamaan sinne, missä metsää ei tarvitse kaataa.",
        en: "Forest is cleared for fields, roads, buildings and wind and solar farms. A fee would steer building to places where no forest needs to be cut.",
      },
      levels: [
        {
          description: {
            fi: "Maankäytön muutosmaksu, joka puolittaa metsän raivaamisen.",
            en: "A land use change fee that halves forest clearing.",
          },
          measures: ["CL-23"],
        },
      ],
    },
    {
      id: "protection",
      section: "land",
      title: { fi: "Suojellaanko lisää metsiä?", en: "Protect more forest?" },
      description: {
        fi: "Suojelu turvaa ennen kaikkea luontoa; ilmastohyöty on sivutuote. Suojelu maksaa valtiolle korvauksia ja voi lisätä hakkuita muualla.",
        en: "Protection is above all about nature; the climate benefit is a side effect. The state pays compensation, and harvests may increase elsewhere.",
      },
      levels: [
        { description: { fi: "Suojellaan 100 000 hehtaaria lisää.", en: "Another 100,000 hectares protected." }, measures: ["CL-24"] },
        { description: { fi: "Suojellaan 300 000 hehtaaria lisää.", en: "Another 300,000 hectares protected." }, measures: ["CL-24*3"] },
      ],
    },
    {
      id: "carbon-capture",
      section: "land",
      title: { fi: "Tuetaanko hiilidioksidin talteenottoa ja varastointia?", en: "Support capturing and storing carbon dioxide?" },
      description: {
        fi: "Sellutehtaiden ja biovoimaloiden hiilidioksidi voidaan ottaa talteen ja varastoida pysyvästi. Tekniikka on kallista ja vasta alussa.",
        en: "CO₂ from pulp mills and biomass power plants can be captured and stored permanently. The technology is expensive and still new.",
      },
      levels: [
        {
          description: {
            fi: "Kansallinen tavoite ja tuki ensimmäisille laitoksille.",
            en: "A national target and support for the first plants.",
          },
          measures: ["CL-25"],
        },
        {
          description: {
            fi: "Talteenotto laajenee useisiin laitoksiin, ja biohiiltä käytetään maanparannukseen.",
            en: "Capture spreads to many plants, and biochar is used to improve soils.",
          },
          measures: ["CL-25", "CL-26"],
        },
      ],
    },
  ],

  sources: [
    {
      name: { fi: "Ilmastopaneeli: Politiikkasuositukset 2026", en: "Finnish Climate Change Panel: Policy recommendations 2026 (in Finnish)" },
      url: "https://ilmastopaneeli.fi/ilmastopaneelin-politiikkasuositukset-14-keinoa-kuilun-kuromiseen/",
    },
    {
      name: { fi: "Ilmastopaneelin politiikkatoimilista TEM:lle (4.9.2026)", en: "Climate Change Panel: list of policy measures for TEM (4 Sep 2026, in Finnish)" },
      url: "https://ilmastopaneeli.fi/hallinta/wp-content/uploads/2026/09/Politiikkatoimilista_Ilmastopaneelilta_TEMlle-4.9.2026-netti.pdf",
    },
    {
      name: { fi: "Karhinen ym. 2026: Päästövähennysten potentiaalit ja kustannukset (SYKE)", en: "Karhinen et al. 2026: Emission reduction potentials and costs (SYKE, in Finnish)" },
      url: "https://urn.fi/URN:ISBN:978-952-11-5841-4",
    },
    {
      name: { fi: "Lounasheimo ym. 2026: ILMATAR-hanke", en: "Lounasheimo et al. 2026: ILMATAR project (in Finnish)" },
      url: "http://hdl.handle.net/10138/628770",
    },
    {
      name: { fi: "Luke 2022: Hiilineutraali Suomi 2035 – maatalous ja ruokavalio", en: "Luke 2022: Carbon neutral Finland 2035 – agriculture and diet (in Finnish)" },
      url: "https://urn.fi/URN:ISBN:978-952-380-500-2",
    },
    {
      name: { fi: "Ilmastopaneelin lausunto ilmastovuosikertomuksesta 2026", en: "Climate Change Panel statement on the Annual Climate Report 2026 (in Finnish)" },
      url: "https://ilmastopaneeli.fi/hae-lausuntoja/k-19-2026-vp-ilmastovuosikertomus-2026-3/",
    },
    {
      name: { fi: "Tilastokeskus: Kasvihuonekaasupäästöt 2025 (ennakko)", en: "Statistics Finland: Greenhouse gas emissions 2025 (preliminary)" },
      url: "https://stat.fi/fi/uutinen/Kasvihuonekaasupaeaestoet-laskivat-vuonna-2025-maankaeyttoesektori-oli-jaelleen-paeaestoelaehde",
    },
    {
      name: { fi: "Forster ym. 2025: Indicators of Global Climate Change (hiilibudjetti)", en: "Forster et al. 2025: Indicators of Global Climate Change (carbon budget)" },
      url: "https://essd.copernicus.org/articles/17/2641/2025/",
    },
  ],
};
