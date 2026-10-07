import { test, expect } from '@playwright/test';
test('全画面が表示され、横にはみ出さない', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const route of ['home', 'news', 'shop', 'day', 'night', 'events', 'coupons']) {
    await page.goto('/#' + route);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
test('ナビゲーションとお知らせの絞り込み・展開', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation').filter({ visible: true });
  await nav.getByRole('link', { name: 'お知らせ', exact: true }).click();
  await expect(page).toHaveURL(/#news$/);
  await page.getByRole('button', { name: 'BAR', exact: true }).click();
  await expect(page.locator('details')).toHaveCount(1);
  await page.locator('summary').click();
  await expect(page.getByText('夜の営業内容・ドリンクメニューは、店舗確認後に掲載予定です。')).toBeVisible();
});
test('クーポンの保存、再読み込み、キャンセル、使用、リセット', async ({ page }) => {
  await page.goto('/#coupons');
  await page.getByRole('button', { name: /クーポンを保存/ }).click();
  await page.reload();
  await page.getByRole('button', { name: 'クーポンを使う', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'キャンセル' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'クーポンを使う', exact: true }).click();
  await page.getByRole('button', { name: '使用する', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '使用済みです' })).toBeDisabled();
  await page.getByRole('button', { name: '体験用クーポンをリセット' }).click();
  await expect(page.getByRole('button', { name: /クーポンを保存/ })).toBeVisible();
});
test('最小幅でも読みやすい表示', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ['home', 'day', 'night', 'shop', 'coupons']) {
    await page.goto('/#' + route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
