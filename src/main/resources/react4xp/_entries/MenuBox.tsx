import React from 'react'
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react'
import { MenuBoxProps } from '/lib/types/partTypes/menuBox'

const MenuBox = ({ boxes, height }: MenuBoxProps) => {
  return (
    <section className='xp-part menu-box container'>
      <div className='menu-boxes'>
        {boxes.map((box, index) => {
          return (
            <Card
              key={`box_${index}`}
              asChild
              className={`${height == 'fixed' && box.titleSize ? `fixed-height title-size-${box.titleSize}` : ''}`}
            >
              <a href={box.href} target='_blank' rel='noopener noreferrer' className='menu-box__card-link'>
                {box.icon && (
                  <Card.Block>
                    <img alt={box.icon.alt ? box.icon.alt : ''} src={box.icon.src} loading='lazy' />
                  </Card.Block>
                )}

                <Card.Block>
                  <Heading>{box.title}</Heading>
                  {box.subtitle && <Paragraph>{box.subtitle}</Paragraph>}
                </Card.Block>
              </a>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default (props: MenuBoxProps) => <MenuBox {...props} />
