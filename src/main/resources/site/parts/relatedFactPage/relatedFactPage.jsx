import React from 'react'
import { ImageLink, Button } from '@statisticsnorway/ssb-component-library'

//state = { isVisible }

export default (props) =>
    <section className="xp-part part-imageLink container">
        {props.relatedContentLists.map((relatedRelatedContent, index) =>
            <ImageLink
                orientation={index > 2 ? 'hidden' : 'else'} //hack for å legge til klasse gjennom orientation prop, fikses etter endring i DS
                image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.title} />}
                link={relatedRelatedContent.link}
                type={relatedRelatedContent.type}
                title={relatedRelatedContent.title}
            />
        )}
    </section>
