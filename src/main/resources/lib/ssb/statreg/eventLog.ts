import { RepoNode } from '/lib/xp/node'

export enum StatRegFetchStatus {
    INIT = 'Init',
    IN_PROGRESS = 'In Progress',
    COMPLETE_SUCCESS = 'Success',
    COMPLETE_ERROR = 'Error'
}

export interface StatRegFetchInfo {
    status: StatRegFetchStatus;
    result?: object;
    message?: string;
    startTime?: string;
    completionTime?: string;
}

export interface StatRegFetchJobNode extends RepoNode {
    data: StatRegFetchInfo;
}

export interface StatRegLatestFetchInfo {
    latestEvent: string;
    latestEventInfo: StatRegFetchInfo;
}

export interface StatRegLatestFetchInfoNode extends RepoNode {
    data: StatRegLatestFetchInfo;
}

export interface StatRegEventLog {
    StatRegFetchStatus: typeof StatRegFetchStatus;
}
