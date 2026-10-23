# Hablemos: handleiding voor het schrijven van lesinhoud

Dit is de opdracht voor iedereen die een niveau (level) van Hablemos schrijft. Lees het hele document voordat je begint.

## 1. Wat is Hablemos?

Een Android-app waarmee één Nederlandse politieagent Spaans leert **spreken**. Het doel is dat hij een gesprek kan voeren, niet dat hij woordenlijsten stampt.

- Beginner (nul voorkennis) tot begin B1, in 13 niveaus (ca. 130 lessen).
- **Spaans uit Spanje** (peninsular). Dus: *vosotros* in tabellen, *coche*, *ordenador*, *móvil*, *zumo*, *vale*, *piso*, *coger* (gewoon OK in Spanje), geen Latijns-Amerikaanse woorden (*carro*, *celular*, *jugo*, *computadora*, *platicar*, *plata*, *manejar*, *ahorita*, *vos*). In Spanje is *ustedes* alleen de beleefde meervoudsvorm. Gebruik het pretérito perfecto zoals in Spanje voor "vandaag/recent verleden".
- Thema's: reizen, werk, dagelijks leven, sociaal en **politiewerk**. De gebruiker wil kunnen: toeristen helpen, aangifte opnemen, een controle of aanhouding doen, noodsituaties afhandelen, en begrijpen welke vragen Spaanstaligen aan een Nederlandse politieagent kunnen stellen. De situaties spelen zich meestal **in Nederland** af (Ámsterdam, Rotterdam, La Haya, Utrecht, estación central, tranvía, bicicleta, carril bici, comisaría de policía), met Spaanse toeristen, studenten en expats.
- Alles wat hij leert hoort hem in staat te stellen iets te **zeggen**. Grammatica dient het gesprek.
- Gebruiker: typt antwoorden, hoort Spaanse zinnen voorgelezen (stem uit Spanje). Hij spreekt niet in.
- Sessies van ca. 15 tot 20 minuten. Speels, vriendelijk, bemoedigend. Een vosje (zorro) is de mascotte; jij hoeft hem niet te noemen.

## 2. Bestanden en werkwijze

Je schrijft **één niveau** in losse bestanden:

```
content-src/levelNN/meta.json          (niveau-velden, zonder "lessons")
content-src/levelNN/lesson-01.json     (één les per bestand, 10 stuks)
...
content-src/levelNN/lesson-10.json
```

Dan voer je uit (vanuit de projectmap `/home/claude/hablemos`):

```
node scripts/assemble-level.mjs NN          # voegt samen tot src/content/levels/levelNN.json en zet de id's
node scripts/validate-content.mjs src/content/levels/levelNN.json    # structuur en stijlcontrole
npx tsx scripts/check-answers.ts src/content/levels/levelNN.json     # test of de app al je antwoorden accepteert
```

Herhaal tot er **geen fouten** zijn. Lees ook de waarschuwingen en los ze op als ze terecht zijn (bv. een Latijns-Amerikaans woord, een fill zonder hint, ontbrekende vertaling). Id's hoef je niet zelf te verzinnen: de assemble-stap zet ze (laat `"id"` weg of zet er iets in; het wordt overschreven).

Schrijf de bestanden met de Write-tool, één les per keer. Gebruik geldige JSON (dubbele aanhalingstekens, geen losse komma's, geen commentaar). Binnen tekst mag je `«` en `»` gebruiken voor Nederlandse citaten om escapen te voorkomen. Een dubbele aanhalingsteken binnen een string schrijf je als `\"`.

## 3. Structuur van een niveau

`meta.json`:

```json
{
  "title": "¡Hola!",
  "subtitle": "Jezelf voorstellen en je naam spellen",
  "emoji": "👋",
  "instructionLang": "nl",
  "goals": [
    "Je kunt groeten en afscheid nemen, beleefd en informeel",
    "Je kunt jezelf voorstellen en vragen hoe iemand heet",
    "Je kunt een naam spellen en tot 20 tellen"
  ],
  "badge": { "name": "Primer contacto", "emoji": "🤝", "desc": "Je hebt niveau 1 afgerond." }
}
```

- `goals`: 4 tot 6 "Je kunt ..."-doelen in het Nederlands, concreet en gesprek-gericht.
- `badge.emoji` en `badge.name` moeten uniek zijn voor dit niveau (zie de tabel in hoofdstuk 8 voor de afgesproken namen en emoji).

**Elk niveau heeft precies 10 lessen in deze vaste volgorde:**

| # | kind | inhoud |
|---|------|--------|
| 1 | `learn` | uitleg (kaarten) + korte quiz |
| 2 | `practice` | oefenen |
| 3 | `dialogue` | gesprek (gescript) |
| 4 | `learn` | uitleg + quiz |
| 5 | `practice` | oefenen |
| 6 | `dialogue` | gesprek |
| 7 | `learn` | uitleg + quiz |
| 8 | `practice` | oefenen, mix van het hele niveau |
| 9 | `dialogue` | **politiegesprek** (`"tags": ["politie"]`) |
| 10 | `test` | niveautoets (laatste les, 80% nodig) |

Aantallen (de validator dwingt de ondergrenzen af, streef naar de **bovenkant**):

- `learn`: 6 tot 7 kaarten (max 9) en 6 tot 7 quizvragen (max 7).
- `practice`: 12 tot 14 oefeningen.
- `dialogue`: 16 tot 20 beurten in totaal, waarvan 7 tot 9 beurten van de gebruiker (`who: "you"`). Begin met een beurt van de ander (`npc`). Nooit twee gebruikersbeurten achter elkaar. Max 24 beurten.
- `test`: 18 tot 20 oefeningen, gelijkmatig over het hele niveau, alle oefenvormen die in het niveau voorkomen.

Elke les heeft `kind`, `title` (kort, max ca. 28 tekens, de titel verschijnt onder de knop in het leerpad) en `emoji`.

## 4. Oefenvormen (exacte velden)

Alle oefeningen kunnen daarnaast deze optionele velden hebben: `hint` (NL, achter de 💡-knop, hint zonder het antwoord weg te geven), `explain` (NL, wordt na het antwoord getoond; kort, 1 tot 2 zinnen, het *waarom*), `nl` (Nederlandse vertaling van de Spaanse zin in de opgave, voor de 🌐-knop), `wrong` (typische fouten, zie onder), `strictSubject` (zie onder), `tag` (grammaticalabel, bv. `"ser"`).

**choice** (meerkeuze, 2 tot 5 opties; 3 of 4 is standaard)

```json
{ "type": "choice", "prompt": "Wat zeg je als je iemand 's ochtends groet?",
  "options": ["Buenas noches", "Buenos días", "Hasta luego"], "answer": 1,
  "explain": "«Días» is mannelijk: buenos días.", "nl": "..." }
```

- Opties zijn standaard Spaans. Zijn ze Nederlands, zet dan `"optionsLang": "nl"`. Is de prompt Spaans, zet dan `"promptLang": "es"`.
- `optionsNl`: Nederlandse vertaling per optie (alleen bij Spaanse opties), zichtbaar via 🌐. **Verplicht in gesprekken.**
- `speak`: Spaanse tekst die voorgelezen kan worden (voor begrijpend luisteren/lezen): `{ "prompt": "Wat vraagt de toerist?", "speak": "¿Dónde está la estación?", ... }`. Zet in zo'n geval de Spaanse zin ook in de prompt of laat hem alleen horen; de 🔊-knop verschijnt vanzelf.
- `**vet**` in de prompt is toegestaan.

**fill** (één woord of woordgroep invullen)

```json
{ "type": "fill", "sentence": "Nosotros ___ en Ámsterdam.", "answers": ["vivimos"],
  "base": "(vivir, nosotros)", "nl": "Wij wonen in Amsterdam.", "hint": "-ir werkwoord" }
```

- Precies één `___` in `sentence`. `answers` bevat alleen het ontbrekende stuk, met alle goede varianten.
- Geef `base` (infinitief en persoon) of een `hint`, en altijd `nl`.

**build** (zin opbouwen met woordtegels)

```json
{ "type": "build", "prompt": "Zeg: «Ik heet Pedro en ik ben agent.»",
  "words": ["Me", "llamo", "Pedro", "y", "soy", "agente", "tengo", "es"],
  "answers": ["Me llamo Pedro y soy agente"] }
```

- `words`: elk item is **één woord** (leestekens blijven aan het woord vastzitten, bv. `"¿Cómo"` en `"llamas?"`). 5 tot 10 woorden, hoogstens **3 afleiders** (woorden die niet nodig zijn, liefst verleidelijke fouten). Elk woord uit elk antwoord moet in `words` staan; hoofdletters en leestekens moeten exact kloppen met je antwoord.
- Meerdere goede zinnen? Zet ze allemaal in `answers` (de eerste is de modelzin). Alle woorden van elke variant moeten in `words` staan.

**write** (zelf een zin typen)

```json
{ "type": "write", "prompt": "Zeg tegen een toerist: «Mag ik uw paspoort zien, alstublieft?»",
  "answers": ["¿Puedo ver su pasaporte, por favor?", "¿Me enseña su pasaporte, por favor?", "¿Me muestra su pasaporte, por favor?"],
  "hint": "Je spreekt beleefd (usted)." }
```

- Geef alle redelijk natuurlijke goede varianten, maar **alleen correct Spaans**. De app is mild: hoofdletters, leestekens (¿ ¡ . ,) en accenten tellen niet mee, en een beginnend onderwerpswoord (*yo, tú, él, ella, usted, nosotros/as, vosotros/as, ellos/as, ustedes*) mag je weglaten of toevoegen. Bij *tú*/*usted* kun je dat dus **niet** gebruiken om te toetsen; vraag het via de context ("Je spreekt een oudere dame aan: ...").
- Zet `"strictSubject": true` als het onderwerpswoord er bewust moet staan (zeldzaam, bv. bij de les over pronombres).

**listen** (luisteroefening; de zin wordt voorgelezen, nooit in de tekst getoond)

```json
{ "type": "listen", "mode": "choose", "es": "Me llamo Carmen.",
  "options": ["Me llamo Carmen.", "Se llama Carmen.", "Te llamas Carmen."], "answer": 0, "nl": "Ik heet Carmen." }
{ "type": "listen", "mode": "type", "es": "Tengo veinte años.", "answers": ["Tengo veinte años"], "nl": "Ik ben twintig jaar." }
```

- `choose`: opties zijn Spaans (wat je hoort), maak ze vergelijkbaar klinkend. `type`: de gebruiker typt wat hij hoort; `answers` mag weggelaten worden (dan geldt `es`).
- Niet toegestaan in gesprekken. Gebruik ze ook niet voor lange zinnen in de eerste twee niveaus (max ca. 6 woorden).

**wrong** (foutpatronen bij getypte antwoorden)

```json
"wrong": [
  { "match": "soy 30 años", "feedback": "Leeftijd zeg je met **tener**: «tengo 30 años», niet met ser." },
  { "match": "me llama", "feedback": "«Me llamo»: bij *yo* eindigt het werkwoord op -o." }
]
```

`match` wordt (zonder hoofdletters/leestekens/accenten) gezocht **in** het antwoord van de gebruiker. Gebruik het voor de 1 tot 2 fouten die Nederlanders echt maken, in fill/write/build. Niet overdrijven: zet het op ca. een kwart van de typoefeningen.

## 5. Kaarten (uitleg in `learn`-lessen)

Elke `learn`-les heeft `cards` (6 tot 7) en `quiz` (6 tot 7 oefeningen die precies toetsen wat de kaarten leerden). Kaartsoorten:

```json
{ "kind": "text", "title": "Zo groet je", "body": "Een **hoofdpunt** vet maken kan met dubbele sterretjes.\n- Lijstje met streepje\n- Tweede punt" }
{ "kind": "examples", "title": "Voorbeelden", "intro": "Optionele inleiding", "items": [{ "es": "Buenos días.", "nl": "Goedemorgen." }] }
{ "kind": "table", "title": "ser", "intro": "...", "head": ["persoon", "ser"], "rows": [["yo", "**soy**"], ["tú", "**eres**"]], "note": "Optionele voetnoot" }
{ "kind": "tip", "tone": "tip", "title": "Weetje", "body": "..." }
```

- `examples` (min. 2 items, ideaal 3 tot 5): elk item krijgt een 🔊-knop. Gebruik ze **veel**: de gebruiker moet de zinnen horen. Elke nieuwe structuur krijgt minstens één `examples`-kaart met realistische zinnen uit een gesprek.
- `table`: 2 tot 4 kolommen, rijen met evenveel cellen als kolommen. Voor vervoegingen: 6 rijen (yo, tú, él/ella/usted, nosotros/as, vosotros/as, ellos/ellas/ustedes). Maak de uitgang vet.
- `tip` tonen: `"tip"` (💡), `"warn"` (⚠️ let op / valkuil), `"spain"` (🇪🇸 verschil of weetje over Spanje), `"police"` (👮 politiewerk, bv. een zin die je in je werk nodig hebt of een Nederlandse term met Spaanse tegenhanger).
- Sla **geen kaartsoort** over: gebruik per les minstens één `examples`-kaart en (bij werkwoorden) een `table`-kaart. Houd tekst kort: een `text`-kaart max ca. 90 woorden. Een kaart = één idee. Eindig een uitlegles met een `tip`-kaart met een handig geheugensteuntje of valkuil.
- Houd Nederlanders in gedachten: wijs op **valse vrienden** en typische Nederlandse fouten, maar alleen als je zeker van je zaak bent (bv. «embarazada» = zwanger, niet «beschaamd»; «constipado» = verkouden; «éxito» = succes, niet «uitgang»; «actualmente» = tegenwoordig/momenteel, niet «eigenlijk»), het weglaten van het werkwoord «ser/estar», de verplichte ¿ en ¡ en het vergeten van onderwerpsloze zinnen (in het Spaans mag *yo* vaak weg).
- Opmaak in tekst: `**vet**`, regelafbreking `\n`, lijstjes met `- ` aan het begin van een regel. Geen HTML.

## 6. Gesprekken (dialogue)

```json
{
  "kind": "dialogue", "title": "Een toerist helpt", "emoji": "🧳",
  "dialogue": {
    "setting": "Je staat bij het Centraal Station in Ámsterdam. Een Spaanse toerist spreekt je aan.",
    "formal": "usted",
    "npcName": "Turista",
    "npcEmoji": "🧳",
    "tags": ["politie"],
    "turns": [
      { "who": "npc", "es": "Perdone, ¿me puede ayudar?", "nl": "Pardon, kunt u mij helpen?" },
      { "who": "you", "ex": { "type": "choice", "prompt": "Jij zegt: «Natuurlijk, waarmee kan ik u helpen?»",
          "options": ["Claro, ¿en qué puedo ayudarle?", "No hablo español.", "Adiós."], "answer": 0,
          "optionsNl": ["Natuurlijk, waarmee kan ik u helpen?", "Ik spreek geen Spaans.", "Dag."] } },
      { "who": "npc", "es": "Busco la estación de tranvía.", "nl": "Ik zoek het tramstation." }
    ]
  }
}
```

- `formal`: `"usted"` (met publiek, slachtoffers, verdachten), `"tú"` (collega's, vrienden, kinderen), of `"mixed"`.
- `tags`: `["politie"]` bij de politiegesprekken (les 9 van elk niveau en eventueel extra). Zonder tag voor de gewone gesprekken. 
- Een gespreksbeurt van de gebruiker is een gewone oefening (`ex`), maar **zonder** `listen`. De prompt zegt wat de gebruiker moet bereiken, bv. «Jij vraagt hoe hij heet» of «Jij zegt dat je het gaat opschrijven» (Nederlands, of in latere niveaus ook eenvoudig Spaans). De app toont de laatste `npc`-regel boven de oefening.
- **Opbouw in moeilijkheid (belangrijk!):**
  - Niveau 1 en 2: alleen `choice` (3 opties, optionsNl verplicht) en `build` (korte zinnen).
  - Niveau 3 tot 5: vooral `build` en `choice`, een paar korte `write` en `fill`.
  - Niveau 6 tot 9: meerderheid `write` en `build`, af en toe `choice` en `fill`.
  - Niveau 10 tot 13: bijna alles `write` (korte vrije antwoorden), een enkele `build`/`choice` als het onderwerp nieuw is.
- Het gesprek moet **realistisch en samenhangend** zijn en volgt een duidelijke scène met een begin, een probleem en een afronding. Geen losse zinnetjes. De `npc` mag in het Spaans iets moeilijkere taal gebruiken dan de gebruiker zelf hoeft te produceren (met `nl`-vertaling), maar niet veel verder dan wat in dit en eerdere niveaus is behandeld.
- Laat de gebruiker ook **begrijpen** wat gevraagd wordt: de npc stelt vragen, de gebruiker beantwoordt ze op inhoud (leeftijd, adres, wat er gebeurd is).
- De gebruiker moet in een `write`-beurt vaak kunnen kiezen uit meer dan één goed antwoord; geef de varianten in `answers`. Vaak heeft een gespreksbeurt een persoonlijk feit nodig ("Ik heet ... "). Gebruik dan een vast gegeven in de opdracht: «Jij heet Pedro» of «Je bent 34 jaar». Zo is er één goed antwoord.
- Elke `nl` bij `npc` is een natuurlijke Nederlandse vertaling.

## 7. Taal van de uitleg: Nederlands wordt geleidelijk Spaans

`instructionLang` in `meta.json` bepaalt de opdrachtregel boven oefeningen ("Elige la respuesta correcta" / "Kies het juiste antwoord"): `nl` in niveau 1 tot 3, `mix` (Spaans met Nederlands eronder) in niveau 4 tot 6, `es` (alleen Spaans) in niveau 7 tot 13.

Voor **jouw eigen tekst** (kaarten, `hint`, `explain`, prompts):

| niveau | uitleg-taal |
|---|---|
| 1 tot 3 | Alles in het Nederlands. Spaans alleen in voorbeeldzinnen en antwoorden. |
| 4 tot 6 | Nederlands, maar grammaticatermen krijgen de Spaanse naam erbij (bv. «de gebiedende wijs (*el imperativo*)»). Prompts in oefeningen blijven Nederlands. |
| 7 tot 9 | Begin elke `text`-kaart en elke `explain` met één korte, eenvoudige Spaanse zin die de kern geeft, daarna de Nederlandse uitleg. Prompts van gespreksbeurten mogen deels Spaans zijn («Dile que...»). |
| 10 tot 13 | Kaarten: 1 tot 2 korte, simpele Spaanse zinnen als samenvatting, daarna de Nederlandse uitleg (kort). `hint`/`explain` mogen Spaans zijn met een Nederlandse toelichting. Gespreksprompts bij voorkeur Spaans («Pídele que...», «Dile que...», «Pregunta si...») waar de gebruiker de betekenis kan raden, met `nl`-hulp. |

De Nederlandse stijl: informeel (**je**, nooit «u»), vriendelijk, kort, concreet, geen wollige taal. Eén emoji per kaart is genoeg.

## 8. Leerpad, bereik en afgesproken namen

Gebruik in niveau N **alleen** grammatica en woorden uit niveau 1 tot en met N (zie 8.2). Nieuwe woorden **introduceer je in de kaarten** van dat niveau (examples/table). In een gesprek mag een `npc` een enkel onbekend woord gebruiken als het uit de context en de `nl`-vertaling duidelijk is, maar de gebruiker hoeft zelf alleen bekende taal te produceren. Geef elk niveau ca. 35 tot 45 nieuwe woorden/uitdrukkingen. Herhaal veel woorden en structuren uit eerdere niveaus (herhaling is belangrijk: laat de oefeningen en gesprekken oude stof terugbrengen, vooral werkwoorden in de tegenwoordige tijd).

### 8.1 Overzicht

| N | titel (afgesproken) | focus | instructionLang | niveau-badge | politie-gesprek (les 9) |
|---|---|---|---|---|---|
| 1 | ¡Hola! | begroeten, jezelf voorstellen, spellen, tellen tot 20, ser, llamarse, nationaliteiten | nl | 🤝 Primer contacto | je stelt jezelf voor als agent en vraagt naam en nationaliteit (en laat de naam spellen) |
| 2 | Mi mundo | lidwoorden, zelfstandige en bijvoeglijke naamwoorden, regelmatige werkwoorden, tener, tot 100, persoonsgegevens | nl | 🪪 Datos en regla | persoonsgegevens opnemen (naam, adres, telefoon, geboortedatum, leeftijd) |
| 3 | Pedir y preguntar | vraagwoorden, estar/ser, hay, querer/poder, tijd en datum, prijzen, horeca en winkel | nl | 🎟️ Preguntón | een verdwaalde toerist: hotel, adres, wat is er aan de hand |
| 4 | Mi día a día | dagindeling, reflexieve werkwoorden, onregelmatige tegenwoordige tijd, stamwisselaars, gustar, tener que | mix | ⏰ Rutina total | 's nachts iemand aanspreken: wat doet u hier, wie wacht u op, wanneer komt hij |
| 5 | ¿Cómo llego? | stad en vervoer, plaatsvoorzetsels, **gebiedende wijs (bevestigend, usted en tú)** voor routebeschrijving | mix | 🧭 Sin perderse | een toerist de weg wijzen met de gebiedende wijs |
| 6 | Planes y planes | ir a + infinitivo, plannen, weer, vergelijken, estar + gerundio, lo/la/los/las | mix | 📅 Con planes | geluidsoverlast / drukte bij een evenement: wat gebeurt er, wat ga ik doen |
| 7 | ¿Qué ha pasado? | pretérito perfecto, participios, "me han robado", ya/todavía no | es | 🔎 Detective | **aangifte opnemen**: diefstal van tas, telefoon of portemonnee |
| 8 | Ayer y antes | pretérito indefinido regelmatig en onregelmatig, hace + tijd | es | 📖 Narrador | getuigenverklaring over een ongeluk van gisteravond |
| 9 | Cómo era | pretérito imperfecto, beschrijvingen, indefinido vs imperfecto | es | 🕵️ Retrato hablado | signalement van een verdachte (uiterlijk, kleding, auto, kenteken) |
| 10 | Mañana y después | futuro simple, si + presente + futuro, procedures | es | 🔮 Futuro claro | het slachtoffer vertellen wat er na de aangifte gebeurt; een boete uitleggen |
| 11 | ¡Alto! Órdenes | **gebiedende wijs compleet** (tú/usted/vosotros/ustedes, bevestigend en ontkennend, met voornaamwoorden), controle en aanhouding | es | 🛑 Voz de mando | verkeerscontrole en identiteitscontrole; aanhouding met de **rechten** (zwijgrecht, advocaat, tolk) |
| 12 | ¿Podría ayudarme? | condicional, beleefd vragen en adviseren, de-escaleren | es | 🕊️ Mano izquierda | een ruzie of burenruzie de-escaleren |
| 13 | Todo junto | **subjuntivo (basis)**: quiero que, necesito que, es importante que, cuando + subj; alle tijden combineren; begin B1 | es | 🎓 Casi B1 | noodsituatie: ongeval / vermist kind / huiselijke ruzie met meerdere stappen |

### 8.2 Bereik per niveau (wat er nieuw is; wat in vorige niveaus stond mag je gebruiken)

**1 ¡Hola!** hola, adiós, buenos días/buenas tardes/buenas noches, hasta luego/mañana, por favor, gracias, de nada, perdón/perdone/lo siento, sí/no, ¿qué tal?, bien/mal/regular, mucho gusto/encantado(a); pronombres (yo, tú, él, ella, usted, nosotros/as, vosotros/as, ellos/as, ustedes); **ser** (hele tegenwoordige tijd); **llamarse** (me llamo, te llamas, se llama); ¿cómo te llamas?/¿cómo se llama (usted)?; ¿de dónde eres/es usted?; soy de...; landen (los Países Bajos/Holanda, España, Alemania, Francia, Italia, Bélgica, Portugal, Inglaterra/el Reino Unido); nationaliteiten (neerlandés/holandés(a), español(a), alemán/alemana, francés/francesa, italiano(a), belga, inglés/inglesa, portugués/portuguesa) en vorming van vrouwelijk; beroepen (policía, agente, turista, estudiante, médico/a, abogado/a, profesor(a)); getallen 0 tot 20; alfabet en uitspraak (b/v, c/z/qu, g/j, h stom, ll, ñ, rr, accenten); ¿cómo se escribe?, ¿puede repetir?, no entiendo, hablo un poco de español, más despacio, por favor; tú vs usted (kort).

**2 Mi mundo** lidwoorden (el, la, los, las, un, una, unos, unas), geslacht en meervoud van zelfstandige naamwoorden, overeenkomst van bijvoeglijke naamwoorden (alto/a, bajo/a, joven, viejo/a, grande, pequeño/a, simpático/a, nuevo/a, casado/a, soltero/a); **regelmatige tegenwoordige tijd** -ar, -er, -ir (hablar, trabajar, estudiar, necesitar, ayudar, llamar, comer, beber, aprender, leer, vivir, escribir); **tener** (tengo, tienes, ...; tener ... años); ontkenning no; bezittelijke voornaamwoorden (mi, tu, su, nuestro); familie (padre, madre, hermano/a, hijo/a, marido, mujer/esposa, amigo/a, abuelo/a); casa, calle, ciudad, piso; getallen 21 tot 100; persoonsgegevens (nombre, apellido, dirección, número, teléfono, correo electrónico, fecha de nacimiento, edad, pasaporte, documento de identidad, carné de conducir); ¿cuál es...?, ¿cuántos años tiene?, ¿dónde vive?, ¿dónde trabaja?; vivo en, trabajo en; en (plaats), de (herkomst); y, o, pero, también.

**3 Pedir y preguntar** vraagwoorden (qué, quién, dónde, cuándo, cómo, cuánto/a/os/as, por qué, cuál); **estar** (heel) en het verschil ser/estar (kenmerk/beroep/herkomst vs plaats/toestand); **hay**; **querer** en **poder** (heel, met stamwisseling als gewoon te leren patroon: quiero, queremos; puedo, podemos); necesitar; kunnen/willen + infinitief (¿puede ayudarme?, ¿me puede decir...?, quisiera als vaste uitdrukking); dagen, maanden, de klok (es la una, son las tres y media/cuarto/menos veinte), hoy/mañana, a las; getallen 100 tot 1000, prijzen (euros, céntimos, ¿cuánto cuesta?, caro/barato); eten en drinken (café, té, agua, cerveza, vino, bocadillo, tapa, ensalada, la cuenta, el menú), winkel (tienda, supermercado), plaatsen (estación, hotel, habitación, banco, hospital, comisaría); aquí/allí/ahí, cerca/lejos; ¿me puede repetir?; ¿puedo ver su pasaporte?; ¿en qué puedo ayudarle?

**4 Mi día a día** reflexieve werkwoorden (levantarse, ducharse, vestirse, acostarse, llamarse); **onregelmatige tegenwoordige tijd**: ir, hacer, salir, venir, ver, saber, conocer, dar, poner, traer; **stamwisselaars** e>ie (empezar, entender, preferir, pensar), o>ue (volver, dormir, encontrar, recordar), e>i (pedir, seguir, repetir); gustar (me gusta/n, te gusta, le gusta); tener que + infinitivo; hay que; frequentie (siempre, a menudo, a veces, casi nunca, nunca, todos los días); dagdelen en diensten (turno de mañana/tarde/noche, de lunes a viernes); werk (oficina, comisaría, compañero/a, jefe/a, reunión, horario, trabajar de ... a ...); primero, luego, después, por fin; vrije tijd (leer, correr, cocinar, deporte, cine, música); ¿a qué hora...?; ¿qué hace usted aquí?

**5 ¿Cómo llego?** stad (calle, plaza, esquina, semáforo, puente, parque, estación, parada, museo, banco, farmacia, hospital, correos, comisaría), vervoer (tren, autobús, tranvía, metro, bicicleta, taxi, aeropuerto, billete, tarjeta de transporte), richtingen (todo recto, a la derecha/izquierda, la primera/segunda calle, hasta el semáforo), werkwoorden (seguir, girar, cruzar, tomar/coger, bajar, subir, esperar, venir, ir), voorzetsels van plaats (cerca de, lejos de, enfrente de, al lado de, entre, detrás de, delante de, en la esquina), a pie/en coche/en bici; ordinales (primero ... quinto); **imperativo afirmativo**: usted (siga, gire, cruce, tome, coja, baje, suba, espere, venga, vaya, diga, mire, escuche, repita) en tú (sigue, gira, cruza, toma, coge, baja, sube, espera, ven, ve, di, mira, escucha, repite); por favor + imperativo; "está a cinco minutos".

**6 Planes y planes** **ir a + infinitivo** (voy a, vas a...), plannen (viaje, vacaciones, fin de semana, cena, fiesta, concierto, quedar con, invitar, reservar), tijdsaanduidingen (mañana, pasado mañana, la semana que viene, el mes que viene, esta tarde, esta noche, el sábado), weer en seizoenen (hace sol/frío/calor, llueve, nieva, hay niebla; primavera, verano, otoño, invierno), vergelijkingen (más ... que, menos ... que, tan ... como, el más ..., mejor, peor), **estar + gerundio** (estoy hablando, están discutiendo; regelmatig en veel voorkomende onregelmatige: leyendo, durmiendo, diciendo), **lo/la/los/las** als lijdend voorwerp en me/te/le/nos als meewerkend voorwerp (basis, bij werkwoorden: ¿me ayuda?, lo veo, la llamo, le digo), porque, pero, entonces, mientras; evenement en overlast (ruido, vecino, música, multitud, manifestación, calle cortada, entrada, seguridad).

**7 ¿Qué ha pasado?** **pretérito perfecto** (he, has, ha, hemos, habéis, han + participio; regelmatige en onregelmatige participios: hecho, dicho, visto, puesto, escrito, abierto, vuelto, roto, muerto), tijdsaanduidingen (hoy, esta mañana, esta tarde, esta semana, este año, ya, todavía no, nunca, alguna vez, siempre), acabar de + infinitivo, voorwerpen (cartera, bolso, mochila, móvil, llave, cámara, maleta, tarjeta, dinero, bicicleta, coche, documentos), werkwoorden (robar, perder, encontrar, romper, caerse, ocurrir/pasar, denunciar, ver, oír, llamar), misdrijf en aangifte (denuncia, denunciar, robo, hurto, ladrón/ladrona, testigo, víctima, herido/a, daño, comisaría, formulario, declaración, firmar), "me han robado la cartera", "he perdido", "¿qué ha pasado?", "¿lo ha visto?", "¿ha llamado a su banco?", "¿ha bloqueado la tarjeta?".

**8 Ayer y antes** **pretérito indefinido**: regelmatig (-ar: -é, -aste, -ó, -amos, -asteis, -aron; -er/-ir: -í, -iste, -ió, -imos, -isteis, -ieron), **onregelmatig**: ser/ir (fui, fuiste, fue...), hacer, estar, tener, poder, poner, venir, decir, dar, ver, saber, querer, traer, e>i in -ir (pidió, durmió, siguió), -car/-gar/-zar (busqué, llegué, empecé), leer/oír (leyó, oyó); tijdsaanduidingen (ayer, anteayer, anoche, el lunes pasado, la semana pasada, el año pasado, hace dos días, en 2020, ese día, a las diez), volgorde van gebeurtenissen (primero, luego, después, entonces, de repente, al final); ongeval en getuigenis (accidente, choque, semáforo en rojo, velocidad, golpear, chocar, conducir, frenar, atropellar, ambulancia, herido, testigo, declaración, "¿qué vio?", "¿qué hizo?", "¿a qué hora ocurrió?").

**9 Cómo era** **pretérito imperfecto** (-aba/-ía; ser: era, ir: iba, ver: veía), gebruik: beschrijvingen, gewoontes, achtergrond; **indefinido vs imperfecto** (cuando, mientras, de repente, siempre, todos los días), **estaba + gerundio**; uiterlijk (alto/bajo/mediano, delgado/robusto/gordo, joven/mayor, de unos treinta años, pelo corto/largo/rubio/moreno/castaño/pelirrojo, calvo, barba, bigote, gafas, cicatriz, tatuaje, ojos azules/marrones/verdes), kleding (chaqueta, camisa, camiseta, pantalones, vaqueros, jersey, sudadera, gorra, zapatos, zapatillas, abrigo, bufanda, mochila, bolsa), kleuren, auto (marca, modelo, color, matrícula, coche, moto, furgoneta, bici), llevaba, tenía, medía; richtingen van ontsnappen (huyó hacia, se fue por).

**10 Mañana y después** **futuro simple** (regelmatig: -é, -ás, -á, -emos, -éis, -án; onregelmatig: tendré, podré, haré, diré, pondré, saldré, vendré, sabré, querré, habrá), si + presente + futuro, tijd (dentro de, el próximo/la próxima, en unos días, pronto, más tarde, mañana por la mañana), procedure (multa, informe, caso, investigación, juez, tribunal, fiscal, abogado, intérprete, citación, plazo, copia, número de caso, pagar, recibir, enviar, esperar, llamar, volver, firmar, declarar), "le llamaremos", "recibirá una carta", "tendrá que pagar", "se abrirá una investigación", zekerheid en vermoeden (probablemente, seguramente, quizá).

**11 ¡Alto! Órdenes** **imperativo compleet**: afirmativo en negativo; tú (habla/no hables), usted (hable/no hable), vosotros (hablad/no habléis), ustedes (hablen/no hablen); onregelmatig (ven, haz, di, pon, sal, ten, ve, sé; venga, haga, diga, ponga, salga, tenga, vaya, sea); **voornaamwoorden bij het gebod** (dígame, deme, enséñeme, muéstreme, siéntese, cálmese, no se mueva, no lo toque, apártese, levante las manos, démelo); controle (documentación, permiso de conducir, seguro, matrícula, control de tráfico, alcoholemia, soplar, abrir, bajar la ventanilla, salir del vehículo, apagar el motor, aparcar, parar, quedarse, esperar, manos, bolsillos, registrar, arma, cuchillo, objetos); aanhouding (detener/detenido, esposas, ponerse las esposas, comisaría, "queda detenido", "no está obligado a decir nada" / "tiene derecho a guardar silencio", "tiene derecho a un abogado", "tiene derecho a un intérprete", "tiene derecho a avisar a su familia/consulado" alleen als je zeker bent, "¿entiende lo que le digo?").

**12 ¿Podría ayudarme?** **condicional** (regelmatig -ía; onregelmatig zoals futuro: tendría, podría, haría, diría, pondría, saldría, vendría, sabría, querría, habría), beleefd verzoeken en aanbieden (¿podría...?, ¿me podría...?, ¿le importaría + inf.?, me gustaría, querría, quisiera, debería, tendría que, convendría, sería mejor), advies (yo en su lugar + condicional, yo que usted), voorstellen (podríamos, deberíamos), de-escaleren (calmarse, tranquilo/a, entiendo, comprendo, lo siento, vamos a solucionarlo, escúcheme, un momento), conflict (discutir, pelea, ruido, molestar, queja, vecinos, borracho/a, alcohol, droga, gritar, amenazar), "¿Podría hablar más bajo?", "¿Le importaría moverse?", "Le agradecería que...": alleen de vaste uitdrukking zonder verdere subjuntivo-uitleg.

**13 Todo junto** **presente de subjuntivo** (regelmatig: hable, coma, viva; onregelmatig: sea, esté, vaya, tenga, haga, venga, diga, salga, ponga, sepa, pueda, quiera, dé), gebruik: quiero que, necesito que, espero que, le pido que, es importante/necesario/mejor que, no creo que, es posible que, cuando + subjuntivo (futuro), para que, antes de que; alle tijden combineren in een verhaal (presente, perfecto, indefinido, imperfecto, futuro, condicional); noodsituaties (accidente, incendio, herido, ambulancia, bomberos, desaparecido/a, niño perdido, violencia doméstica, discusión, amenaza, ayuda, urgente, tranquilícese, respire, quédese aquí); samenvattende gesprekken op B1-niveau met meerdere stappen.

## 9. Kwaliteitseisen (lees dit goed)

1. **Spaans moet 100% correct zijn.** Controleer elke vervoeging, elk accent, ¿ ¡ en overeenkomst van geslacht/getal. Eén fout in een leerapp is erger dan een ontbrekende oefening. Twijfel je aan een zin, kies een zin waar je zeker van bent.
2. **Natuurlijk Spaans uit Spanje**, geen vertaalde Nederlandse zinnen. Zeg «¿Puede repetirlo, por favor?» en niet «¿Puede herhalar?».
3. **Alle goede antwoorden in `answers`.** Denk aan synoniemen en beleefdheidsvarianten. Maar neem geen onjuist Spaans op.
4. **Variatie in oefenvormen** binnen elke les (choice, fill, build, write, listen). Niet 12 keer hetzelfde type achter elkaar. Typoefeningen (fill/write) nemen toe naarmate het niveau stijgt.
5. **Geen valse hints.** Een `hint` of `explain` moet kloppen en het antwoord niet weggeven.
6. **Opbouw binnen een niveau:** les 1 introduceert, les 2 oefent dat, les 3 laat het in een gesprek gebruiken, les 4 introduceert het volgende onderdeel, enz.; les 8 en de toets mixen alles. Gebruik per niveau **minstens 4 verschillende gesprekssituaties**.
7. **Politie-inhoud**: realistisch, beroepsmatig, respectvol; kies situaties die een Nederlandse agent echt tegenkomt (Spaanse toerist, student, expat, zakkenroller, fietsendiefstal, ongeval, geluidsoverlast, verkeerscontrole). Noem Nederlandse procedures alleen als je er zeker van bent; je hoeft geen wetsteksten na te bootsen. Hou het bij algemene, bekende zaken (identiteit controleren, aangifte opnemen, rechten voorlezen, boete uitleggen). Zet in `tip`-kaarten met `"tone": "police"` handige beroepszinnen. De politiegesprekken zijn **oefenmateriaal, geen officiële vertaling**.
8. **Geen echte personen, kentekens of telefoonnummers.** Gebruik verzonnen namen (Carmen García, Javier Ruiz, Lucía Fernández, Pablo Navarro...) en duidelijk fictieve nummers en kentekens (bv. «06 00000000», «AB-123-C»).
9. **Korte teksten.** Opgaven max ca. 25 woorden; `explain` max ca. 40 woorden; kaarten een idee per kaart.
10. **Respect voor de leerling:** geen betuttelende toon, geen overdreven uitroeptekens. Af en toe een grapje of een leuk weetje over Spanje is prima.

## 10. Afsluiten

Als alles zonder fouten door de scripts komt, lees je de gegenereerde `levelNN.json` nog één keer na op Spaanse fouten (vooral accenten en werkwoordsvormen) en op consistentie met de afgesproken inhoud in 8.2. Meld in je eindbericht in 5 tot 8 regels: wat het niveau bevat, welke nieuwe woorden/structuren je geïntroduceerd hebt (korte lijst), welke twijfelgevallen je zag, en dat de scripts geen fouten geven.
