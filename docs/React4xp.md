# React4xp

## Server-side Rendering (SSR)

We should try to use server-side rendering for all React components because of crawlers or users that run the website without javascript. For now, there are at least one case where we can't use SSR for now, and that is where we need to use `dangerouslySetInnerHTML` for HTML Content. Remember to always sanitize input before using it in dangerouslySetInnerHTML. Ref. [issue](https://github.com/enonic/lib-react4xp/issues/33)

Example for SSR only: [Breadcrumbs.tsx](/src/main/resources/react4xp/_entries/Breadcrumb.tsx) and [default.ts](/src/main/resources/site/pages/default/default.ts)

## Hydrate (Without SSR)

If there are cases where a React component cannot be server-side rendered, the parameter `ssr: false` can be passed in the React4xp render function. We should try to avoid that as much as possible, because the part will not be visible/rendered for non-js users, or in edit mode in Content Studio.

## SSR and Hydrate

Hydration is needed for React components with client-side interaction. You need to pass the `pageContributions` parameter in the React4xp render function for this to work (See [glossary.ts](/src/main/resources/site/macros/glossary/glossary.ts) as an example).

## State and Side Effects

To create more complex components in React, we can use a combination of functional components and React hooks. This approach allows us to manage [state](https://react.dev/learn/state-a-components-memory) and handle [side effects](https://react.dev/learn/synchronizing-with-effects), among other things, in a more concise and efficient way. (See [Header.tsx](/src/main/resources/react4xp/_entries/Header.tsx) as an example).

[Learn more about hooks here.](https://react.dev/reference/react/hooks)

## Entries

It is important that any file in `react4xp/_entries` is not imported into any other file. An entry is a bridge between XP and React, not a reusable React component. They should only be used through the various render methods in `lib-react4xp` in our controllers.

After you've run `enonic project build` or `enonic project deploy` at least once, you'll have a file in your build folder with a list of all react4xp components available. `/build/resources/main/assets/react4xp/entries.json`
