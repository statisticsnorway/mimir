const {
    data
} = __non_webpack_require__( '/lib/util')
const {
    getComponent,
    pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
    render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
    renderError
} = __non_webpack_require__('/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./profiledLink.html')

exports.get = function(req) {
    try {
        return renderPart(req)
    } catch (e) {
        return renderError(req, 'Error in part', e)
    }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
    const part = getComponent()
    const config = part.config.profiledLinkItemSet ? data.forceArray(part.config.profiledLinkItemSet) : []

    return config.length ? renderProfiledLinks(config) : {
        body: '',
        contentType: 'text/html'
    }
}

const renderProfiledLinks = (config) => {
    const profiledLinkComponent = new React4xp('Links')
        .setProps({
            links: config.map((link) => {
                return {
                    children: link.text,
                    href: pageUrl({
                        id: link.href
                    }),
                    iconType: 'arrowRight',
                    linkType: 'profiled'
                }
            })
        })
        .uniqueId()

    const body = render(view, {
        profiledLinksId: profiledLinkComponent.react4xpId
    })

    return {
        body: profiledLinkComponent.renderBody({
            body
        }),
        pageContributions: profiledLinkComponent.renderPageContributions()
    }
}
