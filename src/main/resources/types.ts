/* eslint-disable */
type EnonicLibraryMap = import('enonic-types/libs').EnonicLibraryMap;
interface LibMap extends EnonicLibraryMap {
    // external libs
    '/lib/util': import('./lib/types/util').UtilLibrary;

    // cache
    '/lib/ssb/cache/cache': import('./lib/ssb/cache/cache').SSBCacheLibrary;
    '/lib/ssb/cache/subjectCache': import('./lib/ssb/cache/subjectCache').SSBSubjectCacheLibrary;
    '/lib/ssb/cache/partCache': import('./lib/ssb/cache/partCache').SSBPartCacheLibrary;

    // cron
    '/lib/ssb/cron/cron': import('./lib/ssb/cron/cron').SSBCronLib;
    '/lib/ssb/cron/eventLog': import('./lib/ssb/cron/eventLog').EventLogLib;
    '/lib/ssb/cron/rss': import('./lib/ssb/cron/rss').DatasetRSSLib;
    '/lib/ssb/cron/task': import('./lib/ssb/cron/task').SSBTaskLib;
    '/lib/ssb/cron/pushRss': import('./lib/ssb/cron/pushRss').PushRSSLib;

    // dashboard
    '/lib/ssb/dashboard/dashboard': import('./lib/ssb/dashboard/dashboard').DashboardDatasetLib;
    '/lib/ssb/dashboard/statistic': import('./lib/ssb/dashboard/statistic').StatisticLib;
    '/lib/ssb/dashboard/dashboardUtils': import('./lib/ssb/dashboard/dashboardUtils').DashboardUtilsLib;
    '/lib/ssb/dashboard/statreg': import('./lib/ssb/dashboard/statreg').SSBStatRegLib;
    '/lib/ssb/dashboard/statreg/common': import('./lib/ssb/dashboard/statreg/common').StatRegCommonLib;
    '/lib/ssb/dashboard/statreg/config': import('./lib/ssb/dashboard/statreg/config').StatRegConfigLib;
    '/lib/ssb/dashboard/statreg/repoUtils': import('./lib/ssb/dashboard/statreg/repoUtils').StatRegRepoUtilsLib;

    // dataset
    '/lib/ssb/dataset/dataset': import('./lib/ssb/dataset/dataset').DatasetLib;
    '/lib/ssb/dataset/calculator': import('./lib/ssb/dataset/calculator').CalculatorLib;
    '/lib/ssb/dataset/listeners': import('./lib/ssb/dataset/listeners').DatasetListenersLib;
    '/lib/ssb/dataset/mockUnpublished': import('./lib/ssb/dataset/mockUnpublished').MockUnpublishedLib;
    '/lib/ssb/dataset/publish': import('./lib/ssb/dataset/publish').PublishDatasetLib;
    // dataset - klass
    '/lib/ssb/dataset/klass/counties': import('./lib/ssb/dataset/klass/counties').CountiesLib;
    '/lib/ssb/dataset/klass/klass': import('./lib/ssb/dataset/klass/klass').KlassLib;
    '/lib/ssb/dataset/klass/municipalities': import('./lib/ssb/dataset/klass/municipalities').MunicipalitiesLib;
    // dataset - statbankApi
    '/lib/ssb/dataset/statbankApi/statbankApi': import('./lib/ssb/dataset/statbankApi/statbankApi').StatbankApiLib;
    // dataset - statbankSaved
    '/lib/ssb/dataset/statbankSaved/statbankSaved': import('./lib/ssb/dataset/statbankSaved/statbankSaved').StatbankSavedLib;
    '/lib/ssb/dataset/statbankSaved/statbankSavedRequest': import('./lib/ssb/dataset/statbankSaved/statbankSavedRequest').StatbankSavedRequestLib;
    // dataset - tbprocessor
    '/lib/ssb/dataset/tbprocessor/tbmlMock': import('./lib/ssb/dataset/tbprocessor/tbmlMock').TbmlMockLib;
    '/lib/ssb/dataset/tbprocessor/tbml': import('./lib/ssb/dataset/tbprocessor/tbml').TbmlLib;
    '/lib/ssb/dataset/tbprocessor/tbprocessor': import('./lib/ssb/dataset/tbprocessor/tbprocessor').TbprocessorLib;

    // error
    '/lib/ssb/error/error': import('./lib/ssb/error/error').ErrorLib;

    // parts
    '/lib/ssb/parts/footer': import('./lib/ssb/parts/footer').FooterLib;
    '/lib/ssb/parts/header': import('./lib/ssb/parts/header').HeaderLib;
    '/lib/ssb/parts/keyFigure': import('./lib/ssb/parts/keyFigure').KeyFigureLib;
    '/lib/ssb/parts/menu': import('./lib/ssb/parts/menu').MenuLib;
    '/lib/ssb/parts/permissions': import('./lib/ssb/parts/permissions').PermissionsLib;
    '/lib/ssb/parts/table': import('./lib/ssb/parts/table').TableLib;
    '/lib/ssb/parts/publicationArchive': import('./lib/ssb/parts/publicationArchive').PublicationArchiveLib;
    // parts - highcharts
    '/lib/ssb/parts/highcharts/highchartsData': import('./lib/ssb/parts/highcharts/highchartsData').HighchartsDataLib;
    '/lib/ssb/parts/highcharts/highchartsGraphConfig': import('./lib/ssb/parts/highcharts/highchartsGraphConfig').HighchartsGraphConfigLib;
    '/lib/ssb/parts/highcharts/highchartsUtils': import('./lib/ssb/parts/highcharts/highchartsUtils').HighchartsUtilsLib;
    '/lib/ssb/parts/highcharts/data/htmlTable': import('./lib/ssb/parts/highcharts/data/htmlTable').HighchartsHtmlTableLib;
    '/lib/ssb/parts/highcharts/data/tbProcessor': import('./lib/ssb/parts/highcharts/data/tbProcessor').HighchartsTbProcessorLib;

    // repo
    '/lib/ssb/repo/common': import('./lib/ssb/repo/common').RepoCommonLib;
    '/lib/ssb/repo/dataset': import('./lib/ssb/repo/dataset').RepoDatasetLib;
    '/lib/ssb/repo/eventLog': import('./lib/ssb/repo/eventLog').RepoEventLogLib;
    '/lib/ssb/repo/job': import('./lib/ssb/repo/job').RepoJobLib;
    '/lib/ssb/repo/query': import('./lib/ssb/repo/query').RepoQueryLib;
    '/lib/ssb/repo/repo': import('./lib/ssb/repo/repo').RepoLib;
    '/lib/ssb/repo/statreg': import('./lib/ssb/repo/statreg').StatRegRepoLib;

    // statreg
    '/lib/ssb/statreg/contacts': import('./lib/ssb/statreg/contacts').StatRegContactsLib;
    '/lib/ssb/statreg/publications': import('./lib/ssb/statreg/publications').StatRegPublicationsLib;
    '/lib/ssb/statreg/statistics': import('./lib/ssb/statreg/statistics').StatRegStatisticsLib;

    // utils
    '/lib/ssb/utils/alertUtils': import('./lib/ssb/utils/alertUtils').AlertUtilsLib;
    '/lib/ssb/utils/arrayUtils': import('./lib/ssb/utils/arrayUtils').ArrayUtilsLib;
    '/lib/ssb/utils/breadcrumbsUtils': import('./lib/ssb/utils/breadcrumbsUtils').BreadcrumbsUtilsLib;
    '/lib/ssb/utils/dateUtils': typeof import('./lib/ssb/utils/dateUtils');
    '/lib/ssb/utils/imageUtils': import('./lib/ssb/utils/imageUtils').ImageUtilsLib;
    '/lib/ssb/utils/parentUtils': import('./lib/ssb/utils/parentUtils').ParentUtilsLib;
    '/lib/ssb/utils/serverLog': import('./lib/ssb/utils/serverLog').ServerLogLib;
    '/lib/ssb/utils/variantUtils': import('./lib/ssb/utils/variantUtils').VariantUtilsLib;
    '/lib/ssb/utils/subjectUtils': import('./lib/ssb/utils/subjectUtils').SubjectUtilsLib;
    '/lib/ssb/utils/solrUtils': import('./lib/ssb/utils/solrUtils').SolrUtilsLib;
    '/lib/ssb/utils/textUtils': import('./lib/ssb/utils/textUtils').TextUtilsLib;
    '/lib/ssb/utils/articleUtils': import('./lib/ssb/utils/articleUtils').ArticleUtilsLib;
    '/lib/ssb/utils/utils': import('./lib/ssb/utils/utils').UtilsLib;
    '/lib/ssb/utils/calculatorUtils': import('./lib/ssb/utils/calculatorUtils').CalculatorUtilsLib;
	'/lib/ssb/utils/nameSearchUtils': typeof import('./lib/ssb/utils/nameSearchUtils');

    // vendor
    '/lib/vendor/ramda': typeof import('./lib/vendor/ramda');
}

declare const __non_webpack_require__: <K extends keyof LibMap | string = string>(path: K) => K extends keyof LibMap
    ? LibMap[K]
    : any;

declare const resolve: (path: string) => any

declare const app: {
    name: string;
    version: string;
    config?: {
        [key: string]: string | object | any;
    };
}

declare const log: {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warning: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

declare const __: {
    newBean: (bean: string) => any;
    toNativeObject: (beanResult: any) => any;
}

interface BaseMedia<Media extends object = BaseMediaConfig> {
    media: Media;
    caption?: string;
    artist?: string | Array<string>;
    copyright?: string;
    tags?: string | Array<string>;
}
interface BaseMediaConfig {
    attachment: string;
}
interface MediaImage extends BaseMedia<ImageConfig> {
    altText?: string;
}
interface ImageConfig {
    attachment: string;
    focalPoint: {
        x: number;
        y: number;
    };
    zoomPosition: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    cropPosition: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        zoom: number;
    };
}
interface MediaImageXData {
    media: {
        imageInfo: {
            imageHeight: number;
            imageWidth: number;
            contentType: string;
            colorSpace: string;
            pixelSize: number;
            byteSize: number;
            description: string;
            fileSource: string;
        };
        cameraInfo: {
            make: string;
            model: string;
            lens: string;
            iso: string;
            focalLength: string;
            focalLength35: string;
            exposureBias: string;
            aperture: string;
            shutterTime: string;
            flash: string;
            autoFlashCompensation: string;
            whiteBalance: string;
            exposureProgram: string;
            shootingMode: string;
            meteringMode: string;
            exposureMode: string;
            focusDistance: string;
            orientation: string;
        };
    };
}

declare namespace XP {
    type Request = import('@item-enonic-types/global/controller').Request;
    type Response<ResponseBody = unknown> = import("@item-enonic-types/global/controller").Response<ResponseBody>;
    type PageContributions = import("@item-enonic-types/global/controller").Response['pageContributions'];
    type MacroContext = import("@item-enonic-types/global/controller").MacroContext;
}