import React, { useState } from 'react'
import { Tag, NestedAccordion, ExpansionBox, Title } from '@statisticsnorway/ssb-component-library'

import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { type AccordionData, AccordionItems } from '/lib/types/partTypes/accordion'
import { type AboutTheStatisticsProps } from '/lib/types/partTypes/omStatistikken'

function StatisticDescription(props: Readonly<AboutTheStatisticsProps>) {
  const { icon, ingress, label, lastUpdatedPhrase, lastUpdated, accordions } = props
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

  function renderNestedAccordions(category: AccordionData) {
    const items: AccordionItems[] = Array.isArray(category.items) ? category.items : []
    return (
      <div>
        {category.body && (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(category.body.replace(/&nbsp;/g, ' ')),
            }}
          />
        )}
        {items.map((item: AccordionItems) => {
          return (
            <NestedAccordion key={item.title} header={item.title} openByDefault>
              {item.body && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(item.body.replace(/&nbsp;/g, ' ')),
                  }}
                />
              )}
            </NestedAccordion>
          )
        })}
      </div>
    )
  }

  function renderCategory() {
    if (selectedCategory) {
      return (
        <div className='selected-category col-lg-12'>
          <ExpansionBox header={selectedCategory.open} text={renderNestedAccordions(selectedCategory)} sneakPeek />
        </div>
      )
    }
    return null
  }

  return (
    <div className='row'>
      <div className='title-wrapper'>
        <Title size={2}>{label}</Title>
        <div className='icon-wrapper'>
          <img src={icon} alt='' />
        </div>
      </div>
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
            onClick={() => setCategory(accordion.id as string)}
          >
            {accordion.open}
          </Tag>
        ))}
      </div>

      {renderCategory()}
    </div>
  )
}

export default (props: AboutTheStatisticsProps) => <StatisticDescription {...props} />
