const test = __non_webpack_require__('/lib/xp/testing')

test.mock('/lib/xp/content', {
    get: function () {
        return {
            "_id": "8e0e5b10-c316-41a1-ac8a-d6745aecbb97",
            "_name": "fodselsrate",
            "_path": "/ssb/befolkning/faktasider/fakta-om-befolkningen/komponenter/fodselsrate",
            "creator": "user:adfs:s-1-5-21-2125401682-1754076223-1620198925-35251",
            "modifier": "user:adfs:s-1-5-21-2125401682-1754076223-1620198925-35251",
            "createdTime": "2020-02-20T11:54:42.044Z",
            "modifiedTime": "2020-02-21T09:44:17.492Z",
            "owner": "user:adfs:s-1-5-21-2125401682-1754076223-1620198925-35251",
            "type": "mimir:keyFigure",
            "displayName": "Barn per kvinne",
            "hasChildren": true,
            "language": "nb",
            "valid": true,
            "childOrder": "modifiedtime DESC",
            "data": {
                "default": "0301",
                "size": "small",
                "denomination": "barn per kvinne",
                "dataquery": "33b0aeac-7b94-4d6b-9dbd-da3845be0e5f",
                "greenBox": true
            },
            "x": {
                "com-enonic-app-metafields": {
                    "meta-data": {
                        "blockRobots": false
                    }
                }
            },
            "page": {},
            "attachments": {},
            "publish": {
                "from": "2020-02-20T11:55:10.478Z",
                "first": "2020-02-20T11:55:10.478Z"
            }
        }
    }
})

const utils = __non_webpack_require__( '/lib/ssb/utils')
const {
    get: getKeyFigures,
    parseKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')


exports.testKeyFigure = function () {

    test.assertEquals
}