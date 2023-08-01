# Rendering of parts
We use the React library to rendrer most HTML in our app. 

<dl>
  <dt>Render</dt>
  <dd>Executing code (JSX is code) to generate HTML.</dd>

  <dt>Server-side rendering (ssr)</dt>
  <dd>The server <em>renders</em> the HTML on the server side, and sends it to the client. The client recieves a complete HTML document, JavaScript and data.</dd>

  <dt>Client-side rendering</dt>
  <dd>The server only send JavaScript and data to the client, the client then <em>renders</em> the HTML itself.</dd>

  <dt>Hydration</dt>
  <dd>After server-side rendering, the client will render everything again. This is to compare the results and warn for mismatch, aswell as to make the HTML interactive. The server can render the HTML, but the client needs to attach event listeners, onClicks etc.</dd>
</dl>

In our parts we can choose if we want it to be server-side or client-side rendered, aswell as if we want hydration or not. As per the definition above, we need hydration if we have interactivity in our code. If our code has no event listeners, hooks etc, nothing except outputting some HTML, we can turn off hydration. This is a performance improvement since the server then does not have to send JavaScript and data along with the HTML for that part. 

Tweak these options in the [React4xp render function](https://developer.enonic.com/docs/react4xp/stable/api#react4xp_render):

```
render('Divider', props, req, {
  hydrate: false,
  ssr: true
})
```