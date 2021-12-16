# PublishJob lib-sheduler


## Tasks
For å publisere tall kl 08:00 bruker vi 3 tasks, disse er:
- dailyPublishJob(Kjøres hver dag kl 07:50)
- publishDataset (en task pr datakilde, kjøres kun 1 gang)
- cleanupPublishDataset (en task pr datakilde, kjøres kun 1 gang)

### Task dailyPublishJob
Denne tasken ligger her: resources/task/publishJob

- Denne jobben starter 07.50
- Det opprettes først en jobLog i repo under Data toolbox/Data tree/no.ssb.eventlog/master/root/jobs
- Sjekker alle statistikker og om de har en nextRelease idag, fra nå og en time frem i tid.
- For hver statisikk som har publisering idag:
  - Henter en liste over alle datakilder statistikken har i Draft, det filtreres bort datakilder som har blitt lagt til av andre statistikker
  - Legger til informasjon i jobLoggen med alle datakilder og status STARTED eller SKIPPED(No unpublished dataset to publish).
- For hver datakilde som skal oppdateres opprettes en ny Task ***publishDataset*** med startdato publishTime for statistikken(statreg), 
informasjon som sendes med til tasken er disse:
  - jobId
  - statisticsContentId
  - statisticsId
  - publicationItem: Liste med dataset og dataSource
  - datasetIndex: Denne brukes for å hindre at flere datakilder oppdaterer jobLog samtidig

### Task publishDataset
Denne tasken ligger her: resources/task/publishDataset

- For hver datakilde kjøres ***createOrUpdateDataset*** som ligger her: /lib/ssb/repo/dataset
  - Det legges på en sleep på 1000 millisekunder mellom hver datakilde
  - ***clearDatasetCache*** blir kjørt etter hver ***createOrUpdateDataset***
- For hver datakilde opprettes en ny task ***cleanupPublishDataset***
  - Startidspunktet for denne blir satt ved å bruke datasetIndex som multipliseres med 1000 millisekund, 
  dette for å unngå at jobLog ikke blir satt til COMPLETED hvis flere datakilder oppdaterer den samtidig



### Task cleanupPublishDataset
Denne tasken ligger her: resources/task/cleanupPublishDataset

- For hver datakilde:
  - Logger til eventLog og setter status DATASET_PUBLISHED ?? fylle ut mer
  - Sletter data i draft
  - Oppdaterer jobLog med status pr datakilde, statisikk og for hele loggen.
  - Kjører clearCache hvis Status er COMPLETED

## Venter med å vise statistikksiden til nye tall er publisert
For å unngå at vi viser gamle tall etter klokka 08:00 mens jobben med å publisere går er det lagd funksjonalitet
for å vente med å laste statistikksiden til tallene er publisert.
- I parten statistics.es6 kjøres ***currentlyWaitingForPublish(page)*** , denne funksjonen ligger her: /lib/ssb/dataset/publish
- I funksjonen currentlyWaitingForPublish sjekkes jobLog av typen Publish statistics, og som har status STARTED som er opprettet den siste halvtimen.
  - Så sjekkes EnonicEvent for om det er noen task som ligger der med denne statistikk id, og som ikke er ferdig publisert.
  - Hvis den finner noen events kjøres en sleep på 100 millisekund, dette gjenstaes til enten tallene er ute eller den når maxWait på 
  10000 millisekund, da vil den skrive en feilmelding i loggen. Og siden blir lastet inn med tallene som lå der fra før. 
  !! sjekke litt mer om dette stemmer