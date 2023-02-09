import React from 'react'
import PropTypes from 'prop-types'
import { Text, Button } from '@statisticsnorway/ssb-component-library'

function MailmojoForm(props) {
  return (
    <section className='xp-part mailmojo-form'>
      <Text>{props.ingress}</Text>
      <form method='post' action={props.mailMojoFormUrl}>
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

MailmojoForm.propTypes = {
  mailMojoFormUrl: PropTypes.string,
  ingress: PropTypes.string,
  nameLabel: PropTypes.string,
  emailLabel: PropTypes.string,
  buttonTitle: PropTypes.string,
}

export default (props) => <MailmojoForm {...props} />
