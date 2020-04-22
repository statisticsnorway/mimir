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
        const { relatedContentLists, mainTitle, showAll, showLess } = this.props
        return (
            <section className="xp-part part-imageLink container col-12 mt-5">
                <h2 className={"ml-auto mr-auto pt-4"} >{mainTitle || 'Mangler tittel'}</h2>
                    <div className="imageBoxWrapper pt-5">
                        {relatedContentLists.map((relatedRelatedContent, index) =>
                            <ImageLink
                                orientation={index > 2 && this.state.isHidden ? 'd-none' : ''} //hack for å legge til klasse gjennom orientation prop, TODO: fikses etter endring i DS
                                image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.title}/>}
                                link={relatedRelatedContent.link}
                                type={relatedRelatedContent.type}
                                title={relatedRelatedContent.title}
                                key={index}
                            />
                        )}
                    </div>
                <div className="col-8 pb-5 hide-show-btn">
                    <Button className={relatedContentLists.length < 4 ? 'd-none' : ''} onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
                </div>
            </section>
        )
    }
}



export default (props) => <RelatedBoxes {...props} />