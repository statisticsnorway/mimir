import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Article } from '../../content-types/article/article'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')
const {
  render
} = __non_webpack_require__('/lib/markdown')


const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: Request): React4xpResponse {
  const page: Content<Article> = getContent()
  const language: string = page.language ? (page.language === 'en' ? 'en-gb' : page.language) : 'nb'
  const phrases: object = getPhrases(page)

  const bodyText: string | undefined = page.data.articleText ? processHtml({
    value: page.data.articleText.replace(/&nbsp;/g, ' ')
  }) : undefined

  const exampleText: string = `# Sykefraværet øker igjen

  **Sykefraværet i 2. kvartal 2021 var på 6,3 prosent, viser sesongjusterte tall. Etter to kvartaler med nedgang, øker sykefraværet med 7,3 prosent fra 1. kvartal 2021. Sykefraværet er nå nesten tilbake til samme nivå som ved starten av pandemien i 1. kvartal 2020.**
  
  Justert for sesongvariasjoner, var egen- og legemeldt sykefravær^[Sykefraværsprosent måles som antall sykefraværsdagsverk i prosent av avtalte dagsverk] på henholdsvis 0,9 og 5,4 prosent, viser [sykefraværstatistikken](https://www.ssb.no/arbeid-og-lonn/statistikker/sykefratot). Økningen i fraværet kom hovedsakelig fra egenmeldt sykefravær, som gikk opp med 28,3 prosent, mens legemeldt økte med 4,3 prosent. Disse tallene er kun justert for sesongvariasjoner, og ikke for omfanget av influensa- eller koronadiagnoser.
  
  Som tidligere omtalt har det vært store bevegelser i de sesongjusterte tallene for sykefravær etter at koronaen traff Norge. Figur 1 viser hvordan sesongjustering og influensa- og koronajustering påvirker tallene. Les om hvordan koronakrisen blir håndtert i sykefraværstatistikken lenger ned i artikkelen.
  
  Figur 1
  <br>
  <br>
  <details>
    <summary>Ny metode for beregning av arbeidstid</summary>
  Sykefraværsstatistikken har fra og med frigivingen 3. juni 2021 tatt i bruk en ny metode for beregning av arbeidstid. Denne endringer medfører først og fremst at vi justerer avtalt arbeidstid/stillingsprosent for jobber der vi mangler eller har mangelfull informasjon om den avtalte arbeidstiden som er innrapportert av arbeidsgivere gjennom a-ordningen. En mer detaljert beskrivelse av metodikken er beskrevet i artikkelen det lenkes til over. For sykefraværsstatistikken medfører dette en endring i sykefraværsprosenten gjennom sykefraværsdagsverkene (telleren i sykefraværsprosenten) og de avtalte dagsverkene (nevneren), som begge justeres for stillingsprosent.
  
  I sykefraværsstatistikken benyttes stillingsprosent i beregningen av avtalte dagsverk og i beregningen av legemeldte sykefraværsdagsverk. Antallet egenmeldte sykefraværsdagsverk påvirkes i liten grad ettersom disse dagsverkene estimeres med antall ansatte som forklaringsvariabel, men egenmeldt sykefraværsprosent påvirkes av endringer i nevneren (avtalte dagsverk).
  </details>
  
  ## Hvordan går det med IA-målsettingen?
  
  En viktig målsetning i IA-avtalen^[IA-avtalen er en intensjonsavtale om et mer inkluderende arbeidsliv mellom regjeringen og hovedorganisasjonene i arbeidslivet.] er å redusere det sesong- og influensajusterte sykefraværet i perioden 2019-2022 med 10 prosent fra årsgjennomsnittet i 2018, det vil si fra 5,7 prosent til 5,1 prosent. Da fraværet dette kvartalet er på 5,9 prosent, gir det imidlertid en økning på 3,3 prosent, sammenlignet med årsgjennomsnittet for 2018.
  <br>
  <br>
  <details>
    <summary>Håndteringen av koronakrisen i sykefraværsstatistikken</summary>
  Koronakrisen påvirker sykefraværsstatistikken på flere måter som er viktig å ta hensyn til når tallene skal tolkes. I de sesongjusterte tallene har vi fulgt Eurostat sine retningslinjer som sier at effekten av koronakrisen ikke skal inngå i grunnlaget for sesongmønsteret. Det innebærer at vi inntil videre antar at sesongmønsteret er uendret, og at vi korrigerer for den systematiske sesongvariasjon beregnet på data før koronakrisen.
  
  For i størst mulig grad å kunne følge den underliggende utviklingen i sykefraværet, har vi i de sesong- og influensajusterte tallene også korrigert for koronadiagnoser. Disse tallene korrigerer derfor for den direkte effekten av legemeldinger med koronadiagnoser. I tolkningen av de sesong-, influensa- og koronajusterte tallene må man ta forbehold om hvordan bruken av ulike diagnoser har blitt praktisert under koronakrisen. Det har vært en stor økning også i andre diagnoser enn influensa/korona, som sannsynligvis henger sammen med koronautbruddet. Dette blir det ikke justert for.
  
  Det finnes ikke diagnoser knyttet til det egenmeldte sykefraværet. I sesong-, influensa- og koronajusteringen av det egenmeldte sykefraværet benyttes derfor legemeldte korona- og influensadiagnoser. I justeringen antas det at andelen influensa- og koronadiagnoser er den samme for egenmeldt som for legemeldt sykefravær, som kanskje ikke treffer så godt i år på grunn av koronaepidemien. De sesong-, influensa- og koronajusterte tallene for det egenmeldte sykefraværet er derfor noe mer usikre enn normalt og kan fange opp litt for mye eller litt for lite egenmeldt sykefravær som følge av korona.
  </details>
  
  ## Sykefravær fordelt på utdanningsnivå
  
  Det er publisert en ny tabell i Statistikkbanken som viser legemeldt sykefravær fordelt på utdanningsnivå, alder og kjønn. Tallene er ikke sesongjusterte, som betyr at man må sammenligne tallene for et kvartal med samme kvartal året før. Figur 2 viser utviklingen i sykefraværet tilbake til 2015 fordelt på de fire utdanningsnivåene:
  
  - Grunnskole
  - Videregående skole
  - Universitets- og høgskoleutdanning 1-4 år
  - Universitets- og høgskoleutdanning over 4 år
  
  Figur 2
  
  Figuren viser at sykefraværet, målt ved sykefraværsprosenten, er høyest blant gruppen med grunnskoleutdanning og nivået reduseres med stigende utdanningsnivå. Gruppen som har grunnskole som høyeste fullførte utdanning hadde et legemeldt sykefravær på 6,4 prosent i 2. kvartal 2021. I motsatt ende av skalaen hadde gruppen med høyest utdanning et legemeldt sykefravær på 3,3 prosent. De to største utdanningsgruppene, videregående skole og universitets- og høgskoleutdanning til og med fire år, utgjorde samlet to tredjedeler av alle lønnstakere dette kvartalet. Disse hadde henholdsvis 5,7 og 5,3 prosent legemeldt sykefravær.
  
  Innenfor alle utdanningsgruppene hadde kvinner høyere sykefravær enn menn, og den prosentvise differansen mellom kjønnene øker ved høyere utdanningsnivå. Det er verdt å merke seg at gruppen med høyest utdanning, spesielt mennene i denne gruppen, hadde lite sykefravær i utgangspunktet. For flere tall i denne statistikken, se statistikkbanktabell [13333: Legemeldt sykefravær, etter statistikkvariabel, utdanningsnivå, kjønn og kvartal](https://www.ssb.no/statbank/table/13333/).`
  
  const combinedBodyTextMarkdown: string | undefined = bodyText ? bodyText.concat(render(exampleText)) : (exampleText ? render(exampleText) : undefined)
  log.info(`Markdown result: ${render(exampleText)}`)

  const pubDate: string = moment(page.publish?.from).locale(language).format('LL')
  const showModifiedDate: Article['showModifiedDate'] = page.data.showModifiedDate
  let modifiedDate: string | undefined = undefined
  if (showModifiedDate) {
    modifiedDate = moment(showModifiedDate.dateOption?.modifiedDate).locale(language).format('LL')
    if (showModifiedDate.dateOption?.showModifiedTime) {
      modifiedDate = moment(page.data.showModifiedDate?.dateOption?.modifiedDate).locale(language).format('LLL')
    }
  }

  const authorConfig: Article['authorItemSet'] = page.data.authorItemSet ? forceArray(page.data.authorItemSet) : []
  const authors: Article['authorItemSet'] | undefined = authorConfig.length ? authorConfig.map(({
    name, email
  }) => {
    return {
      name,
      email
    }
  }) : undefined

  const associatedStatisticsConfig: Article['associatedStatistics'] =
  page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []

  const associatedArticleArchivesConfig: Article['articleArchive'] = page.data.articleArchive ? forceArray(page.data.articleArchive) : []

  const props: ArticleProps = {
    phrases,
    introTitle: page.data.introTitle,
    title: page.displayName,
    ingress: page.data.ingress,
    bodyText: combinedBodyTextMarkdown,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    serialNumber: page.data.serialNumber,
    associatedStatistics: getAssociatedStatisticsLinks(associatedStatisticsConfig),
    associatedArticleArchives: getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig),
    isbn: isEnabled('article-isbn', true) && page.data.isbnNumber,
  }

  return React4xp.render('site/parts/article/article', props, req)
}

function getAssociatedStatisticsLinks(associatedStatisticsConfig: Article['associatedStatistics']): Array<AssociatedLink> | [] {
  if (associatedStatisticsConfig && associatedStatisticsConfig.length) {
    return associatedStatisticsConfig.map((option) => {
      if (option?._selected === 'XP') {
        const associatedStatisticsXP: string | undefined = option.XP?.content
        const associatedStatisticsXPContent: Content | null = associatedStatisticsXP ? get({
          key: associatedStatisticsXP
        }) : null

        if (associatedStatisticsXPContent) {
          return {
            text: associatedStatisticsXPContent.displayName,
            href: associatedStatisticsXP ? pageUrl({
              path: associatedStatisticsXPContent._path
            }) : ''
          }
        }
      } else if (option?._selected === 'CMS') {
        const associatedStatisticsCMS: CMS | undefined = option.CMS

        return {
          text: associatedStatisticsCMS?.title,
          href: associatedStatisticsCMS?.href
        }
      }
      return
    }).filter((statistics) => !!statistics) as Array<AssociatedLink>
  }
  return []
}

function getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig: Article['articleArchive']): Array<AssociatedLink> | [] {
  if (associatedArticleArchivesConfig && associatedArticleArchivesConfig.length) {
    return associatedArticleArchivesConfig.map((articleArchive: string) => {
      const articleArchiveContent: Content | null = articleArchive ? get({
        key: articleArchive
      }) : null

      if (articleArchiveContent) {
        return {
          text: articleArchiveContent.displayName,
          href: articleArchive ? pageUrl({
            path: articleArchiveContent._path
          }) : ''
        }
      }
      return
    }).filter((articleArchive) => !!articleArchive) as Array<AssociatedLink>
  }
  return []
}

interface AssociatedLink {
  text: string | undefined;
  href: string | undefined;
}

interface CMS {
  href?: string | undefined;
  title?: string | undefined;
}

interface ArticleProps {
  phrases: object;
  introTitle: string | undefined;
  title: string;
  ingress: string | undefined;
  bodyText: string | undefined;
  showPubDate: boolean;
  pubDate: string | undefined;
  modifiedDate: string | undefined;
  authors: Article['authorItemSet'] | undefined;
  serialNumber: string | undefined;
  associatedStatistics: Array<AssociatedLink> | [];
  associatedArticleArchives: Array<AssociatedLink> | [];
  isbn: string | undefined;
}
