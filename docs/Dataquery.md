# Dataquery
### Task
We have a task scheduled to run a `dataquery` job at 08:03 for `/lib/tasks/dataquery/dataquery.ts` every day, which ensures that the datasets for parts Table, Highchart, Highmap, and Keyfigure from any data source (PXWebApi, Klass, and TBProcessor) gets updated:

```javascript
  scheduleJob({
    name: 'dataquery',
    description: 'Data from datasource endpoints',
    descriptor: 'dataquery',
    cronValue: app.config && app.config['ssb.task.dataquery'] ? app.config['ssb.task.dataquery'] : '03 08 * * *',
    timeZone: timezone,
  })
```

The datasets are refreshed asynchronously with retry functionality, and the process is thoroughly logged in the XP logs. Additionally, we create and update job logs nodes for `dataquery` which are stored in Data Toolbox (`no.ssb.eventlog/master/root/jobs`). 
The purpose of the `dataquery` job logs are to display the task status (Started, Failed, and Completed) and the results for updated, failed, and ignored data queries in our Dashboard application.

### Dashboard
Our Dashboard application also provides features that allow internal users to find and update dataqueries manually through the user interface.