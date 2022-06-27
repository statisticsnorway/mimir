import React from 'react'
import PropTypes from 'prop-types'
import { Card, Text } from '@statisticsnorway/ssb-component-library'

const MenuBox = (props) => {
  return (
    <section className="xp-part menu-box container">
      <div className="menu-boxes">
        {
          props.boxes.map((box, index) => {
            return (
              <Card
                className={`${box.subtitle && box.titleSize ? `preambleText title-size-${box.titleSize}` : ''}`}
                key={ `box_${index}` }
                title={ box.title }
                href={ box.href }
                icon={ box.icon ? <img src={box.icon.src} alt={box.icon.alt ? box.icon.alt : ' '}></img> : undefined }
                profiled >
                { box.subtitle ? <Text>{ box.subtitle }</Text> : undefined }
              </Card>
            )
          })
        }
      </div>
    </section>
  )
}

MenuBox.propTypes = {
  boxes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      icon: PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string
      }),
      href: PropTypes.string.isRequired,
      titleSize: PropTypes.string
    }))
}

export default (props) => <MenuBox {...props} />
