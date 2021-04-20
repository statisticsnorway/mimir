import React, {useEffect, useState} from 'react';
import {Link, Button} from '@statisticsnorway/ssb-component-library';
import PropTypes from 'prop-types';
import {ArrowRight, ChevronDown} from 'react-feather';
import Truncate from 'react-truncate';
import axios from 'axios';

/* TODO:
- vise antall, litt penere takk
- sette antall retur til 10
- Vise noe fornuftig når vi ikke har fler artikler å liste. Deactivated knapp?
- ???
- profit

*/

function SubjectArticleList(props) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articleStart, setArticleStart] = useState(props.start);
  const [loadedFirst, setLoadedFirst] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(
      () => {
        if (!loadedFirst) {
          fetchArticles();
        }
      },
      [],
  );

  function fetchArticles() {
    setLoading(true);
    axios.get(props.articleServiceUrl, {
      params: {
        currentPath: props.currentPath,
        start: articleStart,
        count: props.count,
      },
    }).then((res) => {
      setArticles(articles.concat(res.data.articles));
      setTotalCount(res.data.totalCount);
    }).finally(
        setLoading(false),
        setLoadedFirst(true),
        setArticleStart(prevState => prevState + props.count),
    );
  }

  function renderArticles() {
    return (
        articles.map((article, i) => {
              return (
                  <div key={i} className="mt-5">
                    <Link href={article.url} className="ssb-link header">
                      {article.title}
                    </Link>
                    <p>
                      <Truncate lines={2}
                                className="article-list-ingress">{article.preface}</Truncate>
                    </p>
                    <time dateTime={article.publishDate}>
                      {article.publishDateHuman}
                    </time>
                  </div>
              );
            },
        ));

  }

  return (

      <section className="subject-article-list container-fluid">
        <h3>{props.title}</h3>

        <div className={'total-count'}>Viser {articleStart} av {totalCount}</div>

        {
          renderArticles()
        }
        <Link href={props.archiveLinkUrl ?
            props.archiveLinkUrl :
            '#'} linkType="profiled" icon={<ArrowRight size="20"/>}
              className="mt-5 d-md-none">
          {props.archiveLinkText ?
              props.archiveLinkText :
              'empty'}
        </Link>

        <div>
          <Button className={'button-more mt-5'}
                  onClick={fetchArticles}><ChevronDown size="18"/>{props.buttonTitle}
          </Button>
        </div>
      </section>
  );
}

SubjectArticleList.propTypes =
    {
      title: PropTypes.string,
      buttonTitle: PropTypes.string,
      articleServiceUrl: PropTypes.string,
      currentPath: PropTypes.string,
      start: PropTypes.number,
      count: PropTypes.number,
    };

export default (props) => <SubjectArticleList {...props} />
