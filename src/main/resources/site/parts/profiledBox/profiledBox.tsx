import React from 'react'
import { Card, Paragraph } from '@statisticsnorway/ssb-component-library'
import { ProfiledBoxProps } from '../../../lib/types/partTypes/profiledBox'

const ProfiledBox = (props: ProfiledBoxProps) => {
  const { imgUrl, imageAltText, imagePlacement, href, subTitle, title, titleSize, preambleText, ariaLabel } = props
  return (
    <Card
      href={href}
      imagePlacement={imagePlacement}
      subTitle={subTitle}
      title={title}
      linkType='header'
      image={<img src={imgUrl} alt={imageAltText} loading='lazy' />}
      ariaLabel={ariaLabel}
    >
      <Paragraph className={`preambleText${titleSize ? ` title-size-${titleSize}` : ''}`} aria-hidden='true'>
        {preambleText}
      </Paragraph>
    </Card>
  )
}

export default (props: ProfiledBoxProps) => <ProfiledBox {...props} />
