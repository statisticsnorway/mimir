import React, { useState } from 'react'
import { ExpansionBox, NestedAccordion, Title } from '@statisticsnorway/ssb-component-library'
import { Chip } from '@digdir/designsystemet-react'

import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { type AccordionData, AccordionItems } from '/lib/types/partTypes/accordion'
import { type AboutTheStatisticsProps } from '/lib/types/partTypes/omStatistikken'

function StatisticDescription(props: Readonly<AboutTheStatisticsProps>) {
  const { label, lastUpdatedPhrase, lastUpdated, accordions } = props
  const [selectedTag, setSelectedTag] = useState<string | undefined>(accordions[0].id)

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

  // Because macros in htmlArea can't be rendered clientside we have to render all accordions and hide those that aren't selected
  function renderCategories(accordions: AccordionData[]) {
    return (
      <>
        {accordions.map((accordion) => (
          <div
            className={accordion.id === selectedTag ? 'selected-category col-lg-12' : 'col-lg-12'}
            aria-live='polite'
            hidden={accordion.id !== selectedTag}
          >
            <ExpansionBox header={accordion.open} text={renderNestedAccordions(accordion)} sneakPeek />
          </div>
        ))}
      </>
    )
  }

  return (
    <div className='content-wrapper'>
      <div className='title-wrapper'>
        <Title size={2}>{label}</Title>
      </div>
      {lastUpdated && (
        <p>
          <i>{`${lastUpdatedPhrase} ${lastUpdated}.`}</i>
        </p>
      )}
      <div className='om-statistikken-tags'>
        {accordions.map((accordion) => (
          <Chip.Radio
            key={accordion.id}
            name='category'
            value={accordion.id}
            checked={selectedTag === accordion.id}
            onChange={(event) => setSelectedTag(event.target.value as string)}
          >
            {accordion.open}
          </Chip.Radio>
        ))}
      </div>

      {renderCategories(accordions)}
    </div>
  )
}

{
  /* <Tag
  className={accordion.id === selectedTag ? 'active' : undefined}
  key={accordion.id}
  onClick={() => setSelectedTag(accordion.id as string)}
>
  {accordion.open}
</Tag> */
}

export default (props: AboutTheStatisticsProps) => <StatisticDescription {...props} />
