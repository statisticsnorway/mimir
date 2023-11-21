window.addEventListener('ComponentLoadedEvent', (e) => {
  console.log('editModeUpdate.js')
  console.log(e)
  setTimeout(() => {
    // src/executor.ts
    var inlineJsonElements = Array.from(document.querySelectorAll(`[data-react4xp-id][data-config]`)).map((e) => ({
      config: JSON.parse(JSON.parse(decodeURIComponent(e.dataset.config))),
      react4xpRef: e.dataset.react4xpId,
    }))

    for (let index = 0; index < inlineJsonElements.length; index++) {
      const inlineJsonElement = inlineJsonElements[index]
      const id = inlineJsonElement.react4xpRef
      let data = inlineJsonElement.config
      const target = document.getElementById(id)
      if (target && target === e.detail.newComponentView.el.el.children[0]) {
        const { command, devMode, hasRegions, isPage, jsxPath, props } = data
        globalThis['MimirReact4xpClient'][command](
          globalThis['MimirReact4xp'][jsxPath],
          id,
          props,
          isPage,
          hasRegions,
          devMode
        )
      }
    }
  }, 200)
})
