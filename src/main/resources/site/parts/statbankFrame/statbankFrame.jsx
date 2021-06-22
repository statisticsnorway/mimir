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
          <span className='h2 statbank-title roboto-bold'>{props.title}</span>
        </div>
        <div id="statbank-placeholder"></div>
      </>
  );
}

StatbankFrame.propTypes =
    {
      title: PropTypes.string,
      breadcrumb: PropTypes.arrayOf(object),
    };

export default (props) => <StatbankFrame {...props} />
