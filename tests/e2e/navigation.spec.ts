import { expect, test } from '@playwright/test';

test('navigates from home to guided path', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Learn how one electromagnetic reality/i })).toBeVisible();
  await page.getByRole('link', { name: 'Start guided path' }).click();
  await expect(page).toHaveURL(/\/guided/);
  await expect(page.getByRole('heading', { name: /What -> Why -> How -> Compare/i })).toBeVisible();
});
