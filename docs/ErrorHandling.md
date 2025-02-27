Error handling and pages
==
(coming)

Error handling in parts
==
Since there are many ways a part can fail, it is wise to 
do some extra fail handling. In case of an error only the part should 
fail gracefully, instead of crashing the whole page.

One easy way to assure only the part fails, are to wrap the logic 
in the controller in a try catch. And have one function that creates 
the part content and rendering in the try part, and a error rendering
function in the catch part.

```&typescript
import { renderError } from '/lib/error/error' 

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {

  ... part logic ...
}
```

Use the `renderError` function from `/bli/error/error` to show a generic error view.
