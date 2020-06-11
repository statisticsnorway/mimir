import { RepoNode } from 'enonic-types/lib/node';

export enum StatRegFetchStatus {
    INIT = 'Init',
    IN_PROGRESS = 'In Progress',
    COMPLETE_SUCCESS = 'Success',
    COMPLETE_ERROR = 'Error'
}

export interface StatRegFetchInfo {
    data: {
        status: StatRegFetchStatus;
        result?: object;
        message: string;
        httpStatusCode?: number;
        startTime: string;
        completionTime?: string;
    };
}

export type StatRegFetchJobNode = RepoNode & StatRegFetchInfo
