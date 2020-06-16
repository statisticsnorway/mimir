# Saving data from Statistikkregisteret in Content Studio

### Goal
To fetch data from statistikkregisteret and saving it in Content Studio. Uses [MIMIR XP Repo](MimirXPRepo.md).

### Config
- Requires `ssb.statreg.baseUrl` (picked up from mimir-config) - which points to the URL of the statreg API. 
- For dev/utv you can use 
  ```
  ssb.statreg.baseUrl = https://i.utv.ssb.no/statistikkregisteret
  ```

### StatReg Repo
- Uses repo `no.ssb.statreg` in `master` branch.
- Provides:
  - `createStatRegNode(name, content)` to create a new statReg node
  - `getStatRegNode(key)` to retrieve a node identified by `key`
  - `modifyStatRegNode(key, content)` to modify an existing node identified by `key`, with `content`
  - `setupStatRegRepo(nodeConfig)` for quick setup of statReg nodes
    - `nodeConfig` is list of `{ key: <fetcher-function> }` tuples.
    - `fetcherFunction` is called and the result is stored as a content in a node identified by `key`.
  
## Hent data fra StatReg

### Oppgaven består av --

1. **Henting av data fra StatReg API** : HTTP GET

   - hovedsakelig <**`listSomXml`**> endepunkter per nå

   - det er identisk for alle statreg data vi snakker om per i dag

2. **Konvertere XML til JSON** : Bruker nashorn XmlParser

   - forskjellige data typer => betyr behandlinger blir litt annerledes for hver

3. **Lagre JSON i XP** 

   - identisk for all statreg data

### Fil organisering

1. **`/lib/repo/statreg.ts`**
   - Setup **`no.ssb.statreg`** repo
   - Setup **`/contacts`**, **`/statistics`** and **`/publications`** nodes
   - **`/lib/repo/statreg/*`**
     - Støtte funksjoner for å ferge data mellom statleg api og repo noder
2. **`/lib/ssb/statreg/*`**
   - **`fetchStatRegData`** - all-purpose HTTP GET 
   - **Generics** funksjon som fungerer for både kontakter, statistikk og publiseringer
     - `function fetchStatRegData<`**`T, XmlType`**`> = (serviceUrl,`**`extractor`**`) => `**`Array<T>`**
     - `function extractor = (xml: `**`XmlType`**`) => `**`Array<T>`**
   - **types.js** => xml struktur fra API + **`extractor`** funksjoner
     - `<kontakter ...>` => `Array<Contact>`
     - `<statistikk ...>` => `Array<Statistic>`
     - `<publiseringer ...>` => `Array<Publication>`
     - `extractXXX`, `transformXXX` : norsk => engelsk, forenkling av struktur

3. **`/lib/repo/statreg/*`**
   - **`get`** `<Contact|Statistic|Publication>`**`fromRepo`** : utility function for henting av data fra xp-repo-noder. 
   - <u>**??**</u> Ideelt sted for å skrive aggregeringsfunksjoner som f.eks. **`getPublications(statistikk)`**

### Frontend (XP relatert)

1. *Service*: **`/services/contacts`**  
   - bruk **`get<abc>FromRepo` **fra **`/lib/repo/statreg/*`** for å vise dropdown list
   - Statistics blir nesten lik
2. *Custom Selector*: **`/site/content-types/article/article.xml`**
   - koble *Custom Selector* med *Service ovenfor*
3.  *Part*: **`/site/parts/contacts/contact.es6`**
   - bruk **`get<abc>FromRepo` **fra **`/lib/repo/statreg/*`** for å plukke ut valgte kontakter
   - Statistics blir nesten lik

### Tanker Videre

1. **`fetchStatRegData`** er allerede generisk nok og kan gjenbrukes for andre data, ikke bare fra StatReg API
   - tar både aktuelle fetch og extract som input
   - Kan bli flyttet/refactorert til generisk "**fetch-n-extract-fra-api**" - dette kan vi prøve når vi tar opp fetch av **tbml** oppgaven


