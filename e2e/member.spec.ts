import { test, expect, _electron as electron, Page } from "@playwright/test";
import { testId } from "../src/pages/manager/options";
import { memberFormTestId } from "../src/pages/manager/components/member-form/options";
import { getLocalStorage, removeLocalStorageItem } from "./utils";

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

test("should be complete add a member with success", async () => {
  const expectContent = parseTestContentToExpectContent(testContent);

  const app = await electron.launch({ args: [".", "--no-sandbox"] });
  const page = await app.firstWindow();

  await removeLocalStorageItem(page, STORAGE_NAME);

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

  const [firstMember] = JSON.parse(localStorage.SPIDIUM_MEMBER_STORE_TEST).state
    .state.members;

  expect(firstMember).toMatchObject(expectContent);
});
