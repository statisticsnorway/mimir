import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Employee } from '../../content-types/employee/employee'
import { DefaultPageConfig } from '../../pages/default/default-page-config'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getContent, pageUrl, imageUrl, attachmentUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')

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
  const projectIds: Employee['projects'] = page.data.projects
  const projects: Array<Project> = projectIds && projectIds.length > 0 ? parseProject(projectIds) : []
  const profileImageIds: Array<string> = page.data.profileImages ? forceArray(page.data.profileImages) : []

  const profileImages: Array<string> | void[] = profileImageIds ? profileImageIds.map((image: string) => {
    return imageUrl({
      id: image,
      scale: 'max(850)'
    })
  }) : []

  const areaContent: Content<DefaultPageConfig> | null = page.data.area ? get({
    key: page.data.area
  }) : null

  const area: Area| null = areaContent ? {
    title: areaContent.displayName,
    href: areaContent._path
  } : null

  const cvInformation: CVinformation = page.attachments[Object.keys(page.attachments)[0]]

  const cvAttachment: string | null = page.data.myCV ? attachmentUrl({
    id: page._id ? page._id : '',
    name: page.data.myCV,
    download: true
  }) : null

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

  const projectsPhrase: string = localize({
    key: 'employee.projects',
    locale: language
  })

  const downloadPdfPhrase: string = localize({
    key: 'employee.downloadPDF',
    locale: language
  })

  const publicationsPhrase: string = localize({
    key: 'employee.publications',
    locale: language
  })

  const pressPicturesPhrase: string = localize({
    key: 'employee.pressPictures',
    locale: language
  })

  const pressPicturesDescrPhrase: string = localize({
    key: 'employee.pressPicturesDescr',
    locale: language
  })

  const imagePhrase: string = localize({
    key: 'employee.image',
    locale: language
  })

  const props: EmployeeProp = {
    title: page.displayName,
    email: page.data.email || '',
    position: page.data.position || '',
    phone: page.data.phone || '',
    description: page.data.description || '',
    profileImages: profileImages,
    myCV: cvAttachment,
    projects,
    area,
    isResearcher: page.data.isResearcher,
    cristinId: page.data.cristinId || null,
    cvInformation,
    emailPhrase,
    phonePhrase,
    positionPhrase,
    researchAreaPhrase,
    departmentPhrase,
    briefSummaryPhrase,
    projectsPhrase,
    downloadPdfPhrase,
    publicationsPhrase,
    pressPicturesPhrase,
    pressPicturesDescrPhrase,
    imagePhrase
  }

  return React4xp.render('site/parts/employee/employee', props, req)
}

function parseProject(projects: Employee['projects']): Array<Project> {
  const projectsIds: Array<string> = projects ? forceArray(projects) : []
  return projectsIds.map((projectId) => {
    const relatedProjectContent: Content<DefaultPageConfig, object, SEO> | null = projectId ? get({
      key: projectId
    }) : null
    let seoDescription: string | undefined
    if (relatedProjectContent && hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], relatedProjectContent)) {
      seoDescription = relatedProjectContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
    }

    return {
      title: relatedProjectContent ? relatedProjectContent.displayName : '',
      href: pageUrl({
        id: projectId
      }),
      description: seoDescription ? seoDescription : ''
    }
  })
}

interface EmployeeProp {
  title: string,
  email: string,
  position: string,
  phone: string,
  description: string,
  profileImages: Array<string> | void[],
  myCV: string | null,
  projects: Array<Project>,
  area: Area | null,
  isResearcher: boolean
  cristinId: string | null,
  cvInformation: CVinformation,
  emailPhrase: string,
  phonePhrase: string,
  positionPhrase: string,
  researchAreaPhrase: string,
  departmentPhrase: string,
  briefSummaryPhrase: string,
  projectsPhrase: string,
  downloadPdfPhrase: string,
  publicationsPhrase: string,
  pressPicturesPhrase: string,
  pressPicturesDescrPhrase: string,
  imagePhrase: string,
}

interface Project {
    href: string;
    title: string;
    description: string;
  }

interface SEO {
  seoDescription?: string;
}

interface Area {
  href: string;
  title: string;
}

interface CVinformation {
  name: string;
  size: number;
  mimeType: string;
}
