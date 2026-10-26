// Leikkauskone settings – safe to edit.
// All amounts are in million euros per year.
// Texts are given per language as { fi: "...", en: "..." }.

export const CONFIG = {
  // Languages in the language menu; the first one is the fallback. UI strings for each are in strings.js.
  languages: [
    { code: "fi", name: "Suomi" },
    { code: "en", name: "English" },
  ],

  // Year whose figures are shown by default (2028–2035).
  // 2031 = last year of the next parliamentary term, which the fiscal adjustment target refers to.
  defaultYear: 2031,

  // The meter bar ends where the state budget is in balance (and grows if the selection goes beyond it).
  // The adjustment target is drawn as a band, other reference points as markers.
  meter: {
    scaleMax: 12300,
    target: { from: 8000, to: 11000, label: { fi: "Tavoite 8–11 mrd", en: "Target €8–11bn" } },
    markers: [
      { value: 4500, label: { fi: "EU:n 3 %:n raja", en: "EU 3% limit" } },
      { value: 12300, label: { fi: "Tasapaino", en: "Balance" } },
    ],
  },

  // Milestones for the texts about the next target, smallest first.
  milestones: [
    {
      value: 4500,
      name: { fi: "Alijäämä EU:n 3 %:n rajan alle", en: "Deficit below the EU 3% limit" },
      description: {
        fi:
          "Karkea arvio: julkisen talouden alijäämä on VM:n syysennusteessa noin 4,5 % BKT:sta vuosina 2027–2030. " +
          "1,5 prosenttiyksikön vahvistus on noin 4,5 mrd euroa.",
        en:
          "Rough estimate: in VM's autumn forecast the general government deficit is about 4.5% of GDP in 2027–2030. " +
          "Strengthening it by 1.5 percentage points is about €4.5 billion.",
      },
    },
    {
      value: 8000,
      name: { fi: "Sopeutustavoitteen alaraja", en: "Lower end of the adjustment target" },
      description: {
        fi: "Parlamentaarisen työryhmän alustava tavoite: julkista taloutta vahvistetaan noin 8–11 mrd euroa vuoteen 2031 mennessä.",
        en: "Preliminary target of the cross-party parliamentary working group: strengthen public finances by about €8–11 billion by 2031.",
      },
    },
    {
      value: 11000,
      name: { fi: "Sopeutustavoitteen yläraja", en: "Upper end of the adjustment target" },
      description: {
        fi: "Sopeutustarpeen haarukan yläpää (VM:n laskelmat, Valtioneuvoston julkaisuja 2026:17).",
        en: "Upper end of the estimated adjustment need (VM calculations, Finnish Government publication 2026:17).",
      },
    },
    {
      value: 12300,
      name: { fi: "Valtion budjetti tasapainoon", en: "State budget in balance" },
      description: {
        fi: "Vuoden 2027 talousarvioesityksessä valtion menot ovat 92,5 mrd € ja tulot 80,2 mrd €, eli alijäämä on noin 12,3 mrd €.",
        en: "In the 2027 budget proposal, central government spending is €92.5 billion and revenue €80.2 billion – a deficit of about €12.3 billion.",
      },
    },
  ],

  // Short notes shown under categories (keyed by category id).
  categoryDescriptions: {
    SOS: {
      fi: "Moni etuusmuutos lisää toimeentulotuen menoja; VM:n luvut ovat nettoja. Työeläketoimien säästö kertyy eläkerahastoihin – kytke sosiaaliturvarahastot mukaan nähdäksesi sen.",
      en: "Many benefit cuts increase social assistance spending; VM's figures are net of this. Savings from earnings-related pension measures accrue to pension funds – include social security funds to see them.",
    },
    IND: {
      fi: "Yleinen indeksijäädytys kattaa monia muiden ryhmien yksittäisiä indeksitoimia, joten niitä ei voi valita samaan aikaan.",
      en: "The general index freeze covers many individual index measures in other groups, so they cannot be selected at the same time.",
    },
    VAL: {
      fi: "Henkilöstötoimien luvut koskevat koko julkista sektoria (valtio, kunnat ja hyvinvointialueet).",
      en: "Staff measures apply to the whole public sector (central government, municipalities and wellbeing services counties).",
    },
    VER: {
      fi: "VM:n verokartoituksen tuottoarviot ovat vuoden 2028 tasossa, ja koneessa ne oletetaan samoiksi muinakin vuosina. Kun VM kertoo nettovaikutuksen julkiseen talouteen (indeksietuudet ja hintajousto huomioiden), käytetään sitä. Säädettävät rivit ovat VM:n yksikkötuottoja.",
      en: "Revenue estimates from VM's tax review are at the 2028 level and are assumed constant in other years. Where VM gives the net effect on public finances (including index-linked benefits and price elasticity), that figure is used. Adjustable rows are VM's per-unit yields.",
    },
  },

  sources: [
    {
      name: {
        fi: "VM: Julkisen talouden meno- ja rakennekartoitus (26.10.2026)",
        en: "VM: Review of public spending and structures (26 Oct 2026, in Finnish)",
      },
      url: "https://vm.fi/meno-ja-rakennekartoitus-seka-verokartoitus",
    },
    {
      name: {
        fi: "Julkisen talouden ylivaalikautinen tavoite 2027–2033 (VN julkaisuja 2026:17)",
        en: "Multi-term fiscal target 2027–2033 (Finnish Government publication 2026:17, in Finnish)",
      },
      url: "https://julkaisut.valtioneuvosto.fi/server/api/core/bitstreams/1bae1435-04e6-4e5d-8ed5-0e4d14e17f36/content",
    },
    {
      name: { fi: "VM: Vuoden 2027 talousarvioesitys", en: "VM: Proposal for the 2027 budget" },
      url: "https://vm.fi/en/-/proposal-for-2027-budget-submitted-to-parliament",
    },
    {
      name: { fi: "VM: Taloudellinen katsaus, syksy 2026", en: "VM: Economic survey, autumn 2026" },
      url: "https://vm.fi/en/economic-survey-autumn-2026",
    },
  ],
};
