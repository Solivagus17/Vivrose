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
      { find: '@', replacement: path.resolve('src') },
      { find: 'react-router/dom', replacement: RR_DOM_EXPORT },
      { find: 'react-router-dom', replacement: RR_DOM },
      { find: 'react-router', replacement: RR },
    ],
  },
  ssr: { noExternal: ['react-router-dom', 'react-router', 'motion', 'react-use-measure'] },
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
    ['AiAssistant', ROUTES.aiAssistant],
    ['NewAssessment', ROUTES.assessment],
    ['AiAssessment', ROUTES.insights],
    ['PastInsights', ROUTES.pastInsights],
    ['FamilyMembers', ROUTES.family],
    ['HealthInsights', ROUTES.health],
    ['Reports', ROUTES.reports],
    ['UploadReport', ROUTES.reportsUpload],
    ['GenerateReport', ROUTES.generateReport],
    ['Doctors', ROUTES.doctors],
    ['AddDoctor', ROUTES.doctorsAdd],
    ['AddCheckup', ROUTES.checkupsAdd],
    ['Medicines', ROUTES.medicines],
    ['AddMedicine', ROUTES.medicinesAdd],
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

  for (const name of ['Login', 'Register']) {
    const mod = await server.ssrLoadModule(`/src/pages/${name}.jsx`);
    const Comp = mod.default;
    const html = renderToString(
      React.createElement(MemoryRouter, { initialEntries: [`/${name.toLowerCase()}`] }, React.createElement(Comp))
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
  if (!dash.includes('auth-loading')) throw new Error('App dashboard should be behind the auth gate during SSR');
  console.log(`OK  App (dashboard view, auth-gated)  (${dash.length} chars)`);

  const editPath = ROUTES.reportsEdit.replace(':id', 'rep-seed-1');
  const edit = renderToString(
    withProvider(React.createElement(MemoryRouter, { initialEntries: [editPath] }, React.createElement(App)))
  );
  if (!edit.includes('auth-loading')) throw new Error('App edit view should be behind the auth gate during SSR');
  console.log(`OK  App (edit report view, auth-gated)  (${edit.length} chars)`);

  console.log('ALL SMOKE TESTS PASSED');
} finally {
  await server.close();
}
