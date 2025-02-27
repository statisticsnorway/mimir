# React4xp

## Server-side Rendering (SSR)

Server-side rendering (SSR) ensures that content is available to web crawlers and users who may have disabled JavaScript. React components should be server-side rendered whenever possible. There are specific cases where server-side rendering cannot be applied, and that is where we need to use `dangerouslySetInnerHTML` when inserting HTML content that cannot be safely handled otherwise. Always sanitize inputs before using it in `dangerouslySetInnerHTML± to minimize security risks. For more details, refer to this [issue](https://github.com/enonic/lib-react4xp/issues/33)

Here is an example of a server-side rendered component: [Breadcrumbs.tsx](/src/main/resources/react4xp/_entries/Breadcrumb.tsx) and [default.ts](/src/main/resources/site/pages/default/default.ts)

## Hydrate (Without SSR)

In scenarios where a React component cannot be server-side rendered, you can pass the parameter `ssr: false` in the React4xp render function for client-side rendering. However, this should be avoided whenever possible, as components rendered without server-side rendering will not be visible to non-JavaScript users or in edit mode in Content Studio.

## SSR and Hydrate

Hydration is neccessary for React components that require client-side interaction. You must include the `pageContributions` parameter in the React4xp render function, along with `ssr: false`. (See [glossary.ts](/src/main/resources/site/macros/glossary/glossary.ts) as an example).

## State and Side Effects

To create more complex components in React, we can use a combination of functional components and React hooks. This approach allows us to manage [state](https://react.dev/learn/state-a-components-memory) and handle [side effects](https://react.dev/learn/synchronizing-with-effects), among other things, in a more concise and efficient way. (See [Header.tsx](/src/main/resources/react4xp/_entries/Header.tsx) as an example).

[Learn more about hooks here.](https://react.dev/reference/react/hooks)

## Entries

It is important that files within the `react4xp/_entries` directory is not imported into any other file. An entry is a bridge between XP and React, not a reusable React component. They should only be used through the various render methods in `lib-react4xp` in our controllers.

After you've run `enonic project build` or `enonic project deploy` at least once, you'll have a file in your build folder with a list of all react4xp components available. `/build/resources/main/react4xp/_entries`
