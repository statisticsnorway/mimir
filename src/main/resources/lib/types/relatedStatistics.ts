// Used in the Related Statistics mixin
interface SingleStatistic {
    _selected: string;
}

export interface CmsStatistic extends SingleStatistic {
    _selected: 'cms';
    cms: {
        title: string;
        profiledText: string;
        url: string;
    }
}

export interface XpStatistic extends SingleStatistic {
    _selected: 'xp';
    xp: {
        contentId?: string;
    };
}
