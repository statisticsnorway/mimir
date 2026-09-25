import { type Request, type Response } from '@enonic-types/core'
import {
  migrateStatisticsContentTypeWithShortname,
  type StatisticsShortnameMigrationSummary,
} from '/lib/ssb/statreg/migrateStatisticsContentTypeWithShortname'

function renderSummary(summary: StatisticsShortnameMigrationSummary): string {
  return `
    <h2>Summary</h2>
    <ul>
      <li>Total: <code>${summary.total}</code></li>
      <li>Migrated: <code>${summary.migrated}</code></li>
      <li>Skipped missing statistic: <code>${summary.skippedMissingStatistic}</code></li>
      <li>Skipped missing shortname: <code>${summary.skippedMissingShortname}</code></li>
      <li>Skipped already updated: <code>${summary.skippedAlreadyUpdated}</code></li>
      <li>Failed: <code>${summary.failed}</code></li>
    </ul>
  `
}

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
      button[disabled] { cursor: wait; opacity: 0.7; }
      code { background: #f3f3f3; padding: 0.1rem 0.3rem; }
      .status { margin-top: 1rem; font-weight: 600; }
      .status[hidden] { display: none; }
    </style>
  </head>
  <body>
    ${body}
    <script>
      (function () {
        var form = document.getElementById('statistics-shortname-migration-form');
        if (!form) {
          return;
        }

        form.addEventListener('submit', function () {
          var button = document.getElementById('statistics-shortname-migration-button');
          var status = document.getElementById('statistics-shortname-migration-status');

          if (button) {
            button.setAttribute('disabled', 'disabled');
            button.textContent = 'Running migration...';
          }

          if (status) {
            status.removeAttribute('hidden');
          }
        });
      })();
    </script>
  </body>
</html>`,
  }
}

export function get(req: Request): Response {
  if (req.params?.run === 'true') {
    const summary = migrateStatisticsContentTypeWithShortname()

    return renderPage(`
      <h1>Statistics Shortname Migration</h1>
      <p>Migration completed.</p>
      ${renderSummary(summary)}
      <p><a href="?">Back</a></p>
    `)
  }

  return renderPage(`
    <h1>Statistics Shortname Migration</h1>
    <p>This runs a one-off migration that updates <code>data.shortname</code> from the existing <code>data.statistic</code> value on all <code>${app.name}:statistics</code> content.</p>
    <form id="statistics-shortname-migration-form" method="get">
      <input type="hidden" name="run" value="true" />
      <button id="statistics-shortname-migration-button" type="submit">Run Migration</button>
    </form>
    <p id="statistics-shortname-migration-status" class="status" hidden>Migration is running. This page will update when it finishes.</p>
  `)
}
