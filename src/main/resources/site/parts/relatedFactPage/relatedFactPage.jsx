import React from 'react'
import { ImageLink, Button } from '@statisticsnorway/ssb-component-library'

class RelatedBoxes extends React.Component {
    constructor(props){
        super(props)
        this.state = { isHidden: true };
        this.toggleBox = this.toggleBox.bind(this);
    }


    toggleBox() {
        this.setState(prevState => ({ isHidden: !prevState.isHidden }));
    };

    render() {
        const { relatedContentLists, mainTitle } = this.props
        return (
            <section className="xp-part part-imageLink container col-12">
                <h2 defaultValue={'tittel tekst her'}>{mainTitle}</h2>
                <div className="imageBoxWrapper pt-5">
                    {relatedContentLists.map((relatedRelatedContent, index) =>
                        <ImageLink
                            orientation={index > 2 && this.state.isHidden ? 'hidden' : ''} //hack for å legge til klasse gjennom orientation prop, TODO: fikses etter endring i DS
                            image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.title} />}
                            link={relatedRelatedContent.link}
                            type={relatedRelatedContent.type}
                            title={relatedRelatedContent.title}
                        />
                    )}
                </div>
                <div className="col-6 pb-5">
                    <Button className={relatedContentLists.length < 4 ? 'hidden' : ''} onClick={this.toggleBox}>vis flere</Button>
                </div>
            </section>
        )
    }
}



export default (props) => <RelatedBoxes {...props} />