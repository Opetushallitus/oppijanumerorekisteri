import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const isCI = !!process.env.CODEBUILD_BUILD_ID || !!process.env.GITHUB_ACTIONS;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './e2e',
    /* Maximum time one test can run for. */
    timeout: 30000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 15000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,
    /* Retry on CI only */
    retries: isCI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: isCI ? 1 : 4,
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
        baseURL: 'http://localhost:8686',
        headless: isCI,
        trace: isCI ? 'on-first-retry' : 'on',
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

    webServer: {
        command: 'PLAYWRIGHT=true NODE_ENV=development npx webpack serve',
        port: 8686,
        timeout: 120 * 1000,
        reuseExistingServer: false,
    },
};

export default config;
