import React from 'react'
import PropTypes from 'prop-types'
import { Title } from '@statisticsnorway/ssb-component-library'

function ResearchEmployeeList(props) {

    return (
        <section className="research-employee-list container-fluid">
            <div className="container py-5">
                <Title>{props.title}</Title>
            </div>
        </section>
    )
}


ResearchEmployeeList.prototype = {
    title: PropTypes.string
}

export default (props) => <ResearchEmployeeList {...props} />
