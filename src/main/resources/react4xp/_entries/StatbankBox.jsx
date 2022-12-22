import React from 'react'
import { PropTypes } from 'prop-types'
import { ArrowRight } from 'react-feather'

class StatbankBox extends React.Component {
  render() {
    const { title, href, icon, fullWidth } = this.props

    return (
      <div className='container-fluid p-0'>
        <div className='row'>
          <a className={`statbank-link ${fullWidth ? 'col-lg-12' : 'col-lg-7'}`} href={href} id='statbankLink'>
            <div className='content'>
              <div className='icon-wrapper'>
                <img src={icon} alt='' />
              </div>
              <div className='title-wrapper'>
                <h3 className='title'>{title}</h3>
              </div>
              {fullWidth && <ArrowRight size={28} className='arrow-icon' />}
            </div>
          </a>
        </div>
      </div>
    )
  }
}

StatbankBox.propTypes = {
  title: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.string,
  fullWidth: PropTypes.bool,
}

export default (props) => <StatbankBox {...props} />
