# Best-bet app

A standalone application where we can add and manage best bets to our xp content. The application contains a list of xp contents (such as pages, statistics, articles etc.) and the search words attached to each content. Features include creating new best bets using a form and editing and/or deleting existing best bets directly through the list.

## File locations
### Admin Tools 

`/src/main/resources/admin/tools/bestbet/`:
- [bestBet.html](/src/main/resources/admin/tools/bestbet/bestbet.html)
- [bestBet.ts](src/main/resources/admin/tools/bestbet/bestbet.ts)

### React4xp Entries 

`src/main/resources/react4xp/_entries/bestbet/`:
- [BestBet.jsx](src/main/resources/react4xp/_entries/bestbet/Bestbet.jsx)
- [EditSearchWordsModal.jsx](src/main/resources/react4xp/_entries/bestbet/EditSearchWordsModal.jsx)

### Repository 

`src/main/resources/lib/ssb/repo/`:
- [bestBet.ts](src/main/resources/lib/ssb/repo/bestbet.ts)

### Services

`src/main/resources/services/bestBetList/`:
- [bestBetList.es6](src/main/resources/services/bestBetList/bestBetList.es6)
- [bestBetList.xml](src/main/resources/services/bestBetList/bestBetList.xml)

`src/main/resources/services/contentSearch/`:
- [contentSearch.ts](src/main/resources/services/contentSearch/contentSearch.ts)
- [contentSearch.xml](src/main/resources/services/contentSearch/contentSearch.xml)

## Repository and Services

The best-bet data is parsed and stored in nodes, which can be found in Data Toolbox in the `no.ssb.bestbet` repository. All of the functions to get and alter these specific nodes are located in the [src/main/resources/lib/ssb/repo/bestbet.ts](src/main/resources/lib/ssb/repo/bestbet.ts) file.

We use [an xp service](src/main/resources/services/bestBetList/bestBetList.es6) that we send GET, POST or DELETE requests to. The service will either return a list of best bets, delete or update a node using the best bet repo lib functions.

In order to get a list of xp contents to pick from when we first create best bets, we use the [content search service](src/main/resources/services/contentSearch/contentSearch.ts). The service will expect an input parameter and run a query towards Data toolbox. This query will return a list that we fetch data from.

## Controller and View

Get page contributions and asset, service and content studio base urls from controller. Render react4xp component and thymeleaf.

react
axios, promise, states?, modal