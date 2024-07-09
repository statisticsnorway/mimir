import React, { useState } from 'react'
import { Tag, FactBox, NestedAccordion } from '@statisticsnorway/ssb-component-library'

import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import { type AccordionData } from '../../../lib/types/partTypes/accordion'
import { type StatisticDescriptionProps } from '../../../lib/types/partTypes/statisticDescription'

function StatisticDescription(props: StatisticDescriptionProps) {
  const { ingress, label, lastUpdatedPhrase, lastUpdated, accordions } = props
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<AccordionData | undefined>(
    accordions.find((item) => item.id === 'om-statistikken-definisjoner')
  )

  function setCategory(category: string) {
    setSelectedTag(category)
    setSelectedCategory(accordions.find((item) => item.id === category))
  }

  function renderIngress() {
    if (ingress) {
      return <p className='ingress-wrapper searchabletext col-lg-8'>{ingress}</p>
    }
    return null
  }

  function renderNestedAccordions(items: AccordionData['items']) {
    return items!.map((item, i) => (
      <NestedAccordion key={i} header={item.title}>
        {item.body && (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(item.body.replace(/&nbsp;/g, ' ')),
            }}
          />
        )}
      </NestedAccordion>
    ))
  }

  function renderCategory() {
    if (selectedCategory) {
      return (
        <div className='selected-category col-lg-12'>
          <FactBox header={selectedCategory.open} text={renderNestedAccordions(selectedCategory.items)} openByDefault />
        </div>
      )
    }
    return null
  }

  return (
    <div className='row'>
      <h2 className='title-wrapper col-12'>{label}</h2>
      {renderIngress()}
      {lastUpdated && (
        <p>
          <i>{`${lastUpdatedPhrase} ${lastUpdated}.`}</i>
        </p>
      )}
      <div className='om-statistikken-tags'>
        {accordions.map((accordion, index) => (
          <Tag
            className={index === 0 && !selectedTag ? 'active' : undefined}
            key={accordion.id}
            onClick={() => setCategory(accordion.id)}
          >
            {accordion.open}
          </Tag>
        ))}
      </div>

      {renderCategory()}
    </div>
  )
}

export default (props: StatisticDescriptionProps) => <StatisticDescription {...props} />
