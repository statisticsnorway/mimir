# Saving data from Statistikkregisteret in Content Studio

### Goal
To fetch data from statistikkregisteret and saving it in Content Studio. Uses [MIMIR XP Repo](MimirXPRepo.md).

### Config
- Requires `ssb.statreg.baseUrl` (picked up from mimir-config) - which points to the URL of the statreg API. 
- For dev/utv you can use 
  ```
  ssb.statreg.baseUrl = https://i.utv.ssb.no/statistikkregisteret
  ```

### StatReg Repo
- Uses repo `no.ssb.statreg` in `master` branch.
- Provides:
  - `createStatRegNode(name, content)` to create a new statReg node
  - `getStatRegNode(key)` to retrieve a node identified by `key`
  - `modifyStatRegNode(key, content)` to modify an existing node identified by `key`, with `content`
  - `setupStatRegRepo(nodeConfig)` for quick setup of statReg nodes
    - `nodeConfig` is list of `{ key: <fetcher-function> }` tuples.
    - `fetcherFunction` is called and the result is stored as a content in a node identified by `key`.
  - TODO: periodic fetching of contacts ([MIMIR-601](https://jira.ssb.no/browse/MIMIR-601))   

### Contacts Service
- `fetchContacts` (also `/lib/ssb/statreg::fetchContacts`)
  - Fetch contacts from the statreg HTTP service
  - Used by `setupStatRegNodes`, the result is under 
  `master:no.ssb.statreg`/`contacts` node
  
-  `getContactsFromRepo()`
   - retrieve the contacts from the statreg repo node
   - TODO: support `forceRefresh` parameter to fetch contacts anew ([MIMIR-601](https://jira.ssb.no/browse/MIMIR-601))
