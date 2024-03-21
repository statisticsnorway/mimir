import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

interface ArticleListProps {
  title?: string
  articles: {
    title?: string
    preface?: string
    url?: string
    publishDate?: string
    publishDateHuman: string
  }[]
  archiveLinkText?: string
  archiveLinkUrl?: string
}

function ArticleList(props: ArticleListProps) {
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
            <p className='truncate-2-lines'>{article.preface}</p>
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

export default (props: ArticleListProps) => <ArticleList {...props} />
