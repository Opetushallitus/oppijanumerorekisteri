import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './e2e',
    /* Maximum time one test can run for. */
    timeout: 15 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : 4,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['list', { printSteps: true }],
        [
            'junit',
            {
                outputFile: 'playwright-results/junit-playwright-js-unit.xml',
            },
        ],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        actionTimeout: 0,
        baseURL: 'http://localhost:3000',
        headless: !!process.env.CI,
        trace: process.env.CI ? 'on-first-retry' : 'on',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'playwright-results/',

    /* Run your local dev server before starting the tests */
    webServer: [
        {
            command: 'npm start',
            port: 3000,
            timeout: 30 * 1000,
            reuseExistingServer: true,
        },
        {
            cwd: 'mock-api',
            command: 'npm run mock-api',
            port: 8080,
            timeout: 10 * 1000,
            reuseExistingServer: true,
        },
    ],
};

export default config;
