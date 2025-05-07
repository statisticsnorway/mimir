# Dataquery
### Task
We have a task scheduled to run a `dataquery` job at 08:03 for `/lib/tasks/dataquery/dataquery.ts` every day, which ensures that the datasets for the parts in a Statistics page gets updated. This applies to the parts Table, Highchart, Highmap, and Keyfigure from any data source (PXWebApi, Klass, and TBProcessor):

```javascript
  scheduleJob({
    name: 'dataquery',
    description: 'Data from datasource endpoints',
    descriptor: 'dataquery',
    cronValue: app.config && app.config['ssb.task.dataquery'] ? app.config['ssb.task.dataquery'] : '03 08 * * *',
    timeZone: timezone,
  })
```

We utilize our RSS application results to check which Statistics page are scheduled to release per day to filter which datasets should be updated, and the datasets are updated asynchronously with retry functionality. The process is thoroughly logged in the XP logs. Additionally, we create and update job logs nodes for `dataquery` which are stored in Data Toolbox (`no.ssb.eventlog/master/root/jobs`).
The purpose of the `dataquery` job logs are to display the task status (Started, Failed, and Completed) and the results for updated, failed, and ignored data queries in our Dashboard application.

### Dashboard
Our Dashboard application also provides features that allow internal users to find and update dataqueries manually through the user interface.