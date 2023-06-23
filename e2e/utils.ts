import { Page, _electron } from "@playwright/test";

export const removeLocalStorageItem = async (page: Page, storeName: string) => {
  await page.addInitScript((storeNameToRemove) => {
    console.log("removing storage", storeNameToRemove);
    window.localStorage.removeItem(storeNameToRemove);
  }, storeName);

  await page.waitForTimeout(1000);
  await page.reload();
  await page.waitForTimeout(2000);
};

const DEFAULT_MEMBER_STORE = '{"state":{"state":{"members":[]}},"version":0}';

export const setLocalStorageKey = (page: Page, key: string, data: string) => {
  return page.addInitScript(
    ([localStorageKey, value]) => {
      window.localStorage.setItem(localStorageKey, value);
      console.log(`localStorage.setItem: ${localStorageKey}`, value);
    },
    [key, data]
  );
};

export const resetMemberStore = (page: Page, storeName: string) => {
  return setLocalStorageKey(page, storeName, DEFAULT_MEMBER_STORE);
};

export const getLocalStorage = (page: Page) =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.localStorage)));

export const run = () => {
  return _electron.launch({ args: [".", "--no-sandbox"] });
};
