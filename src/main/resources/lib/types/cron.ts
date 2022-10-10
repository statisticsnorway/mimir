import { RunContext } from '/lib/xp/context'
import { ContextAttributes } from '*/lib/xp/context'

export interface CronLib {
    schedule: (options: ScheduleParams) => void;
    unschedule: (options: UnscheduleParams) => void;
    get: (options: GetCronParams) => GetCronResult;
    list: () => Array<GetCronResult>;
}

export interface ScheduleParams {
    name: string;
    cron: string;
    fixedDelay?: number;
    delay?: number;
    times: number;
    callback: () => void;
    context: RunContext<ContextAttributes>;
}

export interface UnscheduleParams {
    name: string;
}

export interface GetCronParams {
    name: string;
}

export interface GetCronResult {
    name: string;
    cron: string;
    cronDescription: string;
    fixedDelay: number;
    delay: number;
    applicationKey: string;
    context: RunContext<ContextAttributes>;
    nextExecTime: string;
}
