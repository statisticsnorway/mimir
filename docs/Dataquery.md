# Dataquery
Content used to define data from PXWebApi, Klass and TB processor. Used on Highcharts and Keyfigures.


## Dataset
Content with result of dataquery

## Update/create

### Cronjob
main.es6 define a cronjob scheduled to 09:00, uses function refreshDataset() in main/resources/lib/dataquery.ts
```javascript
function job() {
  log.info('-- Running dataquery cron job  --')
  const result = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    query: `data.table LIKE 'http*'`
  })
  result && result.hits.map((row) => {
    refreshDataset(row)
  })
}
```


### Dashboard
Dashboard where you can update one or all dataquerys, uses function refreshDatasetWithData() in main/resources/lib/dataquery.ts

### Methods dataquery.ts
#### `get(url: string, json: DataqueryRequestData | undefined, selection: SelectionFilter = defaultSelectionFilter)`  
- used from getData() 

#### `refreshDataset(dataquery: Content<Dataquery>)`
- used from cronjob 

#### `refreshDatasetWithData(data: string, dataquery: Content<Dataquery>)`
- used from dashboard 

#### `getData(dataquery: Content<Dataquery>)`
- used from dashboard 



