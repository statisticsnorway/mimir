import { type Request, type Response } from '@enonic-types/core'
import { submitTask } from '/lib/xp/task'

const TASK_DESCRIPTOR = `${app.name}:updateStatisticsContentTypeWithShortname`

function renderPage(body: string): Response {
  return {
    contentType: 'text/html',
    body: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Statistics Shortname Migration</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; max-width: 48rem; }
      button { font: inherit; padding: 0.6rem 1rem; }
      code { background: #f3f3f3; padding: 0.1rem 0.3rem; }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`,
  }
}

export function get(req: Request): Response {
  if (req.params?.run === 'true') {
    const taskId = submitTask({
      descriptor: TASK_DESCRIPTOR,
    })

    return renderPage(`
      <h1>Statistics Shortname Migration</h1>
      <p>Started task <code>${taskId}</code>.</p>
      <p>Check the XP admin task list and application logs for progress.</p>
      <p><a href="?">Back</a></p>
    `)
  }

  return renderPage(`
    <h1>Statistics Shortname Migration</h1>
    <p>This runs a one-off task that updates <code>data.shortname</code> from the existing <code>data.statistic</code> value on all <code>${app.name}:statistics</code> content.</p>
    <form method="get">
      <input type="hidden" name="run" value="true" />
      <button type="submit">Run Migration</button>
    </form>
  `)
}
