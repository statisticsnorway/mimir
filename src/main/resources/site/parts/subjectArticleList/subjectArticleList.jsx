import React, {useEffect, useState} from 'react';
import {Link} from '@statisticsnorway/ssb-component-library';
import PropTypes from 'prop-types';
import {ArrowRight} from 'react-feather';
import Truncate from 'react-truncate';
import axios from 'axios';

 /* TODO:
 - lage knapp
 - returnere antall fra service
 - vise antall
 - inkrementere start i props (?) i finally
 - ???
 - profit

 */


function SubjectArticleList(props) {
  const [articles, setArticles] = useState([
    {
      url: 'url',
      title: 'title',
      preface: 'prefacetexzt',
      publishDate: '123',
      publishDateHuman: '456',
    }]);
  const [loading, setLoading] = useState(false);
  const [acticleStart, setArticleStart] = useState(props.start);
  const [loadedFirst, setLoadedFirst] = useState(false);

  console.log('glnrbn props: ' + JSON.stringify(props, null, 2));

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
        start: props.start,
        count: props.count,
      },
    }).then((res) => {
      setArticles(articles.concat(res.data));
    }).finally(
        setLoading(false),
        setLoadedFirst(true),
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
      </section>
  );
}

SubjectArticleList.propTypes =
    {
      title: PropTypes.string,
      articleServiceUrl: PropTypes.string,
      currentPath: PropTypes.string,
      start: PropTypes.number,
      count: PropTypes.number,
    };

export default (props) => <SubjectArticleList {...props} />
