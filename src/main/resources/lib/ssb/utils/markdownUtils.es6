const nodeLib = __non_webpack_require__('/lib/xp/node')
const MARKDOWN_REPO = 'no.ssb.pubmd'
const MARKDOWN_BRANCH = 'master'
const {
    getNode
} = __non_webpack_require__('/lib/ssb/repo/common')

export const connectMarkdownRepo = function() {
    return nodeLib.connect({
        repoId: MARKDOWN_REPO,
        branch: MARKDOWN_BRANCH,
        principals: ['role:system.admin']
    })
}

export function getMarkdownRepo() {
    return connectMarkdownRepo().findChildren({
        parentKey: '/'
    })
}

export function getMarkdownNode(id) {
    return getNode(MARKDOWN_REPO, MARKDOWN_BRANCH, id)
}