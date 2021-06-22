import React from 'react';
import {Breadcrumb} from '@statisticsnorway/ssb-component-library';
import PropTypes, {object} from 'prop-types';

function StatbankFrame(props) {
  function breadcrumb(bread) {
    return (
        <nav className="row mt-2" aria-label="secondary">
          <div className="col-12">
            {bread && <Breadcrumb items={bread}/>}
          </div>
        </nav>
    );
  }

  return (
      <>
        {breadcrumb(props.breadcrumb)}
        <div className='statbank-overskrift pt-4 pb-4'>
          <div className="statbank-header container mb-2">
            <div className="row">
              <div className="col-md-4">
                <span className='h2 statbank-title roboto-bold'>{props.title}</span>
              </div>
              <div className="col-md-8 text-right">
                <div className="col-md-12">
                  <a href={props.statbankHelpLink}
                     className="ssb-link mb-0 roboto-bold">
                    <span className="link-text">{props.statbankHelpText}</span>
                  </a>
                </div>
{/*
                <div className="col-md-12">
                  <a href={props.pageUrl}
                     className="ssb-link roboto-plain">
                    <span className="link-text"
                          >{props.statbankMainFigures}</span>
                  </a>
                </div>
*/}
                <div className="col-md-12">
                  <a href={"/statbank"} className="ssb-link roboto-plain">
                    <span className="link-text">{props.statbankFrontPage}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="statbank-placeholder"></div>
      </>
  );
}

StatbankFrame.propTypes =
    {
      title: PropTypes.string,
      breadcrumb: PropTypes.arrayOf(object),
      statbankHelpText: PropTypes.string,
      statbankFrontPage: PropTypes.string,
      statbankHelpLink: PropTypes.string
    };

export default (props) => <StatbankFrame {...props} />
