import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ArrowRight } from 'react-feather'
import Truncate from 'react-truncate'

function ArticleList(props) {
  const { articles, title, archiveLinkUrl, archiveLinkText } = props
  return (
    <section className='article-list container-fluid'>
      <Title size={2} className='mb-4'>
        {title}
      </Title>
      {articles.map((article, i) => {
        return (
          <div key={i} className='mt-5'>
            <Title size={3}>
              <Link href={article.url} className='ssb-link header' standAlone>
                {article.title}
              </Link>
            </Title>
            <p>
              <Truncate lines={2} className='truncate'>
                {article.preface}
              </Truncate>
            </p>
            <time dateTime={article.publishDate}>{article.publishDateHuman}</time>
          </div>
        )
      })}
      <Link href={archiveLinkUrl ?? '#'} linkType='profiled' icon={<ArrowRight size='20' />} className='mt-5 d-md-none'>
        {archiveLinkText ?? 'empty'}
      </Link>
    </section>
  )
}

ArticleList.propTypes = {
  title: PropTypes.string,
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      preface: PropTypes.string,
      url: PropTypes.string,
      publishDate: PropTypes.string,
    })
  ),
  archiveLinkText: PropTypes.string,
  archiveLinkUrl: PropTypes.string,
}

export default (props) => <ArticleList {...props} />
