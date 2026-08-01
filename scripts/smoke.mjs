import { createServer } from 'vite';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ROUTES } from '../src/routes.js';

const RR_DOM = path.resolve('node_modules/react-router-dom/dist/index.mjs');
const RR = path.resolve('node_modules/react-router/dist/development/index.mjs');
const RR_DOM_EXPORT = path.resolve('node_modules/react-router/dist/development/dom-export.mjs');

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { disabled: true },
  resolve: {
    alias: [
      { find: 'react-router/dom', replacement: RR_DOM_EXPORT },
      { find: 'react-router-dom', replacement: RR_DOM },
      { find: 'react-router', replacement: RR },
    ],
  },
  ssr: { noExternal: ['react-router-dom', 'react-router'] },
});

const rrDomMod = await server.ssrLoadModule(RR_DOM);
const { MemoryRouter } = rrDomMod;

const memberMod = await server.ssrLoadModule('/src/memberContext.jsx');

function withProvider(comp) {
  const { MemberProvider } = memberMod;
  return React.createElement(MemberProvider, null, comp);
}

try {
  const pages = [
    ['LandingPage', ROUTES.home],
    ['Dashboard', ROUTES.dashboard],
    ['NewAssessment', ROUTES.assessment],
    ['AiAssessment', ROUTES.insights],
    ['FamilyMembers', ROUTES.family],
    ['HealthInsights', ROUTES.health],
    ['Reports', ROUTES.reports],
    ['PatientEducation', ROUTES.education],
    ['Settings', ROUTES.settings],
  ];

  for (const [name, path] of pages) {
    const mod = await server.ssrLoadModule(`/src/components/${name}.jsx`);
    const Comp = mod.default;
    const html = renderToString(
      withProvider(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Comp)))
    );
    if (!html || html.length < 100) throw new Error(`Suspiciously small render for ${name}`);
    console.log(`OK  ${name}  (${html.length} chars)`);
  }

  const appMod = await server.ssrLoadModule('/src/App.jsx');
  const App = appMod.default;

  const landing = renderToString(
    React.createElement(MemoryRouter, { initialEntries: [ROUTES.home] }, React.createElement(App))
  );
  if (!landing || landing.length < 100) throw new Error('Suspiciously small render for App landing');
  console.log(`OK  App (landing view)  (${landing.length} chars)`);

  const dash = renderToString(
    withProvider(React.createElement(MemoryRouter, { initialEntries: [ROUTES.dashboard] }, React.createElement(App)))
  );
  if (!dash || dash.length < 100) throw new Error('Suspiciously small render for App dashboard');
  console.log(`OK  App (dashboard view)  (${dash.length} chars)`);

  console.log('ALL SMOKE TESTS PASSED');
} finally {
  await server.close();
}
