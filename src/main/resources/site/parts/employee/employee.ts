import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Employee } from '../../content-types/employee/employee'


const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getContent, pageUrl, imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content<Employee> = getContent()
  const language: string = page.language ? page.language : 'nb'

  const projectIds: Array<string> = page.data.projects ? forceArray(page.data.projects) : []
  const projects: Array<Project> = projectIds.map((project: string) =>{
    return {
      href: pageUrl({
        id: project
      })
    }
  })

  const profileImageIds: Array<string> = page.data.profileImages ? forceArray(page.data.profileImages) : []

  const profileImages: Array<string> | void[] = profileImageIds ? profileImageIds.map((image: string) => {
    return imageUrl({
      id: image,
      scale: 'max(850)'
    })
  }) : []

  const emailPhrase: string = localize({
    key: 'employee.email',
    locale: language
  })

  const phonePhrase: string = localize({
    key: 'employee.phone',
    locale: language
  })

  const positionPhrase: string = localize({
    key: 'employee.position',
    locale: language
  })

  const researchAreaPhrase: string = localize({
    key: 'employee.researchArea',
    locale: language
  })

  const departmentPhrase: string = localize({
    key: 'employee.department',
    locale: language
  })

  const briefSummaryPhrase: string = localize({
    key: 'employee.briefSummary',
    locale: language
  })


  const props: EmployeeProp = {
    title: page.displayName,
    email: page.data.email || '',
    position: page.data.position || '',
    phone: page.data.phone || '',
    description: page.data.description || '',
    profileImages: profileImages, // page.data.profileImages ? forceArray(page.data.profileImages) : [],
    myCV: page.data.myCV || '',
    projects: projects,
    isResearcher: page.data.isResearcher,
    cristinId: page.data.cristinId || null,
    emailPhrase,
    phonePhrase,
    positionPhrase,
    researchAreaPhrase,
    departmentPhrase,
    briefSummaryPhrase

  }

  return React4xp.render('site/parts/employee/employee', props, req)
}

interface EmployeeProp {
  title: string;
  email: string;
  position: string;
  phone: string;
  description: string;
  profileImages: Array<string> | void[] ;
  myCV: string;
  projects: Array<Project>
  isResearcher: boolean
  cristinId: string | null,
  emailPhrase: string,
  phonePhrase: string,
  positionPhrase: string,
  researchAreaPhrase: string,
  departmentPhrase: string,
  briefSummaryPhrase: string
}

interface Project {
    href: string;
  }


