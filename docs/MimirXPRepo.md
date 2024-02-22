# MIMIR XP Repo Config

## Objectives

- Provide a simple and unified interface to Enonic XP's [Repo](https://developer.enonic.com/docs/xp/stable/api/lib-repo) 
and [Node](https://developer.enonic.com/docs/xp/stable/api/lib-node) APIs covering
the most common usage scenarios in MIMIR
- Abstract out internal workings of the libraries and provide an app-centric wrapper module

_OBS_ : the examples are self-referential and use other functions from the same module.

## Interfaces

### User Contexts

#### withSuperUserContext
Execute `callback: () => T` using SuperUser credentials

**Example**
```typescript
import { get } from '/lib/xp/repo'
const getRepo = (repoName, branch) => {
  return withSuperUserContex(repoName, branch, () => {
    return get(repoName); 
  });  
}
``` 

#### withLoggedInUserContext 
For cases where the current user details are required. F.eks. logging which user scheduled a dataquery.
Execute `callback: (user) => T` providing the context of the currently logged-in `user` as argument
 
**Example**
```javascript
// (dashboard.es6)

exports.get = (req) => {
  const updateResult = withLoggedInUserContext('master', (user) => {
    logDataQueryEvent(req.params.id, user, { message: EVENT.STARTED });
    return getAllOrOneDataQuery(req.paramsid.map((query) => 
      updateDataQuery(query, user)
  });
}
```

### Repo opertions
Executes in superuser context. Use `repoExists(repo, branch)`, `getRepo(repo, branch)` and `createRepo(repo, branch)` to verify existence of a given repo,
retrieve it or create a new one respectively.

####`getConnection(repo, branch)`
Retrieve a connection to the given `repo` and `branch`

####`withConnection(repo, branch, callback)`
Uses the SuperUser context to connect to a node and executes the provided callback with the connection obtained
Callback is a function with signature `(conn: RepoConnection) => T`

**Example**
```javascript
// obtain a node with given key
const node = withConnection(repo, branch, key, (conn) => conn.get(key))
```

### Operations on a Node
(All operate on a connection obtained with a superuser context)

####`getNode(repo, branch, key)`
Retrieve a node identified by `key`
 
####`createNode(repo, branch, content)`
Must contain a property key.
> TODO: split key and content

#### `modifyNode(repo, branch, key, editor)`
Update the contents of a node identified by `key`. 
`editor` is a callback function with signature `(node: T & RepoNode) => T & RepoNode`

#### `deleteNode` 
Deletes a given node

**Example**
```javascript
const content: T & NodeCreateParams = {...}        // populate content
const eventLog = createNode(repo, branch, content)

const updateEvent = modifyNode<EventInfo>(eventLogRepo, eventLogBranch, eventId, (oldEvent) => {
  return {
    ...oldEvent,
    status: Status.COMPLETE,    
  }
})

deleteNode(eventId)
```
