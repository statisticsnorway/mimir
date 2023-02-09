import React from 'react'
import PropTypes from 'prop-types'
import { Text, Button } from '@statisticsnorway/ssb-component-library'

function MailmojoFormKostra(props) {
  return (
    <section className='xp-part mailmojo-form-kostra'>
      <Text>{props.ingress}</Text>
      <form method='post' action='https://ssb.mailmojo.no/32219/s'>
        <div className='ssb-input mt-4'>
          <label htmlFor='mm-name'>{props.nameLabel}</label>
          <div className='input-wrapper'>
            <input type='text' id='mm-name' name='name' />
          </div>
        </div>
        <div className='ssb-input my-4'>
          <label htmlFor='mm-email'>{props.emailLabel}</label>
          <div className='input-wrapper'>
            <input type='email' id='mm-email' name='email' />
          </div>
        </div>
        <Button type='submit' name='submit' primary>
          {props.buttonTitle}
        </Button>
      </form>
    </section>
  )
}

MailmojoFormKostra.propTypes = {
  ingress: PropTypes.string,
  nameLabel: PropTypes.string,
  emailLabel: PropTypes.string,
  buttonTitle: PropTypes.string,
}

export default (props) => <MailmojoFormKostra {...props} />
