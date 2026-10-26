// Leikkauskone settings – safe to edit.
// All amounts are in million euros per year.

window.CONFIG = {
  // Year whose figures are shown by default (2028–2035).
  // 2031 = last year of the next parliamentary term, which the fiscal adjustment target refers to.
  defaultYear: 2031,

  // Upper end of the meter scale (M€). Grows automatically if the selection exceeds it.
  scaleMax: 14000,

  // Meter milestones, smallest first.
  milestones: [
    {
      value: 4500,
      short: "EU 3 %",
      name: "Alijäämä EU:n 3 %:n rajan alle",
      description:
        "Karkea arvio: julkisen talouden alijäämä on VM:n syysennusteessa noin 4,5 % BKT:sta vuosina 2027–2030. " +
        "1,5 prosenttiyksikön vahvistus on noin 4,5 mrd euroa.",
    },
    {
      value: 8000,
      short: "8 mrd",
      name: "Sopeutustavoitteen alaraja",
      description:
        "Parlamentaarisen työryhmän alustava tavoite: julkista taloutta vahvistetaan noin 8–11 mrd euroa vuoteen 2031 mennessä.",
    },
    {
      value: 11000,
      short: "11 mrd",
      name: "Sopeutustavoitteen yläraja",
      description: "Sopeutustarpeen haarukan yläpää (VM:n laskelmat, Valtioneuvoston julkaisuja 2026:17).",
    },
    {
      value: 12300,
      short: "Tasapaino",
      name: "Valtion budjetti tasapainoon",
      description:
        "Vuoden 2027 talousarvioesityksessä valtion menot ovat 92,5 mrd € ja tulot 80,2 mrd €, eli alijäämä on noin 12,3 mrd €.",
    },
  ],

  // Category colours come, in order, from the --series-1 … --series-8 variables in style.css.

  // Short notes shown under categories (keyed by category id).
  categoryDescriptions: {
    SOS:
      "Moni etuusmuutos lisää toimeentulotuen menoja; VM:n luvut ovat nettoja. Työeläketoimien säästö kertyy eläkerahastoihin – kytke sosiaaliturvarahastot mukaan nähdäksesi sen.",
    IND: "Yleinen indeksijäädytys kattaa monia muiden ryhmien yksittäisiä indeksitoimia, joten niitä ei voi valita samaan aikaan.",
    VAL: "Henkilöstötoimien luvut koskevat koko julkista sektoria (valtio, kunnat ja hyvinvointialueet).",
    VER:
      "VM:n verokartoituksen tuottoarviot ovat vuoden 2028 tasossa, ja koneessa ne oletetaan samoiksi muinakin vuosina. Kun VM kertoo nettovaikutuksen julkiseen talouteen (indeksietuudet ja hintajousto huomioiden), käytetään sitä. Säädettävät rivit ovat VM:n yksikkötuottoja.",
  },

  sources: [
    {
      name: "VM: Julkisen talouden meno- ja rakennekartoitus (26.10.2026)",
      url: "https://vm.fi/meno-ja-rakennekartoitus-seka-verokartoitus",
    },
    {
      name: "Julkisen talouden ylivaalikautinen tavoite 2027–2033 (VN julkaisuja 2026:17)",
      url: "https://julkaisut.valtioneuvosto.fi/server/api/core/bitstreams/1bae1435-04e6-4e5d-8ed5-0e4d14e17f36/content",
    },
    {
      name: "VM: Vuoden 2027 talousarvioesitys",
      url: "https://vm.fi/en/-/proposal-for-2027-budget-submitted-to-parliament",
    },
    {
      name: "VM: Taloudellinen katsaus, syksy 2026",
      url: "https://vm.fi/en/economic-survey-autumn-2026",
    },
  ],
};
