import React from 'react'
import { Button, Divider, Link, Paragraph, Text, Title } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'
import { groupBy } from 'ramda'
import PropTypes from 'prop-types'

const groupArticlesByYear = groupBy((articles) => {
  return articles.year
})

class ListOfArticles extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isHidden: true
    }

    this.toggleBox = this.toggleBox.bind(this)
  }

  toggleBox() {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden
    }))
  };

  getButtonBreakpoint() {
    const {
      articles
    } = this.props

    if (articles.length > 10) {
      return ''
    }
    return 'd-none'
  }

  getButtonText() {
    const {
      showAll, showLess, articles
    } = this.props

    if (this.state.isHidden) {
      return <span><ChevronDown size="18" className="mr-2" />{showAll + ' 10/' + articles.length}</span>
    }
    return <span><ChevronUp size="18" className="mr-2" />{showLess + ' ' + articles.length + '/' + articles.length}</span>
  }

  renderShowMoreButton() {
    return (
      <div className={`row hide-show-btn justify-content-center ${this.getButtonBreakpoint()}`}>
        <div className="col-auto">
          <Button onClick={this.toggleBox}>
            {this.getButtonText()}
          </Button>
        </div>
      </div>
    )
  }

  getBreakpoints(index) {
    if (index < 10) {
      return 'd-block'
    }
    return ''
  }

  addArticle(articles) {
    return articles.map((article, index) => {
      return (
        <div key={`article-${index}`} className={`col-12 mt-1 mb-3 ${this.state.isHidden ? 'd-none' : ''} ${this.getBreakpoints(index)}`}>
          <Text small>{article.subtitle}</Text>
          <p className="my-2"><Link href={article.href} linkType='header'>{article.title}</Link></p>
          <Paragraph>{article.preamble}</Paragraph>
        </div>
      )
    })
  }

  addYear(year) {
    return <Title size={2}>{year}</Title>
  }

  addArticles() {
    const {
      articles
    } = this.props
    const groupedArticles = groupArticlesByYear(articles)

    return Object.entries(groupedArticles).map(([year, articles]) => {
      return (
        <React.Fragment key={`groupedArticles-${year.id}`}>
          <Divider light className="mb-3" />
          <div className="row mb-3">
            <div className="col-12 col-lg-1">
              {this.addYear(year)}
            </div>
            <div className="col-12 col-lg-8 ml-lg-4 p-0">
              <div className="row">
                {this.addArticle(articles)}
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    })
  }

  addTitle() {
    return <Title size={2} className="mb-4">{this.props.listOfArticleTitle}</Title>
  }

  render() {
    return (
      <div className="col-12 mt-5">
        {this.addTitle()}
        {this.addArticles()}
        {this.renderShowMoreButton()}
      </div>
    )
  }
}

ListOfArticles.propTypes = {
  listOfArticleTitle: PropTypes.string,
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.string,
      subtitle: PropTypes.string,
      href: PropTypes.string,
      title: PropTypes.string,
      preamble: PropTypes.node
    })
  ),
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired
}

export default (props) => <ListOfArticles {...props} />
