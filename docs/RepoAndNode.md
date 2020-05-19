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
 
