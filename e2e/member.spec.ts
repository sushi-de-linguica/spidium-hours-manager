import { test, expect, Page, ElectronApplication } from "@playwright/test";
import { testId } from "../src/pages/manager/options";
import { memberFormTestId } from "../src/pages/manager/components/member-form/options";
import { memberTabTestId } from "../src/pages/manager/tabs/member/options";
import {
  getLocalStorage,
  resetMemberStore,
  run,
  setLocalStorageKey,
} from "./utils";

const STORAGE_NAME = "SPIDIUM_MEMBER_STORE_TEST";

const testContent = {
  [memberFormTestId.PRONOUN_FIELD]: "ele/dele",
  [memberFormTestId.NICKNAME_FIELD]: "SushiDeLinguiça",
  [memberFormTestId.PRIMARY_TWITCH]: "sushidelinguica",
  [memberFormTestId.SECONDARY_TWITCH]: "hotrolldelinguica",
  [memberFormTestId.SOCIALS_FIELD]: "linktr.ee/sushidelinguica",
};

const parseTestContentToExpectContent = (content: any) => ({
  gender: content[memberFormTestId.PRONOUN_FIELD],
  name: content[memberFormTestId.NICKNAME_FIELD],
  primaryTwitch: content[memberFormTestId.PRIMARY_TWITCH],
  secondaryTwitch: content[memberFormTestId.SECONDARY_TWITCH],
  streamAt: content[memberFormTestId.PRIMARY_TWITCH],
  link: content[memberFormTestId.SOCIALS_FIELD],
});

const expectContent = parseTestContentToExpectContent(testContent);

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  const newApp = await run();
  app = newApp;
  page = await newApp.firstWindow();
  await resetMemberStore(page, STORAGE_NAME);
  await page.reload();
  await page.waitForTimeout(1000);
});

test.describe("Member tests", () => {
  test("should create a new member with success", async () => {
    await page.getByTestId(testId.TAB_MEMBER_BUTTON).click();

    const newMemberButton = page.getByTestId(memberFormTestId.NEW_BUTTON);
    const saveAndUpdateButton = page.getByTestId(
      memberFormTestId.SAVE_AND_UPDATE_BUTTON
    );

    await newMemberButton.click();

    const dialogTitle = page.getByTestId(memberFormTestId.DIALOG_TITLE);
    await expect(dialogTitle).toHaveText("Adicionar membro");

    for (const testId of Object.keys(testContent)) {
      const field = page.getByTestId(testId);
      await field.click();
      await field.type(testContent[testId]);
    }

    await saveAndUpdateButton.click();
    const localStorage = await getLocalStorage(page);

    const [firstMember] = JSON.parse(localStorage.SPIDIUM_MEMBER_STORE_TEST)
      .state.state.members;

    expect(firstMember).toMatchObject(expectContent);
  });

  test("should be show member at datagrid list", async () => {
    const dataToMock =
      '{"state":{"state":{"members":[{"gender":"ele/dele","name":"SushiDeLinguiça","primaryTwitch":"sushidelinguica","secondaryTwitch":"hotrolldelinguica","streamAt":"sushidelinguica","link":"linktr.ee/sushidelinguica","id":"e73f6151-d99b-42f6-b2ff-7a694d12f9a7"}]}},"version":0}';
    await setLocalStorageKey(page, STORAGE_NAME, dataToMock);
    await page.reload();
    await page.getByTestId(testId.TAB_MEMBER_BUTTON).click();
    await page.waitForTimeout(1000);

    const datagridRow = page.getByTestId(memberTabTestId.DATAGRID_ROW).first();
    const columns = datagridRow.getByRole("cell");

    const contents = await columns.allTextContents();

    const [_, name, pronoun, primaryTwitch, secondaryTwitch, streamAt, link] =
      contents;

    expect(name).toBe(expectContent.name);
    expect(pronoun).toBe(expectContent.gender);
    expect(primaryTwitch).toBe(expectContent.primaryTwitch);
    expect(secondaryTwitch).toBe(expectContent.secondaryTwitch);
    expect(streamAt).toBe(expectContent.streamAt);
    expect(link).toBe(expectContent.link);
  });
});
