import { Request, Response } from 'enonic-types/controller'
import { Content } from 'enonic-types/content'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  groupBy
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')


exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: Request): React4xpResponse {
  /* collect data */
  const content: Content = getContent()

  const emloyeeRaw: Array<EmployeeRaw> = [
    {
      'first_name': 'Katarzyna',
      'surname': 'Segiet',
      'url': 'https://api.cristin.no/v2/persons/1041309',
      'cristin_person_id': '1041309'
    },
    {
      'first_name': 'Roger',
      'surname': 'Hammersland',
      'url': 'https://api.cristin.no/v2/persons/575095',
      'cristin_person_id': '575095'
    },
    {
      'first_name': 'Trond Christian',
      'surname': 'Vigtel',
      'url': 'https://api.cristin.no/v2/persons/525848',
      'cristin_person_id': '525848'
    },
    {
      'first_name': 'Trude',
      'surname': 'Gunnes',
      'url': 'https://api.cristin.no/v2/persons/34716',
      'cristin_person_id': '34716'
    },
    {
      'first_name': 'Dag',
      'surname': 'Kolsrud',
      'url': 'https://api.cristin.no/v2/persons/1113658',
      'cristin_person_id': '1113658'
    },
    {
      'first_name': 'Thor Andreas',
      'surname': 'Aursland',
      'url': 'https://api.cristin.no/v2/persons/530268',
      'cristin_person_id': '530268'
    },
    {
      'first_name': 'Øyvind',
      'surname': 'Langsrud',
      'url': 'https://api.cristin.no/v2/persons/401856',
      'cristin_person_id': '401856'
    },
    {
      'first_name': 'Hanne Marit',
      'surname': 'Dalen',
      'url': 'https://api.cristin.no/v2/persons/4090',
      'cristin_person_id': '4090'
    },
    {
      'first_name': 'Birger',
      'surname': 'Strøm',
      'url': 'https://api.cristin.no/v2/persons/1107155',
      'cristin_person_id': '1107155'
    },
    {
      'first_name': 'Erling',
      'surname': 'Holmøy',
      'url': 'https://api.cristin.no/v2/persons/1113654',
      'cristin_person_id': '1113654'
    },
    {
      'first_name': 'Geir Haakon Malterud',
      'surname': 'Bjertnæs',
      'url': 'https://api.cristin.no/v2/persons/1113408',
      'cristin_person_id': '1113408'
    },
    {
      'first_name': 'Marius Alexander',
      'surname': 'Ring',
      'url': 'https://api.cristin.no/v2/persons/395579',
      'cristin_person_id': '395579'
    },
    {
      'first_name': 'Bodil Merethe',
      'surname': 'Larsen',
      'url': 'https://api.cristin.no/v2/persons/1113701',
      'cristin_person_id': '1113701'
    },
    {
      'first_name': 'Finn Roar',
      'surname': 'Aune',
      'url': 'https://api.cristin.no/v2/persons/1108047',
      'cristin_person_id': '1108047'
    },
    {
      'first_name': 'Dennis Finn',
      'surname': 'Fredriksen',
      'url': 'https://api.cristin.no/v2/persons/1108055',
      'cristin_person_id': '1108055'
    },
    {
      'first_name': 'Nils Martin',
      'surname': 'Stølen',
      'url': 'https://api.cristin.no/v2/persons/1107163',
      'cristin_person_id': '1107163'
    },
    {
      'first_name': 'Simon Søbstad',
      'surname': 'Bensnes',
      'url': 'https://api.cristin.no/v2/persons/554337',
      'cristin_person_id': '554337'
    },
    {
      'first_name': 'Martin',
      'surname': 'Andresen',
      'url': 'https://api.cristin.no/v2/persons/475295',
      'cristin_person_id': '475295'
    },
    {
      'first_name': 'Trine Engh',
      'surname': 'Vattø',
      'url': 'https://api.cristin.no/v2/persons/595260',
      'cristin_person_id': '595260'
    },
    {
      'first_name': 'Bjart',
      'surname': 'Holtsmark',
      'url': 'https://api.cristin.no/v2/persons/784932',
      'cristin_person_id': '784932'
    },
    {
      'first_name': 'Audun',
      'surname': 'Langørgen',
      'url': 'https://api.cristin.no/v2/persons/1106428',
      'cristin_person_id': '1106428'
    },
    {
      'first_name': 'Elin',
      'surname': 'Halvorsen',
      'url': 'https://api.cristin.no/v2/persons/434435',
      'cristin_person_id': '434435'
    },
    {
      'first_name': 'Rosanna Nancy Isabelle',
      'surname': 'Johed',
      'url': 'https://api.cristin.no/v2/persons/871973',
      'cristin_person_id': '871973'
    },
    {
      'first_name': 'Nina Eirin',
      'surname': 'Drange',
      'url': 'https://api.cristin.no/v2/persons/6512',
      'cristin_person_id': '6512'
    },
    {
      'first_name': 'Julia',
      'surname': 'Zhulanova',
      'url': 'https://api.cristin.no/v2/persons/627204',
      'cristin_person_id': '627204'
    },
    {
      'first_name': 'Erik',
      'surname': 'Fjærli',
      'url': 'https://api.cristin.no/v2/persons/1111460',
      'cristin_person_id': '1111460'
    },
    {
      'first_name': 'John K.',
      'surname': 'Dagsvik',
      'url': 'https://api.cristin.no/v2/persons/559190',
      'cristin_person_id': '559190'
    },
    {
      'first_name': 'Stefan',
      'surname': 'Leknes',
      'url': 'https://api.cristin.no/v2/persons/30194',
      'cristin_person_id': '30194'
    },
    {
      'first_name': 'Sturla Andreas Kise',
      'surname': 'Løkken',
      'url': 'https://api.cristin.no/v2/persons/608694',
      'cristin_person_id': '608694'
    },
    {
      'first_name': 'Lasse Sigbjørn',
      'surname': 'Stambøl',
      'url': 'https://api.cristin.no/v2/persons/1107152',
      'cristin_person_id': '1107152'
    },
    {
      'first_name': 'Tom',
      'surname': 'Kornstad',
      'url': 'https://api.cristin.no/v2/persons/399939',
      'cristin_person_id': '399939'
    },
    {
      'first_name': 'Marina',
      'surname': 'Rybalka',
      'url': 'https://api.cristin.no/v2/persons/5648',
      'cristin_person_id': '5648'
    },
    {
      'first_name': 'Mads',
      'surname': 'Greaker',
      'url': 'https://api.cristin.no/v2/persons/329',
      'cristin_person_id': '329'
    },
    {
      'first_name': 'Odd Erik',
      'surname': 'Nygård',
      'url': 'https://api.cristin.no/v2/persons/11983',
      'cristin_person_id': '11983'
    },
    {
      'first_name': 'Thor Olav',
      'surname': 'Thoresen',
      'url': 'https://api.cristin.no/v2/persons/486020',
      'cristin_person_id': '486020'
    },
    {
      'first_name': 'Ingrid Marie Schaumburg',
      'surname': 'Huitfeldt',
      'url': 'https://api.cristin.no/v2/persons/452015',
      'cristin_person_id': '452015'
    },
    {
      'first_name': 'Kevin Raj',
      'surname': 'Kaushal',
      'url': 'https://api.cristin.no/v2/persons/623458',
      'cristin_person_id': '623458'
    },
    {
      'first_name': 'Herman',
      'surname': 'Kruse',
      'url': 'https://api.cristin.no/v2/persons/505232',
      'cristin_person_id': '505232'
    },
    {
      'first_name': 'Hidemichi',
      'surname': 'Yonezawa',
      'url': 'https://api.cristin.no/v2/persons/1109450',
      'cristin_person_id': '1109450'
    },
    {
      'first_name': 'Taran',
      'surname': 'Fæhn',
      'url': 'https://api.cristin.no/v2/persons/837662',
      'cristin_person_id': '837662'
    },
    {
      'first_name': 'Lars Johannessen',
      'surname': 'Kirkebøen',
      'url': 'https://api.cristin.no/v2/persons/6375',
      'cristin_person_id': '6375'
    },
    {
      'first_name': 'Brita',
      'surname': 'Bye',
      'url': 'https://api.cristin.no/v2/persons/1108054',
      'cristin_person_id': '1108054'
    },
    {
      'first_name': 'Astrid',
      'surname': 'Mathiassen',
      'url': 'https://api.cristin.no/v2/persons/1111462',
      'cristin_person_id': '1111462'
    },
    {
      'first_name': 'Michael J.',
      'surname': 'Thomas',
      'url': 'https://api.cristin.no/v2/persons/1164262',
      'cristin_person_id': '1164262'
    },
    {
      'first_name': 'Inga',
      'surname': 'Heiland',
      'url': 'https://api.cristin.no/v2/persons/912208',
      'cristin_person_id': '912208'
    },
    {
      'first_name': 'Li-Chun',
      'surname': 'Zhang',
      'url': 'https://api.cristin.no/v2/persons/967675',
      'cristin_person_id': '967675'
    },
    {
      'first_name': 'Eilev S',
      'surname': 'Jansen',
      'url': 'https://api.cristin.no/v2/persons/39962',
      'cristin_person_id': '39962'
    },
    {
      'first_name': 'Tom',
      'surname': 'Wennemo',
      'url': 'https://api.cristin.no/v2/persons/1107172',
      'cristin_person_id': '1107172'
    },
    {
      'first_name': 'Astri',
      'surname': 'Syse',
      'url': 'https://api.cristin.no/v2/persons/15884',
      'cristin_person_id': '15884'
    },
    {
      'first_name': 'Magnar',
      'surname': 'Lillegård',
      'url': 'https://api.cristin.no/v2/persons/41675',
      'cristin_person_id': '41675'
    },
    {
      'first_name': 'Rolf',
      'surname': 'Aaberge',
      'url': 'https://api.cristin.no/v2/persons/440635',
      'cristin_person_id': '440635'
    },
    {
      'first_name': 'Ola Lotherington',
      'surname': 'Vestad',
      'url': 'https://api.cristin.no/v2/persons/12491',
      'cristin_person_id': '12491'
    },
    {
      'first_name': 'Erlend Eide',
      'surname': 'Bø',
      'url': 'https://api.cristin.no/v2/persons/10406',
      'cristin_person_id': '10406'
    },
    {
      'first_name': 'Thomas',
      'surname': 'von Brasch',
      'url': 'https://api.cristin.no/v2/persons/10375',
      'cristin_person_id': '10375'
    },
    {
      'first_name': 'Terje',
      'surname': 'Skjerpen',
      'url': 'https://api.cristin.no/v2/persons/595257',
      'cristin_person_id': '595257'
    },
    {
      'first_name': 'Håvard',
      'surname': 'Hungnes',
      'url': 'https://api.cristin.no/v2/persons/597701',
      'cristin_person_id': '597701'
    },
    {
      'first_name': 'Jørgen',
      'surname': 'Modalsli',
      'url': 'https://api.cristin.no/v2/persons/17497',
      'cristin_person_id': '17497'
    },
    {
      'first_name': 'Kenneth Aarskaug',
      'surname': 'Wiik',
      'url': 'https://api.cristin.no/v2/persons/10851',
      'cristin_person_id': '10851'
    },
    {
      'first_name': 'Kim Massey',
      'surname': 'Heide',
      'url': 'https://api.cristin.no/v2/persons/14466',
      'cristin_person_id': '14466'
    },
    {
      'first_name': 'Line',
      'surname': 'Breivik',
      'url': 'https://api.cristin.no/v2/persons/1102972',
      'cristin_person_id': '1102972'
    },
    {
      'first_name': 'Elsa',
      'surname': 'Granvoll',
      'url': 'https://api.cristin.no/v2/persons/1100856',
      'cristin_person_id': '1100856'
    },
    {
      'first_name': 'Svetlana',
      'surname': 'Badina',
      'url': 'https://api.cristin.no/v2/persons/1179360',
      'cristin_person_id': '1179360'
    },
    {
      'first_name': 'Toth',
      'surname': 'Borbala',
      'url': 'https://api.cristin.no/v2/persons/1111463',
      'cristin_person_id': '1111463'
    },
    {
      'first_name': 'Mona Irene',
      'surname': 'Hansen',
      'url': 'https://api.cristin.no/v2/persons/1124859',
      'cristin_person_id': '1124859'
    },
    {
      'first_name': 'Magnus',
      'surname': 'Hallan',
      'url': 'https://api.cristin.no/v2/persons/1103380',
      'cristin_person_id': '1103380'
    },
    {
      'first_name': 'Edda Torsdatter',
      'surname': 'Solbakken',
      'url': 'https://api.cristin.no/v2/persons/557847',
      'cristin_person_id': '557847'
    },
    {
      'first_name': 'Dinh Quang',
      'surname': 'Pham',
      'url': 'https://api.cristin.no/v2/persons/1114515',
      'cristin_person_id': '1114515'
    },
    {
      'first_name': 'Xeni Kristine',
      'surname': 'Dimakos',
      'url': 'https://api.cristin.no/v2/persons/60482',
      'cristin_person_id': '60482'
    },
    {
      'first_name': 'Anders',
      'surname': 'Holmberg',
      'url': 'https://api.cristin.no/v2/persons/948424',
      'cristin_person_id': '948424'
    },
    {
      'first_name': 'Anders Skøien',
      'surname': 'Barstad',
      'url': 'https://api.cristin.no/v2/persons/1108052',
      'cristin_person_id': '1108052'
    },
    {
      'first_name': 'Runa',
      'surname': 'Nesbakken',
      'url': 'https://api.cristin.no/v2/persons/1113702',
      'cristin_person_id': '1113702'
    },
    {
      'first_name': 'Minja Tea',
      'surname': 'Dzamarija',
      'url': 'https://api.cristin.no/v2/persons/1268358',
      'cristin_person_id': '1268358'
    },
    {
      'first_name': 'Magnus Andreas Haare',
      'surname': 'Gulbrandsen',
      'url': 'https://api.cristin.no/v2/persons/395453',
      'cristin_person_id': '395453'
    },
    {
      'first_name': 'Lasse',
      'surname': 'Eika',
      'url': 'https://api.cristin.no/v2/persons/3177',
      'cristin_person_id': '3177'
    },
    {
      'first_name': 'Leif',
      'surname': 'Andreassen',
      'url': 'https://api.cristin.no/v2/persons/1108040',
      'cristin_person_id': '1108040'
    },
    {
      'first_name': 'Arvid',
      'surname': 'Raknerud',
      'url': 'https://api.cristin.no/v2/persons/1107150',
      'cristin_person_id': '1107150'
    },
    {
      'first_name': 'Diana-Cristina',
      'surname': 'Iancu',
      'url': 'https://api.cristin.no/v2/persons/1181826',
      'cristin_person_id': '1181826'
    },
    {
      'first_name': 'Melike Oguz',
      'surname': 'Alper',
      'url': 'https://api.cristin.no/v2/persons/1111456',
      'cristin_person_id': '1111456'
    },
    {
      'first_name': 'Frode',
      'surname': 'Berglund',
      'url': 'https://api.cristin.no/v2/persons/15512',
      'cristin_person_id': '15512'
    },
    {
      'first_name': 'Gang',
      'surname': 'Liu',
      'url': 'https://api.cristin.no/v2/persons/1111461',
      'cristin_person_id': '1111461'
    },
    {
      'first_name': 'Helge',
      'surname': 'Brunborg',
      'url': 'https://api.cristin.no/v2/persons/1111458',
      'cristin_person_id': '1111458'
    },
    {
      'first_name': 'Zhiyang',
      'surname': 'Jia',
      'url': 'https://api.cristin.no/v2/persons/23407',
      'cristin_person_id': '23407'
    },
    {
      'first_name': 'Håkon',
      'surname': 'Tretvoll',
      'url': 'https://api.cristin.no/v2/persons/521933',
      'cristin_person_id': '521933'
    },
    {
      'first_name': 'Manudeep Singh',
      'surname': 'Bhuller',
      'url': 'https://api.cristin.no/v2/persons/13253',
      'cristin_person_id': '13253'
    },
    {
      'first_name': 'Hege Marie',
      'surname': 'Gjefsen',
      'url': 'https://api.cristin.no/v2/persons/608707',
      'cristin_person_id': '608707'
    },
    {
      'first_name': 'Bjorn',
      'surname': 'Dapi',
      'url': 'https://api.cristin.no/v2/persons/909',
      'cristin_person_id': '909'
    },
    {
      'first_name': 'Katrine Vellesen',
      'surname': 'Løken',
      'url': 'https://api.cristin.no/v2/persons/47725',
      'cristin_person_id': '47725'
    },
    {
      'first_name': 'Anders',
      'surname': 'Kjelsrud',
      'url': 'https://api.cristin.no/v2/persons/335060',
      'cristin_person_id': '335060'
    },
    {
      'first_name': 'Magne',
      'surname': 'Mogstad',
      'url': 'https://api.cristin.no/v2/persons/12645',
      'cristin_person_id': '12645'
    },
    {
      'first_name': 'Linda',
      'surname': 'Nøstbakken',
      'url': 'https://api.cristin.no/v2/persons/387689',
      'cristin_person_id': '387689'
    },
    {
      'first_name': 'Rannveig Kaldager',
      'surname': 'Hart',
      'url': 'https://api.cristin.no/v2/persons/2164',
      'cristin_person_id': '2164'
    },
    {
      'first_name': 'Bente',
      'surname': 'Halvorsen',
      'url': 'https://api.cristin.no/v2/persons/317474',
      'cristin_person_id': '317474'
    },
    {
      'first_name': 'Marte',
      'surname': 'Rønning',
      'url': 'https://api.cristin.no/v2/persons/35957',
      'cristin_person_id': '35957'
    },
    {
      'first_name': 'Andreas',
      'surname': 'Fagereng',
      'url': 'https://api.cristin.no/v2/persons/15866',
      'cristin_person_id': '15866'
    },
    {
      'first_name': 'Gisle James',
      'surname': 'Natvik',
      'url': 'https://api.cristin.no/v2/persons/16539',
      'cristin_person_id': '16539'
    },
    {
      'first_name': 'Janna',
      'surname': 'Bergsvik',
      'url': 'https://api.cristin.no/v2/persons/506156',
      'cristin_person_id': '506156'
    },
    {
      'first_name': 'Kristine',
      'surname': 'Grimsrud',
      'url': 'https://api.cristin.no/v2/persons/515091',
      'cristin_person_id': '515091'
    },
    {
      'first_name': 'Cathrine',
      'surname': 'Hagem',
      'url': 'https://api.cristin.no/v2/persons/23669',
      'cristin_person_id': '23669'
    },
    {
      'first_name': 'Martin Blomhoff',
      'surname': 'Holm',
      'url': 'https://api.cristin.no/v2/persons/2518',
      'cristin_person_id': '2518'
    },
    {
      'first_name': 'Lars',
      'surname': 'Lindholt',
      'url': 'https://api.cristin.no/v2/persons/1107121',
      'cristin_person_id': '1107121'
    }
  ]

  const employees: Array<Employee> = emloyeeRaw.map((e: EmployeeRaw) => {
    return {
      id: e.cristin_person_id,
      firstName: e.first_name,
      surName: e.surname,
      url: e.url

    }
  })

  const employeesSorted: Array<Employee> = employees.sort((a, b) => {
    return a.surName.localeCompare(b.surName)
  })

  const groupEmployees: GroupedBy<Employee> = groupEmployeeByLastName(employeesSorted)

  const employeesGroupedByLetter: Array<EmployeeGroup> = Object.keys(groupEmployees).map((letter) => {
    return {
      letter: letter,
      employees: forceArray(groupEmployees[letter])
    }
  })

  /* prepare props */
  const props: ReactProps = {
    title: content.displayName,
    employees: employees,
    groupedEmployees: employeesGroupedByLetter
  }

  return React4xp.render('site/parts/researchEmployeeList/researchEmployeeList', props, req)
}


interface ReactProps {
    title: string;
    employees: Array<Employee>;
    groupedEmployees: Array<EmployeeGroup>;
}

interface EmployeeRaw {
  'first_name': string;
  surname: string;
  url: string;
  'cristin_person_id': string;

}
interface Employee {
  id: string;
  firstName: string;
  surName: string;
  url: string;
}

interface EmployeeGroup {
  letter: string;
  employees: Array<Employee>;
}

interface GroupedBy<T> {
  [key: string]: Array<T> | T;
}

const groupEmployeeByLastName: (employees: Array<Employee>) => GroupedBy<Employee> = groupBy(
  (employee: Employee): string => {
    return employee.surName.charAt(0)
  }
)

