import { RepoNode } from 'enonic-types/lib/node';

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

export type StatRegFetchJobNode = RepoNode & { data: StatRegFetchInfo }

export interface StatRegLatestFetchInfo {
    latestEvent: string;
    latestEventInfo: StatRegFetchInfo;
}

export type StatRegLatestFetchInfoNode = RepoNode & { data: StatRegLatestFetchInfo }
