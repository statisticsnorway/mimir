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

    private _marks: Array<Mark> = [];
    private _measures: Measures = {};

    constructor(name: string) {
      this._name = name
      this._metricStart = Date.now()
      this._measures['metricsStart'] = this._metricStart
      log.info(`Measurement ${this._name} Initializting ...`)
    }

    now() {
      return Date.now()
    }

    findMark(key: string): MarkType {
      if (!key) {
        return undefined
      }
      return find((mark: Mark) => mark.key === key)(this._marks)
    }

    mark(key: string) {
      const exists: MarkType = this.findMark(key)
      if (exists) {
        throw new Error(`A mark with key '${key}' already exists in measurement '${this._name}'`)
      } else {
        this._marks.push({
          key,
          at: Date.now()
        })
      }
    }

    measure(label: string, from: string, to: string) {
      const start: MarkType = this.findMark(from)
      const startTime: number = start ? start.at : this._metricStart

      const end: MarkType = this.findMark(to)
      const endTime: number = end ? end.at : Date.now()

      this._measures[label] = endTime - startTime
    }

    getMeasurements() {
      const {
        metricsStart, ...rest
      } = this._measures

      return rest
    }

    clearMarks() {
      this._marks = []
    }

    clearMeasures() {
      this._measures = {}
    }
}

export function createMeasurement(name: string): Measurement {
  return new Measurement(name)
}
