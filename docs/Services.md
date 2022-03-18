# Services

## Municipality
This service returns name, path, county and code for given municipality code.

[Map](../src/main/resources/site/parts/map/map.ts) and 
[menuDropDown](../src/main/resources/site/parts/menuDropdown/menuDropdown.es6) are currently using this.

### Methods
#### `get(req)` 
- If `req.params.code` is a municipal code, the data about that municipality is returned. 

## Dashboard
`Used to update, create or delete datasets based on dataqueries`

**GET** (should maybe be PUT?)  

Update all:
```JSON
{
    "id": "*"
}
```

Update one:
```JSON
{
    "id": "some-dataquery-id"
}
```

Returns:
```JSON
{
    "message": "Ingen ny data",
    "updates": [{
      "id": "1234134-sadf324afsd-2324saf324-324",
      "status": NO_NEW_DATA,
      "message": "Ingen ny data",
      "dataset": [{
        "newDatasetData": false,
        "modified": "26.05.2020 15:09:56",
        "modifiedReadable": "8 days ago"
      }],
      "logData": [{
        "queryId": "475e7964-6e28-48d8-9948-a20f44ecab5f",
        "modified": "03.06.2020 10:36:42",
        "by": {
            "type": "user",
            "key": "user:system:harry",
            "displayName": "Harry Potter",
            "disabled": false,
            "email": "harry.potter@ssb.no",
            "login": "harry",
            "idProvider": "system"
        },
        "modifiedTs": "2020-06-03T08:36:42.689Z",
        "modifiedResult": "NO_NEW_DATA",
        "message": "Ingen ny data",
        "modifiedReadable": "a few seconds ago"
      }]
    }]
}
```

**DELETE**  
Delete datasets for all dataqueries

Delete all dataset:
```JSON
{
    "id": "*"
}
```

Delete one dataset:
```JSON
{
    "id": "some-dataquery-id"
}
```
Returns:
```JSON
{
   "updates": [{
      "id": "475e7964-6e28-48d8-9948-a20f44ecab5f",
      "message": "Sletting gjennomført",
      "status": "DELETE_OK",
      "dataset": {
        "newDatasetData": true,
        "modified": "",
        "modifiedReadable": ""
      },
      "logData": {
      "queryId": "475e7964-6e28-48d8-9948-a20f44ecab5f",
      "modified": "03.06.2020 10:48:35",
      "by": {
        "type": "user",
        "key": "user:system:harry",
        "displayName": "Harry Potter",
        "disabled": false,
        "email": "harry.potter@ssb.no",
        "login": "harry",
        "idProvider": "system"
      },
      "modifiedTs": "2020-06-03T08:48:35.250Z",
      "modifiedResult": "DELETE_OK",
      "message": "Sletting gjennomført",
      "modifiedReadable": "a few seconds ago"
      }
    }],
    "message": "Sletting gjennomført",
    "publishResult": {
      "pushedContents": [],
      "deletedContents": ["d3742abc-8436-42fa-abf6-23891608fd5e"],
      "failedContents": []
    }
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
