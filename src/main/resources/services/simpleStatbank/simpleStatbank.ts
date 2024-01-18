import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Dataset, type Data, type Dimension, Category } from '/lib/types/jsonstat-toolkit'
import { forceArray } from '/lib/ssb/utils/arrayUtils'

export const get = (req: XP.Request): XP.Response => {
  //const { code, table } = req.params
  const dimensionCode: string = req.params.dimensionCode ? req.params.dimensionCode : ''

  //TODO call function to fetchStatbankApiData
  const mockQueryResult: JSONstat = {
    dataset: {
      status: {
        '24': ':',
        '25': ':',
        '67': ':',
        '68': ':',
        '69': ':',
        '72': ':',
        '75': ':',
        '78': ':',
        '81': '.',
        '84': ':',
        '98': ':',
        '99': ':',
      },
      dimension: {
        MaaleMetode: {
          label: 'statistikkmål',
          category: {
            index: {
              '02': 0,
            },
            label: {
              '02': 'Gjennomsnitt',
            },
          },
          extension: {
            show: 'value',
          },
        },
        Yrke: {
          label: 'yrke',
          category: {
            index: {
              '0000': 0,
              '0110': 1,
              '3214': 2,
              '3230': 3,
              '3240': 4,
              '3251': 5,
              '3254': 6,
              '3256': 7,
              '3257': 8,
              '3258': 9,
              '3259': 10,
              '3311': 11,
              '3422': 12,
              '3423': 13,
              '3431': 14,
              '4227': 15,
              '4229': 16,
              '4311': 17,
              '4312': 18,
              '4313': 19,
              '4321': 20,
              '4322': 21,
              '4323': 22,
              '4411': 23,
              '4412': 24,
              '4413': 25,
              '4415': 26,
              '4416': 27,
              '5111': 28,
              '5112': 29,
              '5113': 30,
              '5120': 31,
              '5131': 32,
              '5132': 33,
              '5242': 34,
              '5243': 35,
              '5244': 36,
              '5245': 37,
              '5246': 38,
              '5249': 39,
              '5311': 40,
              '5312': 41,
              '5321': 42,
              '5322': 43,
              '5329': 44,
              '5411': 45,
              '5413': 46,
              '5414': 47,
              '5419': 48,
              '6111': 49,
              '7124': 50,
              '7125': 51,
              '7126': 52,
              '7127': 53,
              '7131': 54,
              '7132': 55,
              '7133': 56,
              '7211': 57,
              '7212': 58,
              '7213': 59,
              '7214': 60,
              '7215': 61,
              '7413': 62,
              '7421': 63,
              '7422': 64,
              '7511': 65,
              '7512': 66,
              '7513': 67,
              '7514': 68,
              '7515': 69,
              '7522': 70,
              '7531': 71,
              '7532': 72,
              '7534': 73,
              '7535': 74,
              '7536': 75,
              '7541': 76,
              '7542': 77,
              '7543': 78,
              '7544': 79,
              '8183': 80,
              '8189': 81,
              '8211': 82,
              '8212': 83,
              '8219': 84,
              '8311': 85,
              '8312': 86,
              '8322': 87,
              '8331': 88,
              '8332': 89,
              '8341': 90,
              '8342': 91,
              '8343': 92,
              '8344': 93,
              '8350': 94,
              '9111': 95,
              '9112': 96,
              '9122': 97,
              '9123': 98,
              '9129': 99,
              '9629': 100,
            },
            label: {
              '0000': 'Uoppgitt / yrker som ikke kan identifiseres',
              '0110': 'Offiserer fra fenrik og høyere grad',
              '3214': 'Protese- og tannteknikere',
              '3230': 'Yrker innen alternativ medisin',
              '3240': 'Dyrepleiere',
              '3251': 'Tannpleiere',
              '3254': 'Optikere',
              '3256': 'Helsesekretærer',
              '3257': 'Helse- og miljøkontrollører',
              '3258': 'Ambulansepersonell',
              '3259': 'Andre helseyrker',
              '3311': 'Finansmeglere',
              '3422': 'Trenere og idrettsdommere',
              '3423': 'Sports- og aktivitetsinstruktører',
              '3431': 'Fotografer og filmfotografer',
              '4227': 'Intervjuere',
              '4229': 'Andre opplysningsmedarbeidere',
              '4311': 'Regnskapsmedarbeidere',
              '4312': 'Forsikrings- og finansmedarbeidere',
              '4313': 'Lønningsmedarbeidere',
              '4321': 'Lagermedarbeidere og material-forvaltere',
              '4322': 'Logistikkmedarbeidere',
              '4323': 'Transportfunksjonærer',
              '4411': 'Bibliotekassistenter',
              '4412': 'Postbud og postsorterere',
              '4413': 'Kodere mv.',
              '4415': 'Arkivassistenter',
              '4416': 'Personalkontormedarbeidere',
              '5111': 'Flyverter, båtverter mv.',
              '5112': 'Konduktører',
              '5113': 'Reiseledere og guider',
              '5120': 'Kokker',
              '5131': 'Servitører',
              '5132': 'Bartendere',
              '5242': 'Demonstrasjonsselgere',
              '5243': 'Dørselgere',
              '5244': 'Telefon- og nettselgere',
              '5245': 'Servicemedarbeidere (bensinstasjon)',
              '5246': 'Gatekjøkken- og kafémedarbeidere mv.',
              '5249': 'Andre salgsmedarbeidere',
              '5311': 'Barnehage- og skolefritidsassistenter mv.',
              '5312': 'Skoleassistenter',
              '5321': 'Helsefagarbeidere',
              '5322': 'Hjemmehjelper',
              '5329': 'Andre pleiemedarbeidere',
              '5411': 'Brannkonstabler',
              '5413': 'Fengselsbetjenter',
              '5414': 'Vektere',
              '5419': 'Andre sikkerhetsarbeidere',
              '6111': 'Korn- og grønnsaksprodusenter',
              '7124': 'Isolatører mv.',
              '7125': 'Glassarbeidere',
              '7126': 'Rørleggere og VVS-montører',
              '7127': 'Kuldemontører mv.',
              '7131': 'Malere og byggtapetserere',
              '7132': 'Overflatebehandlere og lakkerere',
              '7133': 'Feiere, fasaderenholdere mv.',
              '7211': 'Støpere',
              '7212': 'Sveisere',
              '7213': 'Kopper- og blikkenslagere',
              '7214': 'Platearbeidere',
              '7215': 'Riggere og spleisere',
              '7413': 'Energimontører',
              '7421': 'Serviceelektronikere',
              '7422': 'Tele- og IKT-installatører',
              '7511': 'Slaktere, fiskehandlere mv.',
              '7512': 'Bakere, konditorer mv.',
              '7513': 'Ystere mv. (gårdsproduksjon)',
              '7514': 'Saftere, syltere mv. (gårdsproduksjon)',
              '7515': 'Prøvesmakere og kvalitetsbedømmere av mat og drikke',
              '7522': 'Møbelsnekkere',
              '7531': 'Skreddere, buntmakere mv.',
              '7532': 'Gradører',
              '7534': 'Møbeltapetserere mv.',
              '7535': 'Skinnberedere og garvere',
              '7536': 'Skomakere',
              '7541': 'Yrkesdykkere',
              '7542': 'Skytebaser og sprengningsarbeidere',
              '7543': 'Produkttestere (ikke matprodukter)',
              '7544': 'Desinfeksjonsarbeidere og skadedyrbekjempere',
              '8183': 'Pakke-, tappe- og etikettmaskinoperatører',
              '8189': 'Andre stasjonære maskinoperatører',
              '8211': 'Montører av mekaniske produkter',
              '8212': 'Montører av elektriske og elektroniske produkter',
              '8219': 'Andre montører',
              '8311': 'Lokomotiv og T-baneførere',
              '8312': 'Skiftekonduktører mv',
              '8322': 'Bil-, drosje- og varebilførere',
              '8331': 'Bussjåfører og trikkeførere',
              '8332': 'Lastebil- og trailersjåfører',
              '8341': 'Jordbruks- og skogbruksmaskinførere',
              '8342': 'Anleggsmaskinførere',
              '8343': 'Kran- og heisførere mv.',
              '8344': 'Truckførere',
              '8350': 'Dekks- og maskinmannskap (skip)',
              '9111': 'Renholdere i private hjem',
              '9112': 'Renholdere i virksomheter',
              '9122': 'Bilvaskere',
              '9123': 'Vinduspussere',
              '9129': 'Andre rengjørere',
              '9629': 'Andre hjelpearbeidere',
            },
          },
          link: {
            describedby: [
              {
                extension: {
                  Yrke: 'urn:ssb:classification:klass:7',
                },
              },
            ],
          },
          extension: {
            show: 'code_value',
          },
        },
        ContentsCode: {
          label: 'statistikkvariabel',
          category: {
            index: {
              Manedslonn: 0,
            },
            label: {
              Manedslonn: 'Månedslønn (kr)',
            },
            unit: {
              Manedslonn: {
                base: 'kr',
                decimals: 0,
              },
            },
          },
          link: {
            describedby: [
              {
                extension: {
                  Manedslonn: 'urn:ssb:conceptvariable:vardok:187',
                },
              },
            ],
          },
          extension: {
            show: 'value',
          },
        },
        Tid: {
          label: 'år',
          category: {
            index: {
              '2022': 0,
            },
            label: {
              '2022': '2022',
            },
          },
          extension: {
            show: 'code',
          },
        },
        id: ['MaaleMetode', 'Yrke', 'ContentsCode', 'Tid'],
        size: [1, 101, 1, 1],
        role: {
          metric: ['ContentsCode'],
          time: ['Tid'],
        },
      },
      label: '11418: Yrkesfordelt månedslønn, etter statistikkmål, yrke, statistikkvariabel og år',
      source: 'Statistisk sentralbyrå',
      updated: '2023-02-02T07:00:00Z',
      value: [
        45630,
        77960,
        49930,
        47860,
        36730,
        45260,
        51270,
        39540,
        63880,
        50100,
        46000,
        107820,
        43970,
        37460,
        49700,
        30160,
        42730,
        50300,
        49050,
        50430,
        43360,
        49740,
        47370,
        41090,
        null,
        null,
        45590,
        51850,
        38820,
        57010,
        37100,
        37990,
        32890,
        33360,
        44930,
        46990,
        41710,
        36840,
        31020,
        40370,
        35050,
        34350,
        43950,
        38480,
        40560,
        53060,
        45620,
        38950,
        37080,
        35690,
        42540,
        41890,
        45630,
        48870,
        40840,
        41760,
        41910,
        42380,
        43620,
        42930,
        41740,
        49100,
        46850,
        46750,
        38890,
        40200,
        38470,
        null,
        null,
        null,
        40090,
        39880,
        null,
        41940,
        42570,
        null,
        51590,
        59660,
        null,
        41930,
        42410,
        null,
        43210,
        43920,
        null,
        63330,
        56830,
        37520,
        40980,
        41880,
        40660,
        45350,
        48400,
        42370,
        47070,
        35600,
        36360,
        36090,
        null,
        null,
        33750,
      ],
    },
  }

  const dataset: Dataset | null = mockQueryResult ? JSONstat(mockQueryResult).Dataset('dataset') : null
  const filterDimension: Dimension | null = dataset?.Dimension(dimensionCode) as Dimension | null
  const dataDimension: Array<string> = filterDimension?.id as Array<string>
  const dataValues: Array<Number> = []

  dataDimension.forEach(function (dimension) {
    const data: Data | null = dataset?.Data({
      [dimensionCode]: dimension,
    }) as Data
    const verdi: Data['value'] = data?.value
    dataValues.push(Number(verdi))
  })

  const categories: Category | Array<Category> | null =
    filterDimension && !(filterDimension instanceof Array) ? filterDimension.Category() : null

  const labels = categories
    ? forceArray(categories).map((category) => {
        return {
          index: category.index,
          label: category.label,
        }
      })
    : []

  const result = {
    values: dataValues,
    dropdownLabels: labels,
  }

  return {
    status: 200,
    contentType: 'application/json',
    body: result,
  }
}
