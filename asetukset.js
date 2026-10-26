// Leikkauskoneen asetukset – tätä tiedostoa voi muokata vapaasti.
// Summat ovat miljoonia euroja vuodessa.

window.ASETUKSET = {
  // Vuosi, jonka säästöt näytetään oletuksena (2028–2035).
  // 2031 = seuraavan vaalikauden viimeinen vuosi, johon sopeutustavoite kohdistuu.
  oletusvuosi: 2031,

  // Mittarin asteikon loppupää (milj. €). Kasvaa automaattisesti, jos valinnat ylittävät sen.
  asteikonMaksimi: 14000,

  // Mittarin virstanpylväät pienimmästä suurimpaan.
  virstanpylvaat: [
    {
      arvo: 4500,
      lyhyt: "EU 3 %",
      nimi: "Alijäämä EU:n 3 %:n rajan alle",
      kuvaus:
        "Karkea arvio: julkisen talouden alijäämä on VM:n syysennusteessa noin 4,5 % BKT:sta vuosina 2027–2030. " +
        "1,5 prosenttiyksikön vahvistus on noin 4,5 mrd euroa.",
    },
    {
      arvo: 8000,
      lyhyt: "8 mrd",
      nimi: "Sopeutustavoitteen alaraja",
      kuvaus:
        "Parlamentaarisen työryhmän alustava tavoite: julkista taloutta vahvistetaan noin 8–11 mrd euroa vuoteen 2031 mennessä.",
    },
    {
      arvo: 11000,
      lyhyt: "11 mrd",
      nimi: "Sopeutustavoitteen yläraja",
      kuvaus: "Sopeutustarpeen haarukan yläpää (VM:n laskelmat, Valtioneuvoston julkaisuja 2026:17).",
    },
    {
      arvo: 12300,
      lyhyt: "Tasapaino",
      nimi: "Valtion budjetti tasapainoon",
      kuvaus:
        "Vuoden 2027 talousarvioesityksessä valtion menot ovat 92,5 mrd € ja tulot 80,2 mrd €, eli alijäämä on noin 12,3 mrd €.",
    },
  ],

  // Pääluokkien värit tulevat järjestyksessä style.css:n muuttujista --sarja-1 … --sarja-8.

  // Lyhyet selitteet pääluokkien alle (avaimena pääluokan tunnus).
  paaluokkaKuvaukset: {
    SOS:
      "Moni etuusmuutos lisää toimeentulotuen menoja; VM:n luvut ovat nettoja. Työeläketoimien säästö kertyy eläkerahastoihin – kytke sosiaaliturvarahastot mukaan nähdäksesi sen.",
    IND: "Yleinen indeksijäädytys kattaa monia muiden ryhmien yksittäisiä indeksitoimia, joten niitä ei voi valita samaan aikaan.",
    VAL: "Henkilöstötoimien luvut koskevat koko julkista sektoria (valtio, kunnat ja hyvinvointialueet).",
    VER:
      "VM:n verokartoituksen tuottoarviot ovat vuoden 2028 tasossa, ja koneessa ne oletetaan samoiksi muinakin vuosina. Kun VM kertoo nettovaikutuksen julkiseen talouteen (indeksietuudet ja hintajousto huomioiden), käytetään sitä. Säädettävät rivit ovat VM:n yksikkötuottoja.",
  },

  lahteet: [
    {
      nimi: "VM: Julkisen talouden meno- ja rakennekartoitus (26.10.2026)",
      url: "https://vm.fi/meno-ja-rakennekartoitus-seka-verokartoitus",
    },
    {
      nimi: "Julkisen talouden ylivaalikautinen tavoite 2027–2033 (VN julkaisuja 2026:17)",
      url: "https://julkaisut.valtioneuvosto.fi/server/api/core/bitstreams/1bae1435-04e6-4e5d-8ed5-0e4d14e17f36/content",
    },
    {
      nimi: "VM: Vuoden 2027 talousarvioesitys",
      url: "https://vm.fi/en/-/proposal-for-2027-budget-submitted-to-parliament",
    },
    {
      nimi: "VM: Taloudellinen katsaus, syksy 2026",
      url: "https://vm.fi/en/economic-survey-autumn-2026",
    },
  ],
};
