# React4xp

## Server-side Rendering (SSR)

We should try to use server-side rendering for all react components because of crawlers or other that run the website without javascript. For now, there are at least one case where we can't use SSR for now, and that is where we need to use `dangerouslySetInnerHTML` for HTML Content. Remember to always sanitize input before using it in dangerouslySetInnerHTML. Ref. [issue](https://github.com/enonic/lib-react4xp/issues/33)

Example for SSR only: [Breadcrumbs.jsx](/src/main/resources/react4xp/_entries/Breadcrumb.jsx) and [default.es6](/src/main/resources/site/pages/default/default.es6)

## Hydrate (Without SSR)

If there are problems where SSR doesn't work at all, `ssr: false` can be used in render functions. We should try to never use it, because then the part will never be visible/rendered for non-js users.

## SSR and Hydrate

Hydration is needed for react components with client side interaction. You need to add pageContributions for this to work (ref. [factBox.ts](/src/main/resources/site/parts/factBox/factBox.ts)).

## LifeCycle and State

If we want to make more complex components/containers for react we can create classes that extends the React.Component class. This will open of for the possibility to use [state](https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class) and [lifecycles](https://reactjs.org/docs/react-component.html#the-component-lifecycle). Ref. [Header.jsx](/src/main/resources/react4xp/_entries/Header.jsx)

## Entries

It is important that any file in `react4xp/_entries` is not imported into any other file. An entry is a bridge between XP and React, not a reusable React component. They should only be used through the various render methods in `lib-react4xp` in our controllers.

After you've run `enonic project build` or `enonic project deploy` at least once, you'll have a file in your build folder with a list of all react4xp components available. `/build/resources/main/assets/react4xp/entries.json`
