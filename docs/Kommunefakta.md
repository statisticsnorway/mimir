# Kommunefakta and other municipality pages

Today we have these municipal pages
- Kommunefakta
- Kommuneareal
- Barn og unge
- Jakt i din kommune

## Create municipality page
To build up a page with the parts you want, you hav to create a page /kommune under the main municipality page where all parts are added. Both mainpage and page /kommune must have set pageType to Kommunefakta.
Parts that support municipaldata are:
- Banner
- KeyFigure
- Highchart


The source for keyFigure and highchart must be the Statistikbanken Api where you set filtering on the dataset by municipality (Region)

## Regionlist
To get counties and municipalities we use these dataqueries from KLASS:
* Municipalities: http://data.ssb.no/api/klass/v1/classifications/131/codesAt?date=2020-01-01
* Counties: http://data.ssb.no/api/klass/v1/classifications/104/codesAt?date=2020-01-01
* ChangeList: https://data.ssb.no/api/klass/v1/classifications/131/changes?from=2016-01-01&to=2020-01-02

We use the contenttype genericDataImport to retrieve region lists from Klass, then you have to add these 3 municipality lists to the site configuration (Mimir Applikation)
Data from Klass is stored in repo no.ssb.dataset/master/root/klass, cronjob updated these everyday

Data from Klass is used in map, menuDropdown and to get data to banner, highchart and keyfigure

## Router and apache
We use filters /site/filters/router.js in site.xml to process requests to the municipal pages
```
<mappings>
	<mapping filter="/site/filters/router.js" order="10">
		<pattern>/(kommuneareal|kommunefakta|barn-og-unge|jakt-i-din-kommune)/?[^/]+$</pattern>
	</mapping>
	<mapping controller="/site/pages/default/default.js">
		<match>type:'portal:fragment'</match>
	</mapping>
</mappings>
```

In the code for router.js, the name of the municipality is retrieved from the request url, then data is retrieved from Klass for the municipality.

### New request or Apache

The old solution was to make a new request to kommunefakta/kommune where you send params with municipal data for the municipality. 
But this caused problems with the accumulation of threads.
We have now hopefully solved this problem by using apache, except when running kommunefakta from localhost.

** Old solution (and code used on localhost) **
1. Request /kommunefakta/rana
2. In router.ts data about the municipality is added to params
3. New request to /kommunefakta/kommune med params municipality

** New solution with Apache **
1. Request /kommunefakta/rana
2. Apache rewrite request to /kommunefakta/kommune?kommune=rana
3. In router.ts data about the municipality is added to params and request is sent

## RewriteRule Apache
The rewrite rule looks like this
```
RewriteRule ^(kommuneareal|kommunefakta|barn-og-unge|jakt-i-din-kommune)/(?!kostra|kommune)([^\/]+)$  /$1/kommune?kommune=$2 [R=307,L]
```

## What to do in code when creating new Municipalitypage
1. Add new page to mapping in site.xml
2. Add new page to map.es6
3. Add new page to municipalityAlert.xml
4. Add new page to router.ts
5. Add new page to default.ts
6. Add new page to rewriteRule Apache
