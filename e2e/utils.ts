import { Page } from "@playwright/test";

export const removeLocalStorageItem = (page: Page, storeName: string) =>
  page.evaluate(([storeName]) => window.localStorage.removeItem, [storeName]);

export const getLocalStorage = (page: Page) =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.localStorage)));
