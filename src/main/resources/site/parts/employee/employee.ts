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
    cristinId: page.data.cristinId || null
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
  cristinId: string | null
}

interface Project {
    href: string;
  }


