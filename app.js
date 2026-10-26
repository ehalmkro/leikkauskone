// Leikkauskone – sovelluslogiikka.
// Data tulee tiedostosta data.js (window.LEIKKAUSDATA) ja asetukset tiedostosta asetukset.js (window.ASETUKSET).
// Kaikki summat ovat miljoonia euroja vuodessa.

(function () {
  "use strict";

  const D = window.LEIKKAUSDATA;
  const A = window.ASETUKSET;
  const H = window.HELPPO;
  const T = D.toimenpiteet;
  const VUODET = D.vuodet;

  // Helpon tilan tasot: "VER-74*3" -> { id: "VER-74", m: 3 }
  for (const k of H.kysymykset) {
    for (const t of k.tasot) {
      t.lista = t.toimet.map((s) => {
        const [id, m] = s.split("*");
        if (!T[id]) console.warn(`helppo.js: tuntematon toimenpide ${id} (${k.id})`);
        return { id, m: Number(m) || 1 };
      });
    }
    k.kaikki = [...new Set(k.tasot.flatMap((t) => t.lista.map((x) => x.id)))].filter((id) => T[id]);
  }

  // Tila: valinnat = Map(id -> määrä). Tavallisella toimella määrä on 1, yksikkötuotoilla askelten määrä.
  const tila = {
    nakyma: "helppo", // "helppo" tai "tarkka"
    vuosi: A.oletusvuosi,
    rahastot: false,
    valinnat: new Map(),
    auki: new Set(), // avatut alaryhmät
    haku: "",
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- Luvut ja muotoilu ----------

  const nfMrd = new Intl.NumberFormat("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nfMilj = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });
  const nfPieni = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 });

  function euroa(milj) {
    const a = Math.abs(milj);
    const etumerkki = milj < 0 ? "−" : "";
    if (a >= 1000) return etumerkki + nfMrd.format(a / 1000) + " mrd €";
    if (a === 0) return "0 €";
    if (a < 10) return etumerkki + nfPieni.format(a) + " milj. €";
    return etumerkki + nfMilj.format(a) + " milj. €";
  }

  const vuosiIndeksi = () => VUODET.indexOf(tila.vuosi);

  // Yhden toimen (tai yhden askeleen) vaikutus valittuna vuonna; null = ei euroarviota.
  function arvo(t, i = vuosiIndeksi(), rahastot = tila.rahastot) {
    const v = t.valtio[i];
    const s = rahastot ? t.sotu[i] : null;
    if (v == null && s == null) return null;
    return (v || 0) + (s || 0);
  }

  const onArvioitu = (t) => t.valtio.some((x) => x != null) || t.sotu.some((x) => x != null);

  function vaikutus(id) {
    const a = arvo(T[id]);
    return a == null ? 0 : a * (tila.valinnat.get(id) || 0);
  }

  function kokonaissumma() {
    let s = 0;
    for (const id of tila.valinnat.keys()) s += vaikutus(id);
    return s;
  }

  // Säästääkö toimi jotain valitulla laskentatavalla jonain vuonna (käytetään ryhmävalinnassa).
  function saastaa(t) {
    return VUODET.reduce((s, _, i) => s + (arvo(t, i) || 0), 0) > 0;
  }

  // ---------- Valinnat ----------

  function ristiriitaiset(id) {
    return T[id].ristiriidat.filter((r) => tila.valinnat.has(r));
  }

  // Valitsee toimen ja poistaa sen kanssa ristiriitaiset valinnat. Palauttaa poistetut.
  function valitse(id, maara = 1) {
    const poistetut = ristiriitaiset(id);
    poistetut.forEach((r) => tila.valinnat.delete(r));
    if (maara > 0) tila.valinnat.set(id, maara);
    else tila.valinnat.delete(id);
    return poistetut;
  }

  // Ryhmän "paketti": säästävät toimet suurimmasta pienimpään, ohittaen ristiriidassa olevat.
  // Vaihtoehdoista tulee siis valituksi se, joka säästää eniten.
  function paketti(ryhma, valitut = tila.valinnat) {
    const lisattavat = [];
    const kaikki = new Set(valitut.keys());
    const jarjestys = [...ryhma.toimenpiteet].sort((a, b) => (arvo(T[b]) || 0) - (arvo(T[a]) || 0));
    for (const id of jarjestys) {
      const t = T[id];
      if (kaikki.has(id) || !saastaa(t)) continue;
      if (t.ristiriidat.some((r) => kaikki.has(r))) continue;
      lisattavat.push(id);
      kaikki.add(id);
    }
    return lisattavat;
  }

  // Ryhmän suurin mahdollinen säästö tyhjästä aloittaen (paketin summa).
  function potentiaali(ryhma) {
    return paketti(ryhma, new Map()).reduce((s, id) => s + (arvo(T[id]) || 0), 0);
  }

  // ---------- Helpon tilan tasot ----------

  const tasonSumma = (taso) => taso.lista.reduce((s, x) => s + (T[x.id] ? (arvo(T[x.id]) || 0) * x.m : 0), 0);

  // 0 = ei muutosta, 1.. = taso, -1 = valintoja muokattu tarkassa tilassa
  function nykyinenTaso(k) {
    const valitut = k.kaikki.filter((id) => tila.valinnat.has(id));
    if (!valitut.length) return 0;
    const n = k.tasot.findIndex(
      (t) => t.lista.length === valitut.length && t.lista.every((x) => tila.valinnat.get(x.id) === x.m)
    );
    return n + 1 || -1;
  }

  function asetaTaso(k, n) {
    k.kaikki.forEach((id) => tila.valinnat.delete(id));
    if (n === 0) return;
    const poistetut = k.tasot[n - 1].lista.filter((x) => T[x.id]).flatMap((x) => valitse(x.id, x.m));
    ilmoitaPoistetut(poistetut);
  }

  // ---------- Osoiterivi (valinnat jaettavassa linkissä) ----------

  function tallennaOsoitteeseen() {
    const osat = [];
    if (tila.nakyma === "tarkka") osat.push("m=t");
    if (tila.vuosi !== A.oletusvuosi) osat.push(`v=${tila.vuosi}`);
    if (tila.rahastot) osat.push("r=1");
    if (tila.valinnat.size) {
      const s = [...tila.valinnat].map(([id, m]) => (m > 1 ? `${id}*${m}` : id)).join(",");
      osat.push(`s=${s}`);
    }
    history.replaceState(null, "", osat.length ? "#" + osat.join("&") : location.pathname + location.search);
  }

  function lueOsoitteesta() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.get("m") === "t") tila.nakyma = "tarkka";
    const v = Number(p.get("v"));
    if (VUODET.includes(v)) tila.vuosi = v;
    tila.rahastot = p.get("r") === "1";
    for (const osa of (p.get("s") || "").split(",").filter(Boolean)) {
      const [id, m] = osa.split("*");
      if (T[id]) tila.valinnat.set(id, Math.max(1, Math.min(Number(m) || 1, T[id].yksikko?.max || 1)));
    }
  }

  // ---------- Ilmoitus ----------

  let ilmoitusAjastin;
  function ilmoita(teksti) {
    const el = $("#ilmoitus");
    el.textContent = teksti;
    el.classList.add("nakyvissa");
    clearTimeout(ilmoitusAjastin);
    ilmoitusAjastin = setTimeout(() => el.classList.remove("nakyvissa"), 5000);
  }

  function ilmoitaPoistetut(poistetut) {
    if (!poistetut.length) return;
    const nimet = poistetut.map((id) => `”${lyhyt(T[id].nimi, 70)}”`).join(", ");
    ilmoita(`Poistettiin vaihtoehtoinen tai päällekkäinen valinta: ${nimet}`);
  }

  const lyhyt = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

  // ---------- Piirtäminen (kerran) ----------

  function piirraRakenne() {
    // Vuosivalitsin
    $("#vuosi").innerHTML = VUODET.map((v) => `<option value="${v}">${v}</option>`).join("");

    // Pikalinkit pääluokkiin
    const hyppy = D.paaluokat
      .map(
        (pl, i) =>
          `<a href="#pl-${pl.id}" data-hyppy><span class="vari" style="background:var(--sarja-${i + 1})"></span>${esc(pl.nimi)}</a>`
      )
      .join("");

    const kuvaukset = A.paaluokkaKuvaukset || {};
    $("#paaluokat").innerHTML =
      `<nav class="hyppy" aria-label="Pääluokat">${hyppy}</nav>` +
      D.paaluokat
        .map(
          (pl, i) => `
      <section class="paaluokka" id="pl-${pl.id}" data-pl="${pl.id}">
        <div class="paaluokka-otsikko">
          <h2><span class="vari" style="background:var(--sarja-${i + 1})"></span>${esc(pl.nimi)}</h2>
          <span class="paaluokka-summa" data-plsumma></span>
        </div>
        ${kuvaukset[pl.id] ? `<p class="paaluokka-kuvaus">${esc(kuvaukset[pl.id])}</p>` : ""}
        ${pl.alaryhmat.map(piirraRyhma).join("")}
      </section>`
        )
        .join("") +
      `<p class="ei-osumia" id="ei-osumia" hidden>Ei osumia haulle.</p>`;

    // Lähteet
    $("#lahteet").innerHTML = A.lahteet
      .map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nimi)}</a></li>`)
      .join("");
    $("#lahde-teksti").textContent =
      `Toimenpiteet ja euroarviot: ${D.lahde.nimi}, ${D.lahde.paivays}` +
      (D.lahde.verot ? " sekä VM:n verokartoituksen liite 1." : ".") +
      " Ryhmittely ja vaihtoehtojen yhteensopivuus on tämän sivun tekijän tulkinta.";
  }

  function piirraRyhma(ar) {
    return `
      <div class="ryhma" data-ryhma="${ar.id}">
        <div class="ryhma-otsikko">
          <button type="button" class="ryhma-avaa" aria-expanded="false" aria-controls="lista-${ar.id}">
            <span class="nuoli" aria-hidden="true"></span>
            <span>
              <span class="ryhma-nimi">${esc(ar.nimi)}</span><br>
              <span class="ryhma-tila" data-ryhmatila></span>
            </span>
          </button>
          <div class="ryhma-luvut" data-ryhmaluvut></div>
          <div class="ryhma-napit">
            <button type="button" class="nappi pieni" data-paketti="${ar.id}">Valitse ryhmä</button>
          </div>
        </div>
        <ul class="tp-lista" id="lista-${ar.id}" hidden>
          ${ar.toimenpiteet.map((id) => piirraToimenpide(T[id])).join("")}
        </ul>
      </div>`;
  }

  function piirraToimenpide(t) {
    const merkit = [];
    if (t.vaihtoehto) merkit.push(`<span class="merkki">Vaihtoehto</span>`);
    if (!onArvioitu(t)) merkit.push(`<span class="merkki">Ei euroarviota</span>`);
    if (t.tyyppi === "vero" && t.alkaen > VUODET[0]) merkit.push(`<span class="merkki">Alkaen ${t.alkaen}</span>`);
    const sotuSaasto = t.sotu.some((x) => x > 0);
    if (sotuSaasto) merkit.push(`<span class="merkki huom" data-rahastomerkki>Säästöä myös sosiaaliturvarahastoihin</span>`);

    const valinta = t.yksikko
      ? `<div class="tp-valinta">
           <span class="tp-nimi">${esc(t.nimi)}</span>
         </div>
         <div class="askellin" role="group" aria-label="Korotuksen määrä">
           <button type="button" data-askel="-1" data-id="${t.id}" aria-label="Vähennä">−</button>
           <output data-maara></output>
           <button type="button" data-askel="1" data-id="${t.id}" aria-label="Lisää">+</button>
         </div>`
      : `<label class="tp-valinta">
           <input type="checkbox" data-valitse="${t.id}">
           <span class="tp-nimi">${esc(t.nimi)}</span>
         </label>`;

    return `
      <li class="tp${t.yksikko ? " tp-yksikko" : ""}" data-id="${t.id}">
        <div class="tp-rivi">
          ${valinta}
          <span class="tp-summa" data-summa></span>
        </div>
        <div class="tp-meta">
          ${t.kohde && t.tyyppi === "meno" ? `<span>${esc(t.kohde)}</span>` : ""}
          ${merkit.join("")}
        </div>
        <p class="tp-ristiriita" data-ristiriita hidden></p>
        <details class="tp-lisaa" data-lisaa="${t.id}">
          <summary>Lisätietoja</summary>
          <div class="tp-lisaa-sisalto"></div>
        </details>
      </li>`;
  }

  // ---------- Helppo tila ----------

  const TASONIMET = ["Ei muutosta"];

  function piirraHelppo() {
    const kortti = (k) => `
      <article class="kortti" data-kysymys="${k.id}">
        <h3>${esc(k.otsikko)}</h3>
        <p class="kortti-kuvaus">${esc(k.kuvaus)}</p>
        <div class="tasot" role="radiogroup" aria-label="${esc(k.otsikko)}">
          ${[TASONIMET[0], ...k.tasot.map((t) => t.nimi)]
            .map(
              (nimi, n) => `
            <button type="button" class="taso" role="radio" aria-checked="false" data-kysymys="${k.id}" data-taso="${n}">
              <span class="taso-nimi">${esc(nimi)}</span>
              <span class="taso-summa" data-tasosumma></span>
            </button>`
            )
            .join("")}
        </div>
        <p class="taso-kuvaus" data-tasokuvaus></p>
        <details class="kortti-lisaa" data-korttilisaa="${k.id}">
          <summary>Mitä VM:n toimenpiteitä tähän kuuluu?</summary>
          <div class="kortti-lisaa-sisalto"></div>
        </details>
      </article>`;

    $("#helppo").innerHTML =
      H.osiot
        .map(
          (o) => `
        <section class="osio">
          <h2>${esc(o.otsikko)}</h2>
          <div class="kortit">${H.kysymykset.filter((k) => k.osio === o.id).map(kortti).join("")}</div>
        </section>`
        )
        .join("") +
      `<section class="loppu">
        <h2>Sinun budjettisi</h2>
        <p data-lopputeksti></p>
        <div class="loppu-napit">
          <button type="button" class="nappi" data-jaa>Jaa valintasi</button>
          <button type="button" class="nappi toissijainen" data-tila="tarkka">Valitse tarkemmin: kaikki ${Object.keys(T).length} toimenpidettä</button>
        </div>
      </section>`;
  }

  function piirraKortinLisatiedot(k) {
    return k.tasot
      .map(
        (t) => `
        <p class="lisaa-otsikko">${esc(t.nimi)}:</p>
        <ul>${t.lista
          .filter((x) => T[x.id])
          .map((x) => {
            const a = arvo(T[x.id]);
            const yks = T[x.id].yksikko ? ` (+${x.m} × ${esc(T[x.id].yksikko.askel)})` : "";
            return `<li><span>${esc(T[x.id].nimi)}${yks}</span><span class="luku">${a == null ? "–" : euroa(a * x.m)}</span></li>`;
          })
          .join("")}</ul>`
      )
      .join("");
  }

  function paivitaHelppo() {
    for (const k of H.kysymykset) {
      const el = $(`.kortti[data-kysymys="${k.id}"]`);
      const nyt = nykyinenTaso(k);
      el.classList.toggle("valittu", nyt !== 0);
      $$(".taso", el).forEach((b) => {
        const n = Number(b.dataset.taso);
        b.setAttribute("aria-checked", String(n === nyt));
        $("[data-tasosumma]", b).textContent = n === 0 ? "" : euroa(tasonSumma(k.tasot[n - 1]));
      });
      $("[data-tasokuvaus]", el).textContent =
        nyt > 0 ? k.tasot[nyt - 1].kuvaus : nyt === -1 ? "Valintoja on muokattu tarkassa tilassa." : "";
      const lisaa = $("details", el);
      if (lisaa.open) $(".kortti-lisaa-sisalto", lisaa).innerHTML = piirraKortinLisatiedot(k);
    }

    // Loppuyhteenveto
    let menot = 0;
    let verot = 0;
    for (const id of tila.valinnat.keys()) {
      if (T[id].tyyppi === "vero") verot += vaikutus(id);
      else menot += vaikutus(id);
    }
    const summa = menot + verot;
    const vp = A.virstanpylvaat;
    const saavutetut = vp.filter((v) => summa >= v.arvo);
    let teksti;
    if (!tila.valinnat.size) {
      teksti = "Et ole vielä valinnut mitään. Vastaa ylläoleviin kysymyksiin.";
    } else {
      teksti = `Leikkauksia ${euroa(menot)} ja veronkorotuksia ${euroa(verot)}, yhteensä ${euroa(summa)} vuodessa. `;
      if (!saavutetut.length) teksti += `Se ei vielä riitä edes ensimmäiseen tavoitteeseen (${euroa(vp[0].arvo)}).`;
      else if (saavutetut.length === vp.length) teksti += "Valintasi riittäisivät laskennallisesti jopa valtion budjetin tasapainottamiseen.";
      else teksti += `Saavutit tavoitteen: ${saavutetut[saavutetut.length - 1].nimi.toLowerCase()}.`;
      teksti += " Olisitko valmis puolustamaan näitä valintoja vaalikentillä?";
    }
    $("[data-lopputeksti]").textContent = teksti;
  }

  function vaihdaNakyma(n) {
    tila.nakyma = n;
    document.body.classList.toggle("tila-helppo", n === "helppo");
    document.body.classList.toggle("tila-tarkka", n === "tarkka");
    $$(".tilanvaihto [data-tila]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tila === n)));
  }

  async function jaa() {
    const summa = euroa(kokonaissumma());
    const teksti = `Minä löysin valtion budjettiin ${summa}. Mistä sinä ottaisit?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Leikkauskone", text: teksti, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(`${teksti} ${location.href}`);
      ilmoita("Linkki valintoihisi kopioitiin leikepöydälle – liitä se viestiin.");
    } catch (e) {
      if (e?.name !== "AbortError") ilmoita("Kopiointi ei onnistunut – kopioi osoite selaimen osoiteriviltä.");
    }
  }

  // Lisätiedot piirretään vasta, kun ne avataan.
  function piirraLisatiedot(t) {
    const fmt = (x) => (x == null ? "–" : nfPieni.format(x));
    const nyt = vuosiIndeksi();
    let html = "";
    if (t.tyyppi === "vero") {
      html += `<p><strong>VM:n tuottoarvio (2028):</strong> ${esc(t.vm_arvio || "–")} milj. €<br>
               <strong>Koneessa käytetty luku:</strong> ${t.valtio.find((x) => x != null) != null ? fmt(Math.max(...t.valtio.map((x) => x || 0))) + " milj. €" : "ei arviota"}${t.yksikko ? ` (per ${esc(t.yksikko.askel)})` : ""} – ${esc(t.peruste)}.<br>
               Tuoton oletetaan pysyvän samana kaikkina vuosina${t.alkaen > VUODET[0] ? ` (toteutettavissa vuodesta ${t.alkaen})` : ""}.</p>`;
    } else {
      html += `<div class="taulu-vieritys"><table class="vuositaulu">
        <thead><tr><th>milj. €</th>${VUODET.map((v, i) => `<th class="${i === nyt ? "nyt" : ""}">${v}</th>`).join("")}</tr></thead>
        <tbody>
          <tr><td>Valtio ja paikallishallinto</td>${t.valtio.map((x, i) => `<td class="${i === nyt ? "nyt" : ""}">${fmt(x)}</td>`).join("")}</tr>
          <tr><td>Sosiaaliturvarahastot</td>${t.sotu.map((x, i) => `<td class="${i === nyt ? "nyt" : ""}">${fmt(x)}</td>`).join("")}</tr>
        </tbody></table></div>`;
    }
    if (t.tausta) html += `<p>${esc(t.tausta)}</p>`;
    if (t.muistio) html += `<p><strong>VM:n taustamuistio:</strong> ${esc(t.muistio)}</p>`;
    if (t.ristiriidat.length) {
      html += `<p><strong>Ei voi valita yhdessä:</strong> ${t.ristiriidat.map((r) => esc(lyhyt(T[r].nimi, 80))).join("; ")}</p>`;
    }
    return html;
  }

  // ---------- Päivitys (aina tilan muuttuessa) ----------

  function paivita() {
    const i = vuosiIndeksi();
    $("#vuosi").value = String(tila.vuosi);
    $("#rahastot").checked = tila.rahastot;
    $("#vuosi-teksti").textContent = tila.vuosi;

    // Toimenpiderivit
    for (const li of $$(".tp")) {
      const id = li.dataset.id;
      const t = T[id];
      const m = tila.valinnat.get(id) || 0;
      li.classList.toggle("valittu", m > 0);

      const cb = $("input[data-valitse]", li);
      if (cb) cb.checked = m > 0;
      if (t.yksikko) {
        $("[data-maara]", li).textContent = m ? `+${m} × ${t.yksikko.askel}` : "ei korotusta";
        $('[data-askel="-1"]', li).disabled = m === 0;
        $('[data-askel="1"]', li).disabled = m >= t.yksikko.max;
      }

      const a = arvo(t, i);
      const summaEl = $("[data-summa]", li);
      summaEl.classList.toggle("tyhja", a == null);
      summaEl.classList.toggle("negatiivinen", a != null && a < 0);
      if (a == null) summaEl.textContent = "ei arviota";
      else if (t.yksikko) summaEl.textContent = (m > 1 ? euroa(a * m) : euroa(a)) + (m > 1 ? "" : ` / ${t.yksikko.askel}`);
      else summaEl.textContent = euroa(a);
      summaEl.title = a != null && a < 0 ? "Toimi heikentää tätä taloutta valittuna vuonna (lisää menoja tai vähentää tuloja)." : "";

      const rm = $("[data-rahastomerkki]", li);
      if (rm) rm.hidden = tila.rahastot;

      const ristiriita = m ? [] : ristiriitaiset(id);
      li.classList.toggle("estetty", ristiriita.length > 0);
      const rEl = $("[data-ristiriita]", li);
      rEl.hidden = !ristiriita.length;
      if (ristiriita.length) {
        rEl.textContent = `Vaihtoehtoinen tai päällekkäinen valitun kanssa: ${ristiriita
          .map((r) => lyhyt(T[r].nimi, 60))
          .join("; ")}. Tämän valitseminen poistaa sen.`;
      }

      const lisaa = $("details[data-lisaa]", li);
      if (lisaa.open) $(".tp-lisaa-sisalto", lisaa).innerHTML = piirraLisatiedot(t);
    }

    // Alaryhmät ja pääluokat
    const plSummat = {};
    D.paaluokat.forEach((pl) => {
      let plSumma = 0;
      let plPotentiaali = 0;
      for (const ar of pl.alaryhmat) {
        const el = $(`[data-ryhma="${ar.id}"]`);
        const valitut = ar.toimenpiteet.filter((id) => tila.valinnat.has(id));
        const summa = valitut.reduce((s, id) => s + vaikutus(id), 0);
        const pot = potentiaali(ar);
        plSumma += summa;
        plPotentiaali += pot;
        el.classList.toggle("on-valintoja", valitut.length > 0);
        $("[data-ryhmatila]", el).textContent =
          `${ar.toimenpiteet.length} toimenpidettä` + (valitut.length ? ` · ${valitut.length} valittu` : "");
        $("[data-ryhmaluvut]", el).innerHTML = valitut.length
          ? `<strong>${euroa(summa)}</strong>valittu`
          : `<strong>${euroa(pot)}</strong>enintään`;

        const nappi = $("[data-paketti]", el);
        const lisattavat = paketti(ar);
        const voiTyhjentaa = valitut.length > 0;
        nappi.textContent = lisattavat.length ? (valitut.length ? "Valitse loput" : "Valitse ryhmä") : "Poista valinnat";
        nappi.classList.toggle("toissijainen", !lisattavat.length);
        nappi.disabled = !lisattavat.length && !voiTyhjentaa;
        nappi.dataset.toiminto = lisattavat.length ? "lisaa" : "poista";
      }
      plSummat[pl.id] = plSumma;
      $(`[data-pl="${pl.id}"] [data-plsumma]`).innerHTML = plSumma
        ? `valittu <strong>${euroa(plSumma)}</strong> · enintään ${euroa(plPotentiaali)}`
        : `enintään ${euroa(plPotentiaali)}`;
    });

    paivitaMittari(plSummat);
    paivitaYhteenveto(plSummat);
    paivitaHelppo();
    suodata();
    tallennaOsoitteeseen();
  }

  function paivitaMittari(plSummat) {
    const summa = kokonaissumma();
    $("#kokonaissumma").textContent = euroa(summa);

    const maksimi = Math.max(A.asteikonMaksimi, summa * 1.05);
    const pros = (x) => `${Math.max(0, (x / maksimi) * 100)}%`;

    // Palkki: segmentti per pääluokka, kiinteä värijärjestys
    $("#palkki").innerHTML = D.paaluokat
      .map((pl, i) =>
        plSummat[pl.id] > 0
          ? `<div class="palkki-osa" style="width:${pros(plSummat[pl.id])};background:var(--sarja-${i + 1})" title="${esc(pl.nimi)}: ${euroa(plSummat[pl.id])}"></div>`
          : ""
      )
      .join("");
    $("#palkki").setAttribute("aria-label", `Valitut säästöt ${euroa(summa)} asteikolla 0–${euroa(maksimi)}`);

    const vp = A.virstanpylvaat;
    $("#virstat").innerHTML = vp
      .map((v, n) => {
        const vasen = (v.arvo / maksimi) * 100;
        const luokat = ["virsta", summa >= v.arvo ? "saavutettu" : "", vasen > 85 ? "oikealle" : "", n % 2 ? "ylempi" : ""].join(" ");
        return `<div class="${luokat}" style="left:${vasen}%"><span>${esc(v.lyhyt)}</span></div>`;
      })
      .join("");

    $("#virstalista").innerHTML = vp
      .map((v) => {
        const ok = summa >= v.arvo;
        return `<li class="${ok ? "saavutettu" : ""}" title="${esc(v.kuvaus)}">
          <span class="ikoni" aria-hidden="true">${ok ? "✓" : ""}</span>
          <span>${esc(v.nimi)}: ${euroa(v.arvo)}${ok ? " – saavutettu" : ""}</span></li>`;
      })
      .join("");

    const seuraava = vp.find((v) => summa < v.arvo);
    const edellinen = [...vp].reverse().find((v) => summa >= v.arvo);
    let teksti;
    if (!seuraava) {
      teksti = `<strong>Kaikki tavoitteet saavutettu.</strong> Valintasi kattaisivat laskennallisesti jopa valtion vuoden 2027 budjetin alijäämän.`;
    } else if (edellinen) {
      teksti = `✓ <strong>${esc(edellinen.nimi)}</strong> saavutettu. Seuraava tavoite: ${esc(seuraava.nimi)} – puuttuu vielä <strong>${euroa(seuraava.arvo - summa)}</strong>.`;
    } else {
      teksti = `Seuraava tavoite: ${esc(seuraava.nimi)} – puuttuu vielä <strong>${euroa(seuraava.arvo - summa)}</strong>.`;
    }
    if (tila.vuosi !== A.oletusvuosi) {
      teksti += ` <span class="vuosihuomio">Huom: sopeutustavoite koskee vuotta ${A.oletusvuosi}.</span>`;
    }
    $("#seuraava").innerHTML = teksti;
  }

  function paivitaYhteenveto(plSummat) {
    const n = tila.valinnat.size;
    $("#valintojen-maara").textContent = n
      ? `${n} toimenpidettä, yhteensä ${euroa(kokonaissumma())} vuonna ${tila.vuosi}.`
      : "Et ole vielä valinnut mitään. Aloita valitsemalla kokonainen ryhmä tai yksittäisiä toimenpiteitä.";

    $("#jakauma tbody").innerHTML = D.paaluokat
      .map((pl, i) =>
        plSummat[pl.id]
          ? `<tr><td><span class="vari" style="background:var(--sarja-${i + 1})"></span>${esc(pl.nimi)}</td><td>${euroa(plSummat[pl.id])}</td></tr>`
          : ""
      )
      .join("");

    const valitut = [...tila.valinnat.keys()].sort((a, b) => vaikutus(b) - vaikutus(a));
    $("#valitut").innerHTML = valitut.length
      ? `<li class="valitut-otsikko">Suurimmasta pienimpään</li>` +
        valitut
          .map((id) => {
            const t = T[id];
            const m = tila.valinnat.get(id);
            const nimi = lyhyt(t.nimi, 90) + (t.yksikko && m ? ` (+${m} × ${t.yksikko.askel})` : "");
            return `<li><span class="nimi">${esc(nimi)}</span><span class="summa">${euroa(vaikutus(id))}</span>
              <button type="button" data-poista="${id}" aria-label="Poista ${esc(t.nimi)}" title="Poista">×</button></li>`;
          })
          .join("")
      : "";
    $("#kopioi").hidden = !n;
  }

  // ---------- Haku ja avaaminen ----------

  function asetaAuki(ryhmaEl, auki) {
    $(".ryhma-avaa", ryhmaEl).setAttribute("aria-expanded", String(auki));
    $(".tp-lista", ryhmaEl).hidden = !auki;
  }

  function suodata() {
    const q = tila.haku.trim().toLowerCase();
    let osumia = 0;
    for (const pl of $$(".paaluokka")) {
      let plOsumia = 0;
      for (const r of $$(".ryhma", pl)) {
        let rOsumia = 0;
        const ryhmanNimi = $(".ryhma-nimi", r).textContent;
        for (const li of $$(".tp", r)) {
          const t = T[li.dataset.id];
          const nakyy = !q || (t.nimi + " " + t.kohde + " " + ryhmanNimi).toLowerCase().includes(q);
          li.hidden = !nakyy;
          if (nakyy) rOsumia++;
        }
        r.hidden = q && !rOsumia;
        asetaAuki(r, q ? rOsumia > 0 : tila.auki.has(r.dataset.ryhma));
        plOsumia += rOsumia;
      }
      pl.hidden = q && !plOsumia;
      osumia += plOsumia;
    }
    $("#ei-osumia").hidden = !q || osumia > 0;
    $(".hyppy").hidden = !!q;
  }

  // ---------- Tapahtumat ----------

  function kytke() {
    $("#vuosi").addEventListener("change", (e) => {
      tila.vuosi = Number(e.target.value);
      paivita();
    });
    $("#rahastot").addEventListener("change", (e) => {
      tila.rahastot = e.target.checked;
      paivita();
    });
    $("#tyhjenna").addEventListener("click", () => {
      if (!tila.valinnat.size) return;
      tila.valinnat.clear();
      paivita();
      ilmoita("Kaikki valinnat poistettu.");
    });

    let hakuAjastin;
    $("#haku").addEventListener("input", (e) => {
      clearTimeout(hakuAjastin);
      hakuAjastin = setTimeout(() => {
        tila.haku = e.target.value;
        suodata();
      }, 120);
    });

    document.addEventListener("change", (e) => {
      const id = e.target.dataset?.valitse;
      if (!id) return;
      if (e.target.checked) ilmoitaPoistetut(valitse(id));
      else tila.valinnat.delete(id);
      paivita();
    });

    document.addEventListener("click", (e) => {
      const taso = e.target.closest("[data-taso]");
      if (taso) {
        const k = H.kysymykset.find((x) => x.id === taso.dataset.kysymys);
        asetaTaso(k, Number(taso.dataset.taso));
        paivita();
        return;
      }

      const nakyma = e.target.closest("[data-tila]");
      if (nakyma) {
        const ylhaalta = !nakyma.closest(".tilanvaihto");
        vaihdaNakyma(nakyma.dataset.tila);
        paivita();
        if (ylhaalta) window.scrollTo({ top: 0 });
        return;
      }

      if (e.target.closest("[data-jaa]")) {
        jaa();
        return;
      }

      const askel = e.target.closest("[data-askel]");
      if (askel) {
        const id = askel.dataset.id;
        const uusi = Math.max(0, Math.min((tila.valinnat.get(id) || 0) + Number(askel.dataset.askel), T[id].yksikko.max));
        ilmoitaPoistetut(valitse(id, uusi));
        paivita();
        return;
      }

      const avaa = e.target.closest(".ryhma-avaa");
      if (avaa) {
        const r = avaa.closest(".ryhma");
        const auki = avaa.getAttribute("aria-expanded") !== "true";
        if (auki) tila.auki.add(r.dataset.ryhma);
        else tila.auki.delete(r.dataset.ryhma);
        asetaAuki(r, auki);
        return;
      }

      const pk = e.target.closest("[data-paketti]");
      if (pk) {
        const ar = D.paaluokat.flatMap((p) => p.alaryhmat).find((a) => a.id === pk.dataset.paketti);
        if (pk.dataset.toiminto === "poista") {
          ar.toimenpiteet.forEach((id) => tila.valinnat.delete(id));
        } else {
          const lisattavat = paketti(ar);
          lisattavat.forEach((id) => tila.valinnat.set(id, 1));
          const ohitetut = ar.toimenpiteet.filter((id) => !tila.valinnat.has(id) && onArvioitu(T[id]) && saastaa(T[id]));
          if (ohitetut.length) {
            ilmoita(`Valittiin ${lisattavat.length} toimenpidettä. ${ohitetut.length} jätettiin pois, koska ne ovat vaihtoehtoisia tai päällekkäisiä valittujen kanssa – avaa ryhmä ja vaihda halutessasi.`);
          }
        }
        paivita();
        return;
      }

      const poista = e.target.closest("[data-poista]");
      if (poista) {
        tila.valinnat.delete(poista.dataset.poista);
        paivita();
      }
    });

    // Lisätiedot täytetään avattaessa
    document.addEventListener(
      "toggle",
      (e) => {
        const d = e.target;
        if (d.matches?.("details[data-lisaa]") && d.open) {
          $(".tp-lisaa-sisalto", d).innerHTML = piirraLisatiedot(T[d.dataset.lisaa]);
        }
        if (d.matches?.("details[data-korttilisaa]") && d.open) {
          const k = H.kysymykset.find((x) => x.id === d.dataset.korttilisaa);
          $(".kortti-lisaa-sisalto", d).innerHTML = piirraKortinLisatiedot(k);
        }
      },
      true
    );
  }

  // ---------- Käynnistys ----------

  lueOsoitteesta();
  piirraRakenne();
  piirraHelppo();
  vaihdaNakyma(tila.nakyma);
  kytke();
  paivita();
})();
