import { find } from 'ramda'

export class Mark {
    key: string;
    at: number;
}

export type MarkType = Mark | undefined;

export type Measures = {
    [key: string]: number;
};

export class Measurement {
    private readonly _name: string;
    private readonly _metricStart: number;
    private _allowMarkReset: boolean;

    private _marks: Array<Mark> = [];
    private _measures: Measures = {};

    constructor(name: string, allowMarkReset: boolean = true) {
      this._name = name
      this._metricStart = Date.now()
      this._allowMarkReset = allowMarkReset
      this._measures['metricsStart'] = this._metricStart
      log.info(`Measurement ${this._name} Initializting ...`)
    }

    now(): number {
      return Date.now()
    }

    findMark(key: string): MarkType {
      if (!key) {
        return undefined
      }
      return find((mark: Mark) => mark.key === key)(this._marks)
    }

    markExists(key: string): boolean {
      return !!this.findMark(key)
    }

    mark(key: string): void {
      const exists: MarkType = this.findMark(key)
      if (exists && !this._allowMarkReset) {
        throw new Error(`A mark with key '${key}' already exists in measurement '${this._name}'`)
      } else {
        this._marks.push({
          key,
          at: Date.now()
        })
      }
    }

    measure(label: string, from: string, to: string): void {
      const start: MarkType = this.findMark(from)
      const startTime: number = start ? start.at : this._metricStart

      const end: MarkType = this.findMark(to)
      const endTime: number = end ? end.at : Date.now()

      this._measures[label] = endTime - startTime
    }

    getMeasurementAggregate(): number {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        metricsStart, ...rest
      } = this._measures
      return Object.keys(rest)
        .reduce((acc, key) => (acc + this._measures[key]), 0)
    }

    getMeasurements(): { [key: string]: number } {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        metricsStart, ...rest
      } = this._measures

      return rest
    }

    clearMarks(): void {
      this._marks = []
    }

    clearMeasures(): void {
      this._measures = {}
    }
}

export function createMeasurement(name: string): Measurement {
  return new Measurement(name)
}
