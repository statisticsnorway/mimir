# Dashboard (SSB Dataspørringer)

This is a tool where users can administrate the datasets corresponding
to each dataquery. It lists all queries created in the content studio with 
information about last time the dataset was updated, and the result of last time
the dataset was tried to be updated. "Fetch new dataset" and "delete dataset", are 
functionality currently available. When new data is fetched, a [event log](./EventLog.md) entry will be 
created in a [repo](./RepoAndNode.md) in enonic xp. 

The dashboard code is located under `/src/main/resources/admin/tools/dashboard` 
and containes: 
- controller: [dashboard.es6](/src/main/resources/admin/tools/dashboard/dashboard.es6), 
- view: [dashboard.html](/src/main/resources/admin/tools/dashboard/dashboard.html),  
- config: [dashboard.xml](/src/main/resources/admin/tools/dashboard/dashboard.xml),
- icon: [dashboard.svg](/src/main/resources/admin/tools/dashboard/dashboard.svg),

The controller get everything the dashboard needs to list the queries, mainly:
- Assets: css, images and most importantly the 
[dashboard react app](/src/main/resource/react4xp/_entries/Dashboard/Dashboard.jsx)
- Dataqueries: Dataquery content from content studio mixed with info from 
[Event Log](./EventLog.md) 


## Dashboard react app

- [Dashboard.jsx](/src/main/resources/react4xp._entries/Dashboard/Dashboard.jsx)
- [DashboardDataQuery.jsx](/src/main/resources/react4xp._entries/Dashboard/DashboardDataQuery.jsx)

The dashboard react app are responsible for listing dataqueries, and the actions when 
buttons for `get new dataset` and `delete dataset` is pushed.

The react app uses a [service](./Services#dashboard.md) that is located under `/src/main/resources/servies/dashboard`. The buttons 
do either a `get` or a `delete` request to the service, and show the result at each dataquery.

The react app takes some parameters.
