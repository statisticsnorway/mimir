# Highcharts
[Documentation](https://www.highcharts.com/docs/index)  
[Api Reference](https://api.highcharts.com/highcharts/)  
[Demo Page](https://www.highcharts.com/demo/)  

Most of our highchart config is located in [config.es6](../src/main/resources/lib/highcharts/config.es6). Except for the config.es6, we also add or change some config settings in the [highchart.es6 part](/src/main/resources/site/parts/highchart/highchart.es6). Mostly it's populating `series`, adding the `xAxis` config, and doing some changes based on the datasource and/or graphType. There is also some functions being added and minor changes done in the [highchartsDataFormats.es6 frontend script](/src/main/resources/assets/js/app/highchart.es6). The reason for the split is because it's difficult to send functions in the config from the backend part to the frontend init function, and because some config options depends on knowing the client screen size.

Highchart can use two different datasources, [TBML](DataFeeds.md#tbml) or [JSONStat](DataFeeds.md#jsonstat), see their respective documentation for more info.
