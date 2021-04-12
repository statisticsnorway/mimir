import React from 'react';
import { Link } from '@statisticsnorway/ssb-component-library'
class ArticleList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    const { articles } = this.props
    return (
        <section className="xp-part article-list container-fluid">
          <h3>{props.title}</h3>
          { articles(article => {
            return (<div className="mt-5">
              <Link href="{article.url}" className="ssb-link header"
                   {article.title}
              </Link>
              <p>{article.preface}</p>
              <time datetime={article.publishDate}>{article.publishDateHuman}</time>
            </div>)
          })

          }
          <Link href="{props.archiveLinkUrl}">
            {articles.archiveLinkText}
          </Link>
        </section>
    )
  }

}

export default (props) => <ArticleList {...props} />
            ArticleList.propTypes = {}
