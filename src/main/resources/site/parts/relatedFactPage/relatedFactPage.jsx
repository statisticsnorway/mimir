import React from 'react'
import { ImageLink, Button } from '@statisticsnorway/ssb-component-library'

state = { isHidden: true }
const { isHidden } = this.state;
toggleBox = () => {
    this.setState(prevState => ({ isHidden: !prevState.isHidden }))
}

export default (props) =>
    <section className="xp-part part-imageLink container col-12">
        <div className="imageBoxWrapper pt-5">
            {props.relatedContentLists.map((relatedRelatedContent, index) =>
                <ImageLink
                    orientation={index > 2 && isHidden ? 'hidden' : ''} //hack for å legge til klasse gjennom orientation prop, TODO: fikses etter endring i DS
                    image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.title} />}
                    link={relatedRelatedContent.link}
                    type={relatedRelatedContent.type}
                    title={relatedRelatedContent.title}
                />
            )}
        </div>
        <div className="col-6 pb-5">
            <Button className={props.relatedContentLists.length < 4 ? 'hidden' : ''} onClick={this.toggleBox}>vis flere</Button>
        </div>
    </section>
