import {Link} from './menu';
import {SiteConfig} from '../../site/site-config';
import {PortalLibrary} from 'enonic-types/lib/portal';
import {MenuItem} from '../../site/content-types/menuItem/menuItem';
import {Language} from '../types/language';
const { assetUrl, getSiteConfig, pageUrl }: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const { createMenuTree, parseTopLinks } = __non_webpack_require__( '/lib/ssb/menu')
const { pathFromStringOrContent } = __non_webpack_require__( '/lib/ssb/utils')
const { localize } = __non_webpack_require__( '/lib/xp/i18n')

export function getHeaderContent(language: Language): Header {
    const siteConfig: SiteConfig = getSiteConfig();
    return {
        logoUrl: assetUrl({path: 'SSB_logo.png'}),
        searchResultPageUrl: siteConfig.searchResultPage ?  pathFromStringOrContent(siteConfig.searchResultPage): undefined,
        searchInputPlaceholder: localize({
            key: 'menuSearch',
            locale: language.code
        }),
        mainNavigation: language.menuContentId? createMenuTree(language.menuContentId) : [],
        topLinks: siteConfig.topLinks && siteConfig.topLinks.length > 0 ? parseTopLinks(siteConfig.topLinks): undefined,
        language
    }
}

export interface Header{
    logoUrl: string;
    searchResultPageUrl?: string;
    searchInputPlaceholder: string;
    mainNavigation?: Array<MenuItem>;
    topLinks?: Array<Link>;
    language: Language;
}
