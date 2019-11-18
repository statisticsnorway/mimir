import { forceArray } from '/lib/util/data'
import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { getMunicipality } from '/lib/klass'
import { get as getKeyFigure } from '/lib/mimir/key-figure'
import { parseGlossaryContent } from '/lib/mimir/glossary'
import { parseMunicipalityValues } from '/lib/municipals'

const view = resolve('./key-figure.html')

exports.get = function(req) {
  const municipality = getMunicipality(req)
  const part = getComponent();
  const keyFigureIds = part ? part.config.figure : req.config['key-figure']

  if (keyFigureIds) {
    const keyFigures = forceArray(keyFigureIds).reduce((accumulator, key) => {
      return key ? accumulator.concat(getKeyFigure({key})) : accumulator
    }, [])

    const parsedKeyFigureData = keyFigures.map((keyFigure) => {
      const dataSet = keyFigure.data.dataquery ? parseMunicipalityValues(keyFigure.data.dataquery, municipality): {}
      const glossaryId = keyFigure.data.glossary ? keyFigure.data.glossary : undefined
      return {
        displayName: keyFigure.displayName,
        ...keyFigure.data,
       ...dataSet,
        glossaryId
       }
    });

    const glossary = keyFigures.filter( (keyfigure) => keyfigure.data.glossary).map( (keyFigure) => parseGlossaryContent({key: keyFigure.data.glossary}) )

    const model = {
      title: part ? part.config.title : undefined,
      source: part ? part.config.source : undefined,
      data: parsedKeyFigureData,
      glossary
    }

    return {
      body: render(view, model),
      contentType: 'text/html'
    }
  }
  else {
    return {
      body: ''
    }
  }
}

