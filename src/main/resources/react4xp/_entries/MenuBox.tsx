import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'

interface MenuBoxProps {
  boxes?: {
    title?: string;
    subtitle?: string;
    icon?: {
      src: string;
      alt?: string;
    };
    href: string;
    titleSize?: string;
  }[];
  height?: string;
}

const MenuBox = (props: MenuBoxProps) => {
  return (
    <section className='xp-part menu-box container'>
      <div className='menu-boxes'>
        {props.boxes.map((box, index) => {
          return (
            <Card
              className={`${
                props.height == 'fixed' && box.titleSize ? `fixed-height title-size-${box.titleSize}` : ''
              }`}
              key={`box_${index}`}
              title={box.title}
              href={box.href}
              icon={box.icon ? <img src={box.icon.src} alt={box.icon.alt ? box.icon.alt : ''}></img> : undefined}
              profiled
            >
              {box.subtitle ? <Text>{box.subtitle}</Text> : undefined}
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default (props) => <MenuBox {...props} />
