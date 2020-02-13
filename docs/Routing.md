Routing
==

Dynamic routing
--
The routing works by targeting a source content, and then pointing a target content.
All requests that hits the path after the source content path, will be farwarded to the target
content. Without any changes to the url.

The configuration of new routes are made in the site configuration. 

The file `/src/main/resources/filters/router.es6` is handling all the route logic. 

To tell Enonic that all requests should go through 
the `router.es6` a `mapping` is registered in `site.xml`.

