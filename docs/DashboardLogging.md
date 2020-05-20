# Dashboard logging

Logging is done every time a user or the system wants to refresh a dataset.

The logging entries wiill be saved in its own repo called: `no.ssb.eventlog`. You can use the 
datatoolbox to see the logging entries.

The event log functionality use the [repo and node](./RepoAndNode.md) wrapper libraries 
to connect to and manipulate nodes.
This is mainly done from the `eventLog.ts` library. 

The `query.ts` library have functions specifically for manipulating query log entries.
The `job.ts` library have functions that manipulate job nodes.


## Queries

The logging repo have two "top" nodes: `/queries` and `/jobs`. 

Under the `/queries`, each dataquery in the content studio 
will have a 1:1 relation with a node. This is done by using the dataquery id from the
 content studio as a node name. That way, it is easy to get a `query` node by fetching the 
 data from `/queries/[dataquery._id]`

In a `query` node, there is information about the last
 events for this dataquery its dataset. What happend and when it happend by who. 
 
When a new event are being logged, a new log entry will be saved as a child node of the `query` node.
So a log for dataquery with id `1234`, will be saved under `/queries/1234/` 


## Jobs

Every day at 08:00 or 09:00, a cron job is set up to fetch new datasets. This is logged under `/jobs`. 
Each job will have its own node with the information about which dataqueries that is being updated, when the job 
started and ended, and the result of the data requests.  

