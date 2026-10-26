// Easy-mode questions – safe to edit.
//
// Every question has the options "No change" (added automatically), "A little" (first level) and "A lot" (second level).
// Each level selects Ministry of Finance measures behind the scenes (ids are listed in data/grouping.csv and
// data/taxes.csv), so easy-mode choices show up as such in the detailed view.
// Unit-yield measures take a step count after an asterisk, e.g. "VER-74*3".
// Euro amounts are calculated from the data automatically – do not write them into the texts.
// Texts are given per language as { fi: "...", en: "..." }.

window.QUESTIONS = {
  sections: [
    { id: "spending", title: { fi: "Mistä leikataan?", en: "Where do we cut?" } },
    { id: "tax", title: { fi: "Mitä verotetaan enemmän?", en: "What do we tax more?" } },
  ],

  questions: [
    // ---------- Spending ----------
    {
      id: "indexation",
      section: "spending",
      title: {
        fi: "Jäädytetäänkö etuuksien ja menojen indeksikorotukset?",
        en: "Freeze the index increases of benefits and spending?",
      },
      description: {
        fi: "Moni etuus ja meno nousee joka vuosi hintojen mukana. Jäädytys vuosiksi 2028–2031 tarkoittaa, ettei niitä koroteta lainkaan.",
        en: "Many benefits and spending items rise with prices every year. A freeze for 2028–2031 means they are not raised at all.",
      },
      levels: [
        {
          description: {
            fi: "Kelan etuudet, kuten kansaneläke, työttömyysturva ja opintoraha, eivät nouse neljään vuoteen.",
            en: "Benefits paid by Kela (the social insurance institution), such as the national pension, unemployment benefit and study grant, do not rise for four years.",
          },
          measures: ["SOS-59"],
        },
        {
          description: {
            fi: "Kaikki indeksikorotukset jäädytetään: etuudet, työeläkkeet, kuntien valtionosuudet sekä koulutuksen ja puolustuksen rahoitus.",
            en: "All index increases are frozen: benefits, earnings-related pensions, transfers to municipalities, and education and defence funding.",
          },
          measures: ["IND-05"],
        },
      ],
    },
    {
      id: "public-staff",
      section: "spending",
      title: {
        fi: "Vähennetäänkö julkisen sektorin henkilöstöä ja palkkaetuja?",
        en: "Cut public sector staff and employment perks?",
      },
      description: {
        fi: "Koskee valtion, kuntien ja hyvinvointialueiden työntekijöitä, esimerkiksi hoitajia, opettajia ja virkamiehiä.",
        en: "Applies to employees of central government, municipalities and wellbeing services counties – nurses, teachers and civil servants, for example.",
      },
      levels: [
        {
          description: {
            fi: "Henkilöstöä vähennetään 1 %, lomarahat pienenevät hieman ja pisimmät vuosilomat lyhenevät kahdella päivällä.",
            en: "Staff is reduced by 1%, holiday pay is trimmed and the longest annual leaves are shortened by two days.",
          },
          measures: ["VAL-41", "VAL-50", "VAL-49"],
        },
        {
          description: {
            fi: "Eläkkeelle jäävien tilalle ei palkata uusia, lomarahat puolitetaan ja pisimmät vuosilomat lyhenevät 38 päivästä 30 päivään.",
            en: "Retiring staff are not replaced, holiday bonuses are halved and the longest annual leaves are cut from 38 to 30 days.",
          },
          measures: ["VAL-42", "VAL-51", "VAL-48"],
        },
      ],
    },
    {
      id: "administration",
      section: "spending",
      title: {
        fi: "Karsitaanko valtionhallintoa ja poliittista koneistoa?",
        en: "Trim central government and the political machinery?",
      },
      description: {
        fi: "Virastojen, ministeriöiden ja valtion avustusjärjestelmän tehostamista.",
        en: "Making agencies, ministries and the government grant system more efficient.",
      },
      levels: [
        {
          description: {
            fi: "Virastoille tuottavuusvaatimus, hankinnat ja tietojärjestelmät tehokkaammiksi, vähemmän matkustamista.",
            en: "A productivity requirement for agencies, more efficient procurement and IT, less travel.",
          },
          measures: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63"],
        },
        {
          description: {
            fi: "Edellisten lisäksi valtionavustukset uudistetaan, ministeriöitä yhdistetään, puoluetukea, poliittisia avustajia, eduskunnan joululahjarahoja ja kansanedustajien määrää karsitaan, ja budjetin varauksia pienennetään.",
            en: "On top of that, government grants are reformed, ministries merged, party subsidies, political advisers, Parliament's Christmas donations and the number of MPs cut, and budget reserves reduced.",
          },
          measures: ["HAL-77", "HAL-67", "HAL-58", "HAL-72", "HAL-62", "HAL-63", "VAL-24", "VAL-28", "VAL-18", "VAL-12", "VAL-16", "VAL-08", "VAL-15"],
        },
      ],
    },
    {
      id: "business-subsidies",
      section: "spending",
      title: {
        fi: "Leikataanko yritystukia ja tutkimusrahoitusta?",
        en: "Cut business subsidies and research funding?",
      },
      description: {
        fi: "Valtio tukee yrityksiä suoraan ja on sitoutunut kasvattamaan tutkimus- ja kehitysrahoitusta vuoteen 2030 asti.",
        en: "The state supports companies directly and is committed by law to increasing R&D funding until 2030.",
      },
      levels: [
        {
          description: {
            fi: "Suoria yritystukia leikataan 30 %, ja osa tutkimusrahoituksesta katetaan EU-rahoituksella.",
            en: "Direct business subsidies are cut by 30%, and part of research funding is covered with EU money.",
          },
          measures: ["ELI-25", "ELI-07", "ELI-41"],
        },
        {
          description: {
            fi: "Edellisten lisäksi tutkimus- ja kehitysrahoitus palautetaan vuoden 2023 tasolle. Tämä voi heikentää talouskasvua pitkällä aikavälillä.",
            en: "On top of that, R&D funding returns to its 2023 level. This may weaken economic growth in the long run.",
          },
          measures: ["ELI-06", "ELI-25", "ELI-07", "ELI-41"],
        },
      ],
    },
    {
      id: "agriculture",
      section: "spending",
      title: { fi: "Leikataanko maataloustuista?", en: "Cut agricultural subsidies?" },
      description: {
        fi: "Suomi maksaa maataloudelle EU-tukien lisäksi omaa kansallista tukea.",
        en: "On top of EU subsidies, Finland pays its own national support to agriculture.",
      },
      levels: [
        {
          description: {
            fi: "Kansallista tukea lasketaan asteittain, ja tuet passiiviviljelylle lopetetaan.",
            en: "National support is reduced gradually, and subsidies for passive farming end.",
          },
          measures: ["ELI-56", "ELI-72"],
        },
        {
          description: {
            fi: "Kansallinen tuki ja kansallinen lisärahoitus EU-tukiin lakkautetaan, ja myös valtion rahoittama lomitus sekä energiaveron palautus loppuvat.",
            en: "National support and national top-ups to EU subsidies are abolished, and state-funded farm relief services and the energy tax refund end too.",
          },
          measures: ["ELI-55", "ELI-58", "ELI-72", "ELI-16", "SOS-68"],
        },
      ],
    },
    {
      id: "foreign-aid",
      section: "spending",
      title: {
        fi: "Leikataanko kehitysyhteistyöstä ja ulkomaille annettavasta avusta?",
        en: "Cut development cooperation and aid abroad?",
      },
      description: {
        fi: "Kehitysyhteistyöstä on jo leikattu kuluvalla vaalikaudella.",
        en: "Development cooperation has already been cut during the current parliamentary term.",
      },
      levels: [
        {
          description: {
            fi: "Kehityspoliittiset lainat ja sijoitukset loppuvat, ja edustustoja sekä siviilikriisinhallintaa karsitaan.",
            en: "Development loans and investments end, and embassies and civilian crisis management are trimmed.",
          },
          measures: ["HAL-19", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
        {
          description: {
            fi: "Varsinainen kehitysyhteistyö ja humanitaarinen apu lakkautetaan ja Ukrainan tukemisen momentti poistetaan.",
            en: "Development cooperation and humanitarian aid are ended, and the budget item for supporting Ukraine is removed.",
          },
          measures: ["HAL-16", "HAL-17", "HAL-19", "HAL-20", "HAL-18", "HAL-05", "HAL-13", "HAL-14"],
        },
      ],
    },
    {
      id: "defence",
      section: "spending",
      title: { fi: "Hidastetaanko puolustusmenojen kasvua?", en: "Slow down the growth of defence spending?" },
      description: {
        fi: "Suomi on sitoutunut Natossa nostamaan puolustusmenot 3,5 prosenttiin bruttokansantuotteesta vuoteen 2035 mennessä.",
        en: "In NATO, Finland has committed to raising defence spending to 3.5% of GDP by 2035.",
      },
      levels: [
        {
          description: {
            fi: "Tavoitteeseen edetään maltillisemmalla aikataululla.",
            en: "The target is reached on a slower schedule.",
          },
          measures: ["HAL-50"],
        },
        {
          description: {
            fi: "Menot pidetään noin 3 prosentissa vuoteen 2034 asti ja nostetaan vasta lopuksi. Hankintoja joudutaan lykkäämään, ja kriisinhallintaoperaatioihin osallistutaan vähemmän.",
            en: "Spending is kept at about 3% until 2034 and only raised at the end. Procurement has to be postponed, and Finland takes part in fewer crisis management operations.",
          },
          measures: ["HAL-51", "HAL-53"],
        },
      ],
    },
    {
      id: "families",
      section: "spending",
      title: { fi: "Leikataanko lapsiperheiden tuista?", en: "Cut support for families with children?" },
      description: {
        fi: "Lapsilisää maksetaan kaikista alle 17-vuotiaista, ja siihen kuluu noin 1,3 miljardia euroa vuodessa.",
        en: "Child benefit is paid for every child under 17 and costs about €1.3 billion a year.",
      },
      levels: [
        {
          description: {
            fi: "Lapsilisä on jokaisesta lapsesta yhtä suuri: sisarkorotukset ja alle 3-vuotiaiden korotus poistuvat.",
            en: "Child benefit becomes the same for every child: the sibling supplements and the supplement for under-3s are removed.",
          },
          measures: ["SOS-05", "SOS-06"],
        },
        {
          description: {
            fi: "Lapsilisä lakkautetaan kokonaan, varhaiskasvatusmaksut palautetaan vuotta 2017 edeltävälle tasolle ja joustava hoitoraha poistuu.",
            en: "Child benefit is abolished altogether, daycare fees return to pre-2017 levels and the flexible childcare allowance ends.",
          },
          measures: ["SOS-08", "KOU-13", "SOS-61"],
        },
      ],
    },
    {
      id: "low-income",
      section: "spending",
      title: {
        fi: "Leikataanko pienituloisten tuista, kuten asumistuesta ja takuueläkkeestä?",
        en: "Cut support for people on low incomes, such as housing allowance and the guarantee pension?",
      },
      description: {
        fi: "Asumistuki, toimeentulotuki ja pienimmät eläkkeet. VM:n luvuissa on jo huomioitu, että osa säästöstä valuu toimeentulotukeen.",
        en: "Housing allowance, social assistance and the smallest pensions. VM's figures already account for part of the savings leaking into social assistance.",
      },
      levels: [
        {
          description: {
            fi: "Yleisen asumistuen tukiprosentti laskee, eläkkeensaajan asumistuki rajataan vanhuuseläkeläisiin ja toimeentulotuen perusosa sidotaan ikään.",
            en: "The general housing allowance rate falls, pensioners' housing allowance is limited to old-age pensioners and the basic social assistance amount is linked to age.",
          },
          measures: ["SOS-12", "SOS-42", "SOS-13"],
        },
        {
          description: {
            fi: "Asumistukea leikataan kaikkialla, eläkkeensaajan asumistuki yhdistetään yleiseen asumistukeen, kansan- ja takuueläkkeet pienenevät ja yleistukeen tulee puolison tulojen tarveharkinta.",
            en: "Housing allowance is cut everywhere, pensioners' housing allowance is merged into the general one, national and guarantee pensions shrink and the general benefit becomes means-tested on spouse's income.",
          },
          measures: ["SOS-11", "SOS-12", "SOS-40", "SOS-33", "SOS-37", "SOS-13", "SOS-14"],
        },
      ],
    },
    {
      id: "education",
      section: "spending",
      title: {
        fi: "Leikataanko koulutuksesta ja opiskelijoiden tuista?",
        en: "Cut education and student support?",
      },
      description: {
        fi: "Koulutus on valtion suurimpia menoeriä, ja sen vaikutukset näkyvät pitkällä aikavälillä.",
        en: "Education is one of the state's largest expenses, and its effects show over the long term.",
      },
      levels: [
        {
          description: {
            fi: "Valtio rahoittaa vain ensimmäisen korkeakoulututkinnon, korkeakouluihin tulee lukukausimaksut ja opiskelijoiden ateriatuki lakkautetaan.",
            en: "The state funds only a person's first higher education degree, universities introduce tuition fees and the student meal subsidy ends.",
          },
          measures: ["KOU-43", "KOU-45", "KOU-44", "KOU-60"],
        },
        {
          description: {
            fi: "Edellisten lisäksi korkeakouluopiskelijoiden opintotuki muuttuu kokonaan lainaksi, oppivelvollisuuden pidennys perutaan, vapaan sivistystyön (esim. kansalaisopistojen) rahoitus lakkautetaan ja aikuisten ammatillista koulutusta karsitaan.",
            en: "On top of that, student aid for higher education becomes fully loan-based, the extension of compulsory schooling is reversed, funding for adult education centres ends and adult vocational training is cut.",
          },
          measures: ["KOU-43", "KOU-45", "KOU-44", "KOU-60", "KOU-57", "KOU-32", "KOU-27", "KOU-34"],
        },
      ],
    },
    {
      id: "health-social",
      section: "spending",
      title: { fi: "Karsitaanko sosiaali- ja terveyspalveluista?", en: "Trim health and social services?" },
      description: {
        fi: "Hyvinvointialueet järjestävät terveydenhuollon, vanhustenhoivan ja sosiaalipalvelut valtion rahoituksella.",
        en: "Wellbeing services counties provide health care, elderly care and social services, funded by the state.",
      },
      levels: [
        {
          description: {
            fi: "Vähähyötyisiä hoitoja vähennetään, ja sairaaloiden erikoispalveluja ja tukipalveluja keskitetään.",
            en: "Low-value treatments are reduced, and specialised hospital care and support services are centralised.",
          },
          measures: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36"],
        },
        {
          description: {
            fi: "Edellisten lisäksi aikuisten hammashoitoa rajataan, vanhustenhoivan henkilöstömitoitus puretaan, varakkaat maksavat hoivastaan enemmän, nuorten terapiatakuu poistuu, päivystyksiä vähennetään ja yksityislääkärikäyntien Kela-korvaukset loppuvat.",
            en: "On top of that, adult dental care is limited, minimum staffing in elderly care is scrapped, wealthier people pay more for their care, the youth therapy guarantee ends, emergency departments are reduced and reimbursements for private doctor visits end.",
          },
          measures: ["SOT-34", "SOT-26", "SOT-27", "SOT-35", "SOT-36", "SOT-29", "SOT-06", "SOT-18", "SOT-11", "SOT-25", "SOS-18"],
        },
      ],
    },
    {
      id: "culture",
      section: "spending",
      title: {
        fi: "Leikataanko kulttuurista, Ylestä ja järjestöistä?",
        en: "Cut culture, the public broadcaster Yle and associations?",
      },
      description: {
        fi: "Taiteen, kulttuurin, liikunnan ja järjestöjen tuet sekä Ylen rahoitus.",
        en: "Support for arts, culture, sport and associations, and funding for Yle.",
      },
      levels: [
        {
          description: {
            fi: "Ylen rahoitusta lasketaan asteittain 10 %, ja kulttuurin ja liikunnan avustuksia vähennetään.",
            en: "Yle's funding is cut gradually by 10%, and grants for culture and sport are reduced.",
          },
          measures: ["ELI-43", "KOU-70", "KOU-77"],
        },
        {
          description: {
            fi: "Ylen rahoitus laskee 20 %, teattereiden ja museoiden rahoitusta leikataan, liikuntapaikkojen tuki ja Suomi liikkeelle -ohjelma lopetetaan ja itsenäisyyden juhlarahasto Sitra lakkautetaan.",
            en: "Yle's funding falls by 20%, theatre and museum funding is cut, support for sports facilities and the Finland on the Move programme ends, and the Sitra innovation fund is closed down.",
          },
          measures: ["ELI-42", "KOU-65", "KOU-70", "KOU-76", "KOU-77", "KOU-78", "KOU-09", "VAL-29"],
        },
      ],
    },
    {
      id: "transport",
      section: "spending",
      title: { fi: "Leikataanko teiden ja ratojen rahoituksesta?", en: "Cut funding for roads and railways?" },
      description: {
        fi: "Väylien kunnossapito ja uudet liikennehankkeet.",
        en: "Maintenance of transport networks and new transport projects.",
      },
      levels: [
        {
          description: {
            fi: "Uusiin liikennehankkeisiin ei osoiteta uutta rahaa.",
            en: "No new money is allocated to new transport projects.",
          },
          measures: ["ELI-32"],
        },
        {
          description: {
            fi: "Edellisen lisäksi teiden ja ratojen kunnossapitoa vähennetään ja joukkoliikenteen sekä maakuntalentojen tukia leikataan.",
            en: "On top of that, road and rail maintenance is reduced and support for public transport and regional flights is cut.",
          },
          measures: ["ELI-32", "ELI-33", "ELI-38", "ELI-39"],
        },
      ],
    },

    // ---------- Taxes ----------
    {
      id: "vat",
      section: "tax",
      title: { fi: "Korotetaanko arvonlisäveroa?", en: "Raise VAT?" },
      description: {
        fi: "Arvonlisävero näkyy kaikkien ostosten hinnoissa. Yleinen verokanta on nyt 25,5 %, ja ruoalla, lääkkeillä ja kirjoilla on alempi kanta.",
        en: "VAT is part of the price of everything you buy. The standard rate is now 25.5%, with lower rates for food, medicines and books.",
      },
      levels: [
        {
          description: {
            fi: "Yleistä verokantaa nostetaan prosenttiyksiköllä 26,5 prosenttiin.",
            en: "The standard rate rises by one percentage point to 26.5%.",
          },
          measures: ["VER-51"],
        },
        {
          description: {
            fi: "Kaikki alennetut verokannat poistuvat: myös ruoka, lääkkeet ja joukkoliikenne ovat 25,5 %:n verolla.",
            en: "All reduced rates are removed: food, medicines and public transport are also taxed at 25.5%.",
          },
          measures: ["VER-50"],
        },
      ],
    },
    {
      id: "income-tax",
      section: "tax",
      title: { fi: "Kiristetäänkö palkkojen ja eläkkeiden verotusta?", en: "Raise taxes on wages and pensions?" },
      description: {
        fi: "Tuloveroa maksavat kaikki palkansaajat ja eläkeläiset. Verotuksen kiristäminen voi heikentää työllisyyttä.",
        en: "All wage earners and pensioners pay income tax. Higher taxes on work may weaken employment.",
      },
      levels: [
        {
          description: {
            fi: "Veroasteikkoa ei korjata inflaation mukaan, jolloin verotus kiristyy vähän kaikilla.",
            en: "Tax brackets are not adjusted for inflation, so everyone's taxes rise a little.",
          },
          measures: ["VER-15"],
        },
        {
          description: {
            fi: "Edellisen lisäksi valtion tuloveroa korotetaan kaikissa tuloluokissa prosenttiyksiköllä, ja eläketulojen verotus kiristyy.",
            en: "On top of that, state income tax rises by one percentage point in every bracket, and pension income is taxed more.",
          },
          measures: ["VER-15", "VER-20", "VER-16"],
        },
      ],
    },
    {
      id: "capital-tax",
      section: "tax",
      title: {
        fi: "Kiristetäänkö yritysten, pääomien ja varallisuuden verotusta?",
        en: "Raise taxes on companies, capital and wealth?",
      },
      description: {
        fi: "Osinkojen, yritysten, perintöjen ja kiinteistöjen verotus.",
        en: "Taxes on dividends, companies, inheritances and property.",
      },
      levels: [
        {
          description: {
            fi: "Listaamattomien yhtiöiden osinkojen veroetu pienenee, ja yrittäjävähennys sekä sukupolvenvaihdosten verohelpotukset poistuvat.",
            en: "The tax advantage on dividends from unlisted companies shrinks, and the entrepreneur deduction and tax relief for business successions are removed.",
          },
          measures: ["VER-27", "VER-26", "VER-44"],
        },
        {
          description: {
            fi: "Edellisten lisäksi yhteisövero, pääomatulovero ja perintövero nousevat prosenttiyksiköllä, ja tonttien kiinteistövero nousee uusien verotusarvojen myötä.",
            en: "On top of that, corporate tax, capital income tax and inheritance tax rise by one percentage point, and property tax on land rises with new taxable values.",
          },
          measures: ["VER-27", "VER-26", "VER-44", "VER-30", "VER-23", "VER-24", "VER-45", "VER-82"],
        },
      ],
    },
    {
      id: "energy-tax",
      section: "tax",
      title: { fi: "Kiristetäänkö liikenteen ja energian verotusta?", en: "Raise taxes on transport and energy?" },
      description: {
        fi: "Polttoaineiden, autojen, lentämisen ja lämmityksen verot.",
        en: "Taxes on fuel, cars, flying and heating.",
      },
      levels: [
        {
          description: {
            fi: "Dieselin verotukea pienennetään, otetaan käyttöön lento- ja laivalippuvero, ja valmisteverot nousevat jatkossa hintojen mukana.",
            en: "The tax subsidy for diesel is reduced, an air and ferry ticket tax is introduced, and excise taxes rise with prices from now on.",
          },
          measures: ["VER-58", "VER-70", "VER-55"],
        },
        {
          description: {
            fi: "Edellisten lisäksi ajoneuvovero nousee 100 euroa vuodessa, polttoaineiden vero nousee noin 3 senttiä litralta, ja lämpölaitosten puunpolton sekä lämpöpumppujen verotuet poistuvat.",
            en: "On top of that, vehicle tax rises by €100 a year, fuel tax by about 3 cents per litre, and tax subsidies for burning wood in heating plants and for heat pumps are removed.",
          },
          measures: ["VER-58", "VER-70", "VER-55", "VER-62", "VER-74*3", "VER-67", "VER-69"],
        },
      ],
    },
  ],
};
