# Hablemos: handleiding voor lesauteurs

Hablemos is een Android-app waarmee een Nederlandse politieagent Spaans leert **spreken**. Dit is de handleiding voor wie een niveau (een `levelNN.json`) schrijft. Lees ook `docs/CURRICULUM.md`: daar staat wat elk niveau moet bevatten.

## 1. De leerder en het doel

- Absolute beginner, Nederlandstalig, werkt als politieagent in Nederland.
- Leert **Spaans uit Spanje** (tú, usted, vosotros, ustedes; woorden als *coche, ordenador, móvil, zumo, vale, piso*). Geen Latijns-Amerikaans Spaans (*carro, computadora, celular, jugo, ahorita, platicar* ...).
- Het doel is een gesprek kunnen voeren, geen woordjes stampen. Elke les draait om iets wat je **kunt zeggen of begrijpen**. Woorden komen mee als onderdeel van zinnen en situaties.
- Gebruiksdoelen: toeristen helpen, aangifte opnemen, controle en aanhouding, noodsituaties, en begrijpen wat Spaanstaligen aan een Nederlandse agent kunnen vragen. Daarnaast reizen, werk, dagelijks leven en sociale gesprekken.
- Sessies duren 15 tot 20 minuten. Eén les is ongeveer 10 tot 15 minuten.
- De app is mobiel (Android), speels en vriendelijk. Een vos (Zorro) reageert op goede en foute antwoorden. Jij schrijft alleen de inhoud.

## 2. Werkwijze en bestanden

Je schrijft **één niveau**: de bestanden in `content-src/levelNN/` (NN = tweecijferig, bv. `level03`). Raak geen andere bestanden aan, ook niet de bestanden van andere niveaus, en draai `scripts/build-index.mjs` **niet**.

```
content-src/levelNN/meta.json          niveau-gegevens (zonder lessen)
content-src/levelNN/lesson-01.json     les 1
...
content-src/levelNN/lesson-10.json     les 10 (de toets)
```

Schrijf per les één bestand met één `Write`-aanroep (zo blijft elk bestand overzichtelijk). Daarna:

```bash
cd /home/claude/hablemos
node scripts/assemble-level.mjs 3                                  # voegt samen en zet de id's goed (je hoeft zelf geen id's in te vullen)
node scripts/validate-content.mjs src/content/levels/level03.json  # structuurcontrole
/home/claude/.npm-global/bin/tsx scripts/check-answers.ts src/content/levels/level03.json   # keurt elk modelantwoord goed?
```

Herhaal tot er **geen fouten** meer zijn. Waarschuwingen mag je lezen en waar zinvol oplossen (ze wijzen bv. op een Latijns-Amerikaans woord of een ontbrekende vertaling).

`meta.json`:

```json
{
  "title": "Hola y presentarse",
  "subtitle": "Begroeten en jezelf voorstellen",
  "emoji": "👋",
  "instructionLang": "nl",
  "goals": ["Je kunt iemand begroeten en afscheid nemen", "Je kunt je naam en nationaliteit zeggen", "Je kunt je naam spellen"],
  "badge": { "name": "Primer contacto", "emoji": "🤝", "desc": "Rond niveau 1 af." }
}
```

`goals`: 3 tot 5 "Je kunt ..."-doelen in het Nederlands. De badge-emoji moet uniek zijn ten opzichte van andere niveaus (zie CURRICULUM).

## 3. Vaste opbouw: precies 10 lessen per niveau

| Les | kind | Wat | Omvang |
|---|---|---|---|
| 1 | `learn` | uitleg + quiz | 5 tot 7 kaarten, quiz van 6 tot 7 oefeningen |
| 2 | `practice` | oefenen van les 1 | 12 tot 14 oefeningen |
| 3 | `dialogue` | gesprek: dagelijks leven of sociaal | 7 tot 9 beurten voor de leerder (`you`) |
| 4 | `learn` | uitleg + quiz | idem |
| 5 | `practice` | oefenen van les 4 + herhaling | 12 tot 14 oefeningen |
| 6 | `dialogue` | gesprek: reizen of werk (vanaf niveau 5 ook politie-achtig) | 7 tot 9 beurten |
| 7 | `learn` | uitleg + quiz | idem |
| 8 | `practice` | oefenen van les 7 + herhaling | 12 tot 14 oefeningen |
| 9 | `dialogue` | **politie**: tag `"politie"` verplicht | 7 tot 9 beurten |
| 10 | `test` | niveautoets over het hele niveau | 18 tot 20 oefeningen |

Een gesprek heeft ongeveer evenveel beurten voor de gesprekspartner (`npc`) als voor de leerder, begint altijd met een `npc`-beurt en heeft nooit twee `you`-beurten achter elkaar. Totaal maximaal 24 beurten.

De toets: dekt alle doelen van het niveau, bevat minstens 40% getypte antwoorden (`fill`, `write`, `build`) en 3 luisteroefeningen. Wie 80% haalt, komt verder.

**Herhaling (spiraal):** minstens 3 oefeningen in elke oefenles en 4 in de toets gaan over stof uit eerdere niveaus (zonder nieuwe woorden). Zo blijft het hangen.

## 4. Het datamodel met voorbeelden

De types staan in `src/types.ts`. Hieronder alles wat je nodig hebt. Je laat `id` weg: `assemble-level.mjs` vult ze in.

Opmaak in tekst: alleen `**vet**` en regeleinden (`\n`). Lijstjes in kaarten: regels die met `- ` beginnen. Geen HTML, geen andere markdown. Gebruik voor aanhalingen in het Nederlands `«...»` (dan hoef je geen `\"` te escapen). Gebruik echte Spaanse tekens: á é í ó ú ñ ü ¿ ¡.

### 4.1 Uitlegles (`learn`)

```json
{
  "kind": "learn",
  "title": "Jezelf voorstellen",
  "emoji": "👋",
  "cards": [
    { "kind": "text", "title": "Wat ga je leren?", "body": "In deze les leer je zeggen hoe je heet en waar je vandaan komt." },
    { "kind": "examples", "title": "Zo stel je jezelf voor", "intro": "Tik op het luidsprekertje om te luisteren.",
      "items": [ { "es": "Me llamo Pieter.", "nl": "Ik heet Pieter." }, { "es": "Soy de los Países Bajos.", "nl": "Ik kom uit Nederland." } ] },
    { "kind": "table", "title": "ser (zijn)", "head": ["Wie", "Spaans", "Nederlands"],
      "rows": [["yo", "**soy**", "ik ben"], ["tú", "**eres**", "jij bent"]],
      "note": "Een persoonlijk voornaamwoord weglaten mag in het Spaans." },
    { "kind": "tip", "tone": "spain", "body": "In Spanje zeg je vaak **vale** voor «oké»." }
  ],
  "quiz": [ "... 6 tot 7 oefeningen, zie 4.2 ..." ]
}
```

- Kaartsoorten: `text` (body), `examples` (items met `es` en `nl`, minstens 2), `table` (`head` met 2 tot 4 kolommen, elke rij evenveel cellen), `tip` (`tone`: `tip`, `warn`, `spain`, `police`).
- Elke kaart: maximaal ongeveer 110 woorden. Eén idee per kaart. Een tabel heeft maximaal 8 rijen.
- Begin met een kaart «Wat ga je leren?» (het concrete doel), eindig met een `tip`-kaart (valkuil, Nederlandse interferentie, of Spaans-in-Spanje).
- Elke Spaanse voorbeeldzin heeft een Nederlandse vertaling. Spaanse zinnen in `examples` worden voorgelezen door de app.
- `tone: "police"` gebruik je voor werkcontext (bv. hoe je dit in een controle zegt). `tone: "spain"` voor een cultuur- of taalnoot over Spanje.

### 4.2 De vijf oefenvormen

**choice** (meerkeuze, 2 tot 5 opties):

```json
{ "type": "choice", "prompt": "Hoe zeg je «Ik heet Anna»?", "options": ["Me llamo Anna.", "Se llama Anna.", "Te llamas Anna."], "answer": 0,
  "hint": "Het gaat om «ik».", "explain": "**Me llamo** = ik heet. Bij «jij» hoort **te llamas**, bij «hij/zij/u» **se llama**." }
```

Spaanse vraag, Nederlandse betekenis of Spaanse antwoorden (begrijpen):

```json
{ "type": "choice", "prompt": "¿De dónde es usted?", "promptLang": "es", "speak": "¿De dónde es usted?", "nl": "Waar komt u vandaan?",
  "options": ["Soy de Utrecht.", "Tengo treinta años.", "Me llamo Eva."], "optionsNl": ["Ik kom uit Utrecht.", "Ik ben dertig jaar.", "Ik heet Eva."], "answer": 0 }
```

- `promptLang: "es"` en `speak` als de prompt Spaans is (dan komt er een luidsprekerknop).
- `optionsLang: "nl"` als de opties Nederlands zijn (bv. «Wat betekent dit?»). Standaard zijn opties Spaans.
- Bij Spaanse opties: geef `optionsNl` (vertaling per optie, zelfde volgorde). Verplicht in gesprekken, sterk aanbevolen elders.
- Zet het goede antwoord niet steeds op dezelfde plek; verdeel `answer` over 0, 1, 2 (en 3).
- Afleiders zijn plausibel (de typische fout), niet belachelijk.

**fill** (één woord of woordgroep invullen, exact één `___`):

```json
{ "type": "fill", "sentence": "Nosotros ___ en Ámsterdam.", "answers": ["vivimos"], "base": "(vivir)", "nl": "Wij wonen in Amsterdam.",
  "explain": "Bij **nosotros** eindigt een -ir-werkwoord op **-imos**.", "wrong": [{ "match": "vivemos", "feedback": "Bijna! Bij -ir-werkwoorden is het **-imos**, niet -emos." }] }
```

`answers`: alleen het ontbrekende stuk. `base`: kleine hulpregel (infinitief, persoon). Geef bij elke `fill` een `nl` en (`hint` of `base`).

**build** (zin opbouwen uit woordblokjes):

```json
{ "type": "build", "prompt": "Zeg: «Ik woon in Utrecht.»", "words": ["Vivo", "en", "Utrecht", "vivimos", "soy"], "answers": ["Vivo en Utrecht"] }
```

- `words` = alle woorden (goede + maximaal 3 afleiders), één woord per blokje, 2 tot 12 woorden. Tekens als ¿ ? ! , horen bij het woord (`"¿Cómo"`, `"llamas?"`).
- Elk geaccepteerd antwoord moet volledig uit `words` te bouwen zijn. Hoofdletters en leestekens tellen niet mee bij het nakijken.
- Een onderwerpswoord (yo, tú ...) aan het begin is automatisch optioneel. Zet het dus **niet** in de woordenbank, tenzij de oefening juist over het voornaamwoord gaat.
- Meerdere goede zinnen: zet ze alle in `answers` (de eerste is de modelzin).

**write** (zelf een zin schrijven op basis van een Nederlandse opdracht):

```json
{ "type": "write", "prompt": "Zeg dat je Pieter heet en uit Nederland komt.",
  "answers": ["Me llamo Pieter y soy de Holanda.", "Me llamo Pieter y soy de los Países Bajos.", "Me llamo Pieter y soy neerlandés."],
  "hint": "Twee zinnen met **y** (en) ertussen.", "wrong": [{ "match": "soy llamo", "feedback": "Je mengt twee werkwoorden. Zeg **me llamo** voor je naam en **soy** voor je herkomst." }] }
```

Zet **alle** redelijke goede formuleringen in `answers` (met of zonder `usted`, synoniemen, verschillende volgorde). De leerder kan daarnaast zelf op «mijn antwoord was ook goed» tikken, maar hoe vollediger jij bent, hoe minder frustratie.

**listen** (luisteren; niet toegestaan in een gesprek):

```json
{ "type": "listen", "mode": "choose", "es": "Buenas tardes, ¿cómo está usted?", "options": ["Buenas tardes, ¿cómo está usted?", "Buenas noches, ¿cómo está usted?", "Buenos días, ¿cómo estás?"], "answer": 0, "nl": "Goedemiddag, hoe gaat het met u?" }
{ "type": "listen", "mode": "type", "es": "Me llamo Pablo.", "answers": ["Me llamo Pablo"], "nl": "Ik heet Pablo." }
```

`es` wordt voorgelezen en blijft verborgen tot het antwoord. `mode: "choose"`: de opties zijn Spaanse zinnen die lijken op elkaar (minimale verschillen die de leerder moet horen). `mode: "type"`: de leerder typt wat hij hoort; zet in `answers` de zin zoals gesproken (accenten en leestekens mogen ontbreken). Gebruik `type` vooral met korte zinnen (maximaal 10 woorden).
Voor «wat betekent dit?» gebruik je `choice` met `speak` en `optionsLang: "nl"`.

Gemeenschappelijke velden voor alle oefeningen:

| veld | wat |
|---|---|
| `hint` | Nederlandse tip achter de 💡-knop. Verklap het antwoord niet, wijs de weg. (Zonder `hint` toont de app zelf het eerste woord van het antwoord bij fill/build/write.) |
| `explain` | korte uitleg (1 tot 2 zinnen) na het antwoord. Bij grammatica: altijd invullen. |
| `nl` | Nederlandse vertaling van de Spaanse zin in de opgave (🌐-knop). Altijd bij Spaanse zinnen. |
| `wrong` | typische fouten: `{ "match": "stukje tekst", "feedback": "..." }`. `match` wordt vergeleken met het genormaliseerde (kleine letters, zonder accenten of leestekens) antwoord van de leerder, het moet daarin voorkomen. Zet geen `match` die ook in een goed antwoord kan voorkomen (het script controleert dat). 1 tot 3 per getypte oefening waar fouten voorspelbaar zijn. |
| `strictSubject` | `true` alleen als het voornaamwoord bewust verplicht is (bv. oefening «yo of él?»). |

### 4.3 Oefenles (`practice`) en toets (`test`)

```json
{ "kind": "practice", "title": "Oefen: jezelf voorstellen", "emoji": "✏️", "exercises": [ "... 12 tot 14 oefeningen ..." ] }
```

Een toets is hetzelfde met `"kind": "test"` en 18 tot 20 oefeningen. Mix de vormen goed: bij 14 oefeningen bijvoorbeeld 3 choice, 3 fill, 3 build, 3 write, 2 listen. Begin makkelijk, bouw op.

### 4.4 Gesprek (`dialogue`)

```json
{
  "kind": "dialogue",
  "title": "Een toerist op het station",
  "emoji": "🚉",
  "dialogue": {
    "setting": "Op het Centraal Station spreekt een Spaanse toerist je aan. Jij bent agent. Je spreekt met «usted».",
    "formal": "usted",
    "npcName": "Turista",
    "npcEmoji": "🧳",
    "tags": ["politie"],
    "turns": [
      { "who": "npc", "es": "Buenos días, agente. ¿Me puede ayudar?", "nl": "Goedemorgen, agent. Kunt u mij helpen?" },
      { "who": "you", "ex": { "type": "choice", "prompt": "Zeg: «Natuurlijk. Wat is het probleem?»",
          "options": ["Claro. ¿Cuál es el problema?", "Me llamo Ana.", "Adiós."], "optionsNl": ["Natuurlijk. Wat is het probleem?", "Ik heet Ana.", "Tot ziens."], "answer": 0 } },
      { "who": "npc", "es": "He perdido mi maleta.", "nl": "Ik ben mijn koffer kwijt." }
    ]
  }
}
```

- `formal`: `"usted"`, `"tú"` of `"mixed"`. `tags`: `["politie"]` voor politiegesprekken (verplicht in les 9, optioneel in les 6 vanaf niveau 5).
- `setting`: Nederlands, 1 tot 3 zinnen: waar ben je, wie is de ander, wat is jouw rol.
- Een `you`-beurt bevat een gewone oefening (`ex`) van het type `choice`, `build`, `write` of `fill` (nooit `listen`). `prompt` is de Nederlandse opdracht: wat moet de leerder zeggen of doen («Zeg dat ...», «Vraag hoe ...»). De prompt verklapt het Spaans niet. De `npc`-regel erboven wordt in de app al getoond met speaker en vertaalknop.
- **Opbouwend:** de manier van antwoorden wordt per niveau moeilijker (zie CURRICULUM): eerst antwoord **kiezen** (`choice`), dan zinnen **bouwen** (`build`), later zelf **typen** (`write`/`fill`).
- De leerder moet kunnen volgen zonder woorden die niet geleerd zijn. De `npc` mag af en toe één nieuw woord gebruiken als de vertaling en de context het duidelijk maken (en de leerder het niet zelf hoeft te zeggen). In je `you`-antwoorden gebruik je alleen stof uit dit en eerdere niveaus.
- Laat het gesprek een echt doel hebben en een natuurlijk einde (een oplossing, een afspraak, een afscheid). Geen losse zinnen aan elkaar.
- Echte situaties tonen: de gesprekspartner reageert niet altijd precies zoals je verwacht (een wedervraag, een misverstand, «¿Puede repetir?»). Leer ook de reparatiezinnen: *No entiendo. ¿Puede repetir? Más despacio, por favor. ¿Cómo se dice ... en español?*

## 5. Didactiek

1. **Communicatief:** elke les heeft een concreet «ik kan ...»-doel. Grammatica dient het gesprek: leg uit wat de leerder nodig heeft, niet meer. Begin bij voorbeelden en patroon, pas daarna regel en uitzonderingen.
2. **Opbouw:** gebruik alleen grammatica en woorden uit **eerdere niveaus en dit niveau** (zie CURRICULUM voor wat wanneer wordt geleerd). Nieuwe woorden: ongeveer 35 tot 45 per niveau, altijd geïntroduceerd in de uitlegkaarten (voorbeelden, tabel) voordat ze in oefeningen of gesprekken van de leerder voorkomen. Voor de `npc`-beurten geldt de uitzondering hierboven.
3. **Herhaling:** gebruik kernzinnen en kernwerkwoorden uit eerdere niveaus telkens terug (bv. *¿Puede repetir?*, *Me llamo ...*, *¿Cómo se escribe?*).
4. **Variatie en tempo:** wissel oefenvormen af. Maak de eerste oefening van een les makkelijk (herkenning), de laatste lastiger (productie). Geen twee dezelfde vormen achter elkaar als het kan.
5. **Nederlandse interferentie:** benoem valkuilen: *ser/estar* (wij hebben maar één «zijn»), *tener* voor leeftijd, dubbele ontkenning, *hay* (er is/zijn), *jij/u* (tú/usted), werkwoordsuitgangen, valse vrienden (*sensible* = gevoelig, *embarazada* = zwanger, *actualmente* = nu, *eventualmente* = mogelijk, *carpeta* = map, *tarde* = laat / middag), geslacht van zelfstandige naamwoorden, bijvoeglijke naamwoorden komen meestal ná het zelfstandig naamwoord.
6. **Uitspraak:** de app leest voor met een Spaanse (Spanje) stem. Gebruik veel luisteroefeningen vanaf niveau 1 en let op: z/c (Spanje: /θ/), j/g, ll, h (stom), v/b, rr, ñ, klemtoon.
7. **Foutenmanagement:** leerders typen op een telefoon. Accenten, hoofdletters en leestekens tellen niet mee (de app kijkt dat ruim na), een tikfout geeft «bijna goed». Zet toch altijd de correcte accenten in je modelantwoorden. Een foute klemtoon of accent is nooit een apart «fout» in jouw oefeningen.
8. **Correctheid boven alles:** schrijf alleen Spaans waarvan je 100% zeker bent (spelling, accenten, vervoeging, geslacht en getal, woordvolgorde, voorzetsels). Twijfel je, kies een eenvoudiger zin. Spaans in `answers` is ook voorbeeldmateriaal voor de leerder.

## 6. Spaans uit Spanje

- Aanspreken: **tú** (informeel) en **usted** (formeel) allebei vanaf niveau 1; het scenario bepaalt wat past. Politiecontact met het publiek is vrijwel altijd **usted**; met collega's en vrienden **tú**. Meervoud: **vosotros/vosotras** (informeel), **ustedes** (formeel). Presenteer vosotros als gewoon Spaans, niet als bijzaak.
- Woordkeuze: *coche, ordenador, móvil, zumo, patata, piso, gafas, cazadora/chaqueta, aparcar, coger el autobús/el metro, billete, vale, guay, tío (informeel), vaya, ¡qué pena!, de nada, perdona/perdone*.
- Verleden tijd: in Spanje gebruik je voor «vandaag/deze week/net» vaak het **pretérito perfecto** (*hoy he comido*), voor afgesloten tijd het **indefinido** (*ayer comí*). Volg dat.
- Uitspraak-tip: z en c voor e/i als «th» (Spanje), niet als s. Alleen noemen waar het helpt.
- Nederland in het Spaans: *los Países Bajos* (officieel), *Holanda* (gangbaar in Spanje), *neerlandés/neerlandesa* en *holandés/holandesa*, *Ámsterdam*, *La Haya* (Den Haag), *Róterdam*, *Utrecht*, *la policía neerlandesa*, *la comisaría* (politiebureau), *la bicicleta*, *el carril bici*, *la tarjeta de transporte*.

## 7. Uitlegtaal per niveau: van Nederlands naar steeds meer Spaans

`instructionLang` in `meta.json` bepaalt de opdrachtregels («Kies het juiste antwoord» / «Elige la respuesta correcta»). Hou je uitleg daarbij in de pas:

| Niveau | `instructionLang` | Kaarten, `hint` en `explain` |
|---|---|---|
| 1 tot 3 | `nl` | Volledig Nederlands; Spaans alleen in voorbeelden. |
| 4 tot 6 | `mix` | Nederlands. Grammatica- en lesbegrippen tweetalig (*presente = tegenwoordige tijd*). Kaarttitels mogen een Spaanse titel + Nederlandse uitleg zijn. |
| 7 tot 9 | `es` | Elke uitlegkaart begint met 1 of 2 heel eenvoudige Spaanse zinnen die de kern zeggen (met stof die de leerder kent), daarna de Nederlandse uitleg. |
| 10 tot 13 | `es` | Uitlegkaarten: eerst korte Spaanse uitleg (B1-woorden uit eerdere niveaus), op een nieuwe regel `🇳🇱` + Nederlandse samenvatting. `hint`/`explain`: Spaans, met Nederlands tussen haakjes erachter. |

De prompts van oefeningen mogen vanaf niveau 4 steeds vaker Spaans zijn (met `nl` als vertaling), bv. «Completa con el verbo correcto».

## 8. Politie-inhoud

De gebruiker is agent in Nederland. De Spaanse zinnen moeten bruikbaar zijn in echte contacten met toeristen, expats en anderstaligen.

- Realistisch en beknopt: korte, duidelijke zinnen zoals een agent die gebruikt. Beleefd en professioneel (*usted*). Geen grappen met slachtoffers of verdachten.
- Procedures zijn **Nederlands**: aangifte doen (*poner una denuncia*), proces-verbaal (*el acta / el atestado* mag, noem het «proces-verbaal» in de Nederlandse uitleg), identiteitscontrole, verkeerscontrole, aanhouding (*detener, queda detenido*), cautie (*tiene derecho a guardar silencio*, *a no declarar*, *a un abogado*, *a un intérprete*), bekeuring (*multa*). Verzin geen wettelijke details. Blijf bij algemene, juiste beweringen. Bij twijfel: laat de juridische precisie weg of formuleer algemeen. Voeg waar passend een `tip` met `tone: "police"` toe: «Dit is oefenmateriaal en geen officiële vertaling; gebruik bij officiële procedures een beëdigd tolk.»
- Geen expliciet geweld of ander schokkends. Wel realistische noodsituaties (ongeluk, brand, vermist kind, ruzie, diefstal, bewusteloos), met rustige, bruikbare zinnen.
- Neem per niveau (vanaf 3) minstens **4 oefeningen of gespreksbeurten** op waarin de leerder een **vraag van een Spaanstalige aan een agent** begrijpt (bv. *¿Dónde está la comisaría? ¿Puedo aparcar aquí? ¿Dónde puedo poner una denuncia? ¿Me puede ayudar? He perdido mi pasaporte. ¿Por qué me para? ¿Cuánto es la multa?*) en daar een passend antwoord op geeft.
- Persoonsgegevens in voorbeelden zijn verzonnen en onschuldig (gewone namen, geen echte personen, geen echte nummers).
- Gebruik de tag `"politie"` voor alle politiegesprekken.

## 9. Kwaliteitschecklist (loop deze af voor je klaar bent)

- [ ] 10 lessen in de juiste volgorde (3 learn, 3 practice, 3 dialogue, 1 test), aantallen volgens §3.
- [ ] `node scripts/validate-content.mjs ...` en `tsx scripts/check-answers.ts ...` geven geen fouten.
- [ ] Elke Spaanse zin gecontroleerd: spelling, accenten, vervoeging, geslacht en getal, Spaans uit Spanje.
- [ ] Alleen stof uit dit en eerdere niveaus (zie CURRICULUM); nieuwe woorden eerst in de kaarten.
- [ ] Elke getypte oefening heeft alle redelijke goede antwoorden; typische fouten hebben `wrong`.
- [ ] Elke Spaanse zin in een opgave heeft een Nederlandse vertaling (`nl` of `optionsNl`).
- [ ] Goede antwoorden zijn verdeeld over de opties; afleiders zijn plausibel.
- [ ] Gesprekken hebben een doel en een natuurlijk einde, en de manier van antwoorden past bij het niveau (zie CURRICULUM).
- [ ] Gebruik van uitlegtaal volgens §7.
- [ ] Per niveau ≥ 4 «vraag van een Spaanstalige aan een agent» (vanaf niveau 3) en voldoende herhaling van eerdere niveaus.
