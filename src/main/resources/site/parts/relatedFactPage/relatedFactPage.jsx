import React from 'react'
import { ImageLink } from '@statisticsnorway/ssb-component-library'

export default (props) =>
    <section className="xp-part part-imageLink container">
        {props.relatedContentLists.map((relatedRelatedContent) =>
            let count = relatedRelatedContent + 1;
            <ImageLink
                image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.title} />}
                link={relatedRelatedContent.link}
                type={relatedRelatedContent.type}
                title={relatedRelatedContent.title}
            />
        )}
    </section>