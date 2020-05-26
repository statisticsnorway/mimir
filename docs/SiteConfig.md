# Site Config
The [site.xml](/src/main/resources/site/site.xml) file is the descriptor that will let Enonic XP know that this app can be added to a site. 
Response filters and controller mappings can be set up in the site descriptor as well as application configurations.

## MunicipalData
Config used on Kommunefakta
* Dataquery Municipal 
* Dataqyery County 
* Dataquery Changelist 
* Defult Municipality (0301) 
* Folder where the map files is 

## Language
* Language label: Used on link in header
* Language code: nb/en
* Language link: Used to link to language site (feks: /en)
* Language phrase
* Language homepage
* Content Header configuration
* Content Footer configuration

# Mapping
* Filter: [router.js](/src/main/resources/site/filters/router.es6) (Used for Kommunefakta)
* Controller: [default.es6](/src/main/resources/site/pages/default/default.es6) 

# Processors
* response-processor searchableText
* response-processor react4xpAssetSource