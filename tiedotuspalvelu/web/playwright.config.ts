import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const backendPort = Number(process.env.SERVER_PORT);

const isCI = !!process.env.CODEBUILD_BUILD_ID || !!process.env.GITHUB_ACTIONS;

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list", { printSteps: true }],
    ["html", { open: isCI ? "never" : "always" }],
    [
      "junit",
      {
        outputFile: "playwright-results/junit-playwright-js-unit.xml",
      },
    ],
  ],
  use: {
    actionTimeout: 0,
    baseURL: `http://localhost:${backendPort}`,
    headless: isCI,
    trace: isCI ? "on-first-retry" : "on",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  outputDir: "playwright-results/",
};

export default config;
