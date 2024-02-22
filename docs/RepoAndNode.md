Repo and Node
==

Enonics repo store is being accessed by the library `/lib/xp/repo`. 
Manipulation of nodes in the repo, is done with the library `/lib/xp/node`.

The MIMIR application have two library wrappers that simplifies the 
connecting to repo and node manipulations in `/src/main/resources/lib/repo/repo.ts`
and `/src/main/resources/lib/repo/common.ts`.

If you need to create new repos or need to manipulate nodes, please use
the wrapper libraries.

## Node
After a repo is created, you can store data in it. The data is stored as `nodes`. 

To get, create, modify or delete nodes, a connection to a repo is neccessery. It is done by 
calling `connect` from enoics node library.
 
## Dataset
automatically sets up `no.ssb.dataset` repo and one child node for each of the different dataset sources.

### `getDataset()`
Example
```typescript
const myDataset: DatasetRepoNode<MyDatasetType> = getDataset(DataSource.TALLBYGGER, '123456')
```
Returns (undefined if the node with the key doesnt exist)
```JSON
{
  "_id": "daa48def-8a6b-45fb-b190-b35f90a24234",
  "_name": "123456",
  "_path": "/tallbygger/123456",
  "_childOrder": "_ts DESC",
  "_indexConfig": {
    "default": {
      "decideByType": true,
      "enabled": true,
      "nGram": false,
      "fulltext": false,
      "includeInAllText": false,
      "path": false,
      "indexValueProcessors": [],
      "languages": []
    },
    "configs": []
  },
  "_inheritsPermissions": false,
  "_permissions": [
    {
      "principal": "role:system.admin",
      "allow": ["READ", "CREATE", "MODIFY", "DELETE", "PUBLISH", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
      "deny": []
    },
    {
      "principal": "role:system.everyone",
      "allow": ["READ"],
      "deny": []
    }
  ],
  "_state": "DEFAULT",
  "_nodeType": "default",
  "_versionKey": "4b861349-f298-4fb8-a9eb-fc3fd9c7c20d",
  "_ts": "2020-06-26T12:02:35.779Z",
  "data": {
    "json": {
      "test": "321"
    },
    "xml": "<test>test1</test>"
  }
}
```

### `createOrUpdateDataset()`
Example
```typescript
const newOrUpdatedDataset: DatasetRepoNode<MyDatasetType> = createOrUpdateDataset(DataSource.TALLBYGGER, '123456', {
  json: {
    test: '321'
  },
  xml: '<test>test1</test>'
})
```
Returns
```JSON
{
  "_id": "daa48def-8a6b-45fb-b190-b35f90a24234",
  "_name": "123456",
  "_path": "/tallbygger/123456",
  "_childOrder": "_ts DESC",
  "_indexConfig": {
    "default": {
      "decideByType": true,
      "enabled": true,
      "nGram": false,
      "fulltext": false,
      "includeInAllText": false,
      "path": false,
      "indexValueProcessors": [],
      "languages": []
    },
    "configs": []
  },
  "_inheritsPermissions": false,
  "_permissions": [
    {
      "principal": "role:system.admin",
      "allow": ["READ", "CREATE", "MODIFY", "DELETE", "PUBLISH", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
      "deny": []
    },
    {
      "principal": "role:system.everyone",
      "allow": ["READ"],
      "deny": []
    }
  ],
  "_state": "DEFAULT",
  "_nodeType": "default",
  "_versionKey": "4b861349-f298-4fb8-a9eb-fc3fd9c7c20d",
  "_ts": "2020-06-26T12:02:35.779Z",
  "data": {
    "json": {
      "test": "321"
    },
    "xml": "<test>test1</test>"
  }
}
```

### `deleteDataset()`
Example
```typescript
const success = deleteDataset(Datasource.TALLBYGGER, '123456')
```
Returns
```typescript
true|false
```
