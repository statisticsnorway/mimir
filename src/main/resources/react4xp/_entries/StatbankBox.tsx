import React from 'react'
import { ArrowRight } from 'react-feather'

interface StatbankBoxProps {
  title?: string;
  href?: string;
  icon?: string;
  fullWidth?: boolean;
}

class StatbankBox extends React.Component<StatbankBoxProps> {
  render() {
    const { title, href, icon, fullWidth } = this.props

    return (
      <div className='container-fluid p-0'>
        <div className='row'>
          <a
            className={`statbank-link ${fullWidth ? 'col-lg-12' : 'col-lg-7'}`}
            href={href}
            id='statbankLink'
            aria-label={title}
          >
            <div className='content'>
              <div className='icon-wrapper'>
                <img src={icon} alt='' />
              </div>
              <div className='title-wrapper'>
                <h3 className='title'>{title}</h3>
              </div>
              {fullWidth && <ArrowRight size={28} className='arrow-icon' aria-hidden='true' />}
            </div>
          </a>
        </div>
      </div>
    )
  }
}

export default (props) => <StatbankBox {...props} />
