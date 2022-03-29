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
      articles, showAll, showLess
    } = this.props

    if (this.state.isHidden) {
      return (
        <span>
          <ChevronDown size="18" className="chevron-icons" />{showAll + ' 10/' + articles.length}
        </span>
      )
    }
    return (
      <span>
        <ChevronUp size="18" className="chevron-icons" />{showLess + ' ' + articles.length + '/' + articles.length}
      </span>
    )
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
    const hideArticle = this.state.isHidden ? 'd-none' : ''
    if (index < 10) {
      return 'd-block'
    }
    return hideArticle
  }

  addArticle(articles) {
    return articles.map((article, index) => {
      return (
        <div key={`article-${index}`} className={`article-container col-12 ${this.getBreakpoints(index)}`}>
          <Text small>{article.subtitle}</Text>
          <p><Link href={article.href} linkType='header'>{article.title}</Link></p>
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

    return Object.entries(groupedArticles).map(([year, articles], index) => {
      return (
        <React.Fragment key={`groupedArticles-${index}`}>
          <Divider light />
          <div className="articles-container row">
            <div className="col-12 col-lg-1">
              {this.addYear(year)}
            </div>
            <div className="col-12 col-lg-8 p-0">
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
    const {
      articles, listOfArticlesSectionTitle
    } = this.props

    if (articles.length > 0) {
      return <Title size={2} className="list-of-articles-title">{listOfArticlesSectionTitle}</Title>
    }
    return ''
  }

  render() {
    const {
      articles
    } = this.props

    if (articles.length > 0) {
      return (
        <div className="list-of-articles-container col-12">
          {this.addTitle()}
          {this.addArticles()}
          {this.renderShowMoreButton()}
        </div>
      )
    } else {
      return null
    }
  }
}

ListOfArticles.propTypes = {
  listOfArticlesSectionTitle: PropTypes.string,
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
