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

  const bread = [
  ];

  return (
      <>
        {breadcrumb(props.breadcrumb)}
        <div className={'statbank-overskrift'}>
          {props.title}
        </div>
      </>
  );
}

StatbankFrame.propTypes =
    {
      title: PropTypes.string,
      breadcrumb: PropTypes.arrayOf(object),
    };

export default (props) => <StatbankFrame {...props} />
