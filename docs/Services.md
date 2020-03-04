# Services

## Municipality
This service returns name, path, county and code for given municipality code.

[Map](../src/main/resources/site/parts/map/map.es6) and 
[menuDropDown](../src/main/resources/site/parts/menuDropdown/menuDropdown.es6) are currently using this.

###Methods
####`get(req)` 
- If `req.params.code` is a municipal code, the data about that municipality is returned. 

## Dashboard
This is the end point for all dashboard tasks. Which handles data queries and the incoming results.

###Methods
####`get(req)` 
Create or update datasets based on dataqueries. 
- If `req.param.id` is set to `*`, it updates all or creates new datasets, for all dataqueries. 
- If `req.param.id` is an dataquery id, it will update the dataset, or create new if it doesnt exists.
   
####`delete(req)` 
Delete a dataset.
- If `req.params.id` is set to `*`, it deletes all datasets
- If `req.params.id` is a dataquery id, its related dataset will be deleted
 
####`createContextOption(branch)` (private)
Creates a context to be used for 

## Custom Selector Municipals
This is a service endpoint for a custom selector. It fetches all municipalities 
from KLASS, and return them in a format that custom selector needs.

At the moment it is used in [SiteConfig](../src/main/resources/site/site.xml ) to choose a default municiaplity for preview, and in 
[municipalityAlert](../src/main/resources/site/content-types/municipalityAlert/municipalityAlert.xml). 

###Methods:
####`get(req)` : get list of municipalities win custom selector format
