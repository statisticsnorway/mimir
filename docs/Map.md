# Map

## Kommunefakta


We have chosen to use highmaps to create a clickable municipality map. 

For map data, we use geo.json files, the files we need are:
- File for the entire country with county divisions. 
- One file per county with the municipal division. 

The geo.json files are located here:  https://github.com/statisticsnorway/mimir/tree/master/src/main/resources/assets/mapdata

### Country file
The name must be norge-fylkesinndelt.geo.json and have this properties for each county:
```javascript
"properties": { "OBJECTID": 1, "FYLKE": "03", "NAVN": "Oslo" }
```


### County files
Name of this file is no-fylke-{county number}.geo.json, for example no-fylke-03.geo.json, 
and the properties for this files look like this:
 ```javascript
"properties": { "fid": 214, "OBJECTID": 214, "OBJTYPE": "Kommune", "NAVN": "Oslo", "KOMMUNENR": "0301", "FYLKENR": "03" }
 ```

By clicking on county in the map you zoom in to the municipalities for the county, and by clicking on municipality you get to the 
municipal profile of that municipality.

### Code
The part map 
The code that loads the map is in the file https://github.com/statisticsnorway/mimir/blob/master/src/main/resources/assets/js/app/map.ts.


