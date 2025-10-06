import { Page } from '@playwright/test';

export const toastWithText = (page: Page, text: string) => page.locator('.oph-ds-toast').filter({ hasText: text });
