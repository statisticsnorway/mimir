# Data Feeds
## KLASS
Data is imported as JSON , se [api-guide.html](https://data.ssb.no/api/klass/v1/api-guide.html).
For municipal facts we use KLASS as a source for counties and municipalities. 
The output for counties is typed up in [counties.ts](/src/main/resources/lib/klass/counties.ts) and [municipalities.ts](/src/main/resources/lib/klass/municipalities.ts)
## TBML
Data is imported from the tbprocessor service as xml, then sendt through [XmlParser](/src/main/java/no/ssb/xp/xmlparser/XmlParser.java).  
The output is typed up in [xmlParser.ts](/src/main/resources/lib/types/xmlParser.ts) as the `TbmlData` interface

It's a fairly simple datastructure, just be aware of how the XmlParser works. If there is multiple nodes with the same name it'll become and array of objects/values, or if its just a single one, it'll become just the object/value. See the [`defaultTbmlFormat`](./../src/main/resources/lib/highcharts/highchartsDataFormats.es6) function for an example on how to work with this.
## JSONStat
Data is imported from http://data.ssb.no/api/v0/ and is using the JSON-stat format (documented here: https://json-stat.org/). And we're using [JSON-stat Javascript Toolkit](https://www.npmjs.com/package/jsonstat-toolkit) to work and manipulate the data returned ([API Reference](https://github.com/jsonstat/toolkit/blob/master/docs/API.md)). For now, this is only used on the kommunefakta page, see the [`defaultFormat`](./../src/main/resources/lib/highcharts/highchartsDataFormats.es6) function for an example on how to work with this.
