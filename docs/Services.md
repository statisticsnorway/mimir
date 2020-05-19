# Services

## Municipality
This service returns name, path, county and code for given municipality code.

[Map](../src/main/resources/site/parts/map/map.es6) and 
[menuDropDown](../src/main/resources/site/parts/menuDropdown/menuDropdown.es6) are currently using this.

### Methods
#### `get(req)` 
- If `req.params.code` is a municipal code, the data about that municipality is returned. 

## Dashboard
`Used to update, create or delete datasets based on dataqueries`

**GET** (should maybe be PUT?)  
Update all:
```javascript
{
    id: '*'
}
```
Update one:
```javascript
{
    id: 'some-dataquery-id'
}
```

Returns:
```javascript
{
    status: 200,
    message: 'success or failure info',
    updates: [{
      id: dataqueryId,
      status: STATUS_MESSAGE,
      message: 'human readable message',
      modified: timestamp, 
      modifiedHumanReadable: '02 mai 2020 12:13', 
      dataset: { ... datasetinfo ... },
      logInfo: { ... loginfo ... }     
    }]
}
```

**DELETE**  
Delete datasets for all dataqueries
```javascript
{
    id: '*'
}
```
Delete one dataset:
```javascript
{
    id: 'some-dataquery-id'
}
```
Returns:
```javascript
{
    status: 200,
        message: 'success or failure info',
        updates: [{
          id: dataqueryId,
          status: STATUS_MESSAGE,
          message: 'human readable message',
          modified: timestamp, 
          modifiedHumanReadable: '02 mai 2020 12:13', 
          dataset: { ... datasetinfo ... },
          logInfo: { ... loginfo ... }     
        }]
}
```
 
#### `createContextOption(branch)` (private)
Creates a context to be used for 

## Custom Selector Municipals
This is a service endpoint for a custom selector. It fetches all municipalities 
from KLASS, and return them in a format that custom selector needs.

At the moment it is used in [SiteConfig](../src/main/resources/site/site.xml ) to choose a default municiaplity for preview, and in 
[municipalityAlert](../src/main/resources/site/content-types/municipalityAlert/municipalityAlert.xml). 

### Methods:
#### `get(req)` : get list of municipalities win custom selector format
