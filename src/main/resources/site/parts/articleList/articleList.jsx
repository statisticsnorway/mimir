import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ArrowRight } from 'react-feather'
import Truncate from 'react-truncate'

class ArticleList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      articles
    } = this.props
    return (
      <section className="article-list container-fluid">
        <Title size={2} className="mb-4">{this.props.title}</Title>
        {
          articles.map((article, i) => {
            return (
              <div key={i} className="mt-5">
                <Title size={3}>
                  <Link href={article.url} className="ssb-link header">
                    {article.title}
                  </Link>
                </Title>
                <p>
                  <Truncate lines={2} className="article-list-ingress" >{article.preface}</Truncate>
                </p>
                <time dateTime={article.publishDate}>
                  {article.publishDateHuman}
                </time>
              </div>
            )
          }
          )
        }
        <Link href={this.props.archiveLinkUrl ? this.props.archiveLinkUrl : '#'} linkType="profiled" icon={<ArrowRight size="20"/>} className="mt-5 d-md-none">
          {this.props.archiveLinkText ? this.props.archiveLinkText : 'empty'}
        </Link>
      </section>
    )
  }
}

export default (props) => <ArticleList {...props} />

ArticleList.propTypes = {
  title: PropTypes.string,
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      preface: PropTypes.string,
      url: PropTypes.string,
      publishDate: PropTypes.string
    },
    ),
  ),
  archiveLinkText: PropTypes.string,
  archiveLinkUrl: PropTypes.string
}
