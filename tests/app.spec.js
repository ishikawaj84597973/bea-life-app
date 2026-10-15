import { test, expect } from '@playwright/test';
test('全画面が表示され、横にはみ出さない', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const route of ['home', 'news', 'shop', 'day', 'night', 'events', 'coupons', 'stamps']) {
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

test('スタンプの保存・10回の来店・特典利用・リセットとクーポンの独立', async ({ page }) => {
  await page.goto('/#coupons');
  await page.getByRole('button', { name: /クーポンを保存/ }).click();
  await page.goto('/#stamps');
  await page.getByRole('button', { name: 'スタンプカードを保存する' }).click();
  await expect(page.getByRole('button', { name: '特典を利用する', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'スタンプを追加（体験版）', exact: true }).click();
  await page.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await expect(page.locator('.stamped')).toHaveCount(0);
  for (let i=1; i<=10; i++) {
    await page.getByRole('button', { name: 'スタンプを追加（体験版）', exact: true }).click();
    await page.getByRole('button', { name: '確認して実行', exact: true }).click();
    await expect(page.locator('.stamped')).toHaveCount(i);
  }
  await page.reload();
  await expect(page.locator('.stamped')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'スタンプを追加（体験版）', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '特典を利用する', exact: true }).click();
  await page.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await expect(page.getByRole('button', { name: '特典を利用する', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '特典を利用する', exact: true }).click();
  await page.getByRole('button', { name: '確認して実行', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '特典利用済み', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '体験用スタンプカードをリセット' }).click();
  await page.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await expect(page.locator('.stamped')).toHaveCount(10);
  await page.getByRole('button', { name: '体験用スタンプカードをリセット' }).click();
  await page.getByRole('button', { name: '確認して実行', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'スタンプカードを保存する' })).toBeVisible();
  await expect(page.locator('.stamped')).toHaveCount(0);
  await page.goto('/#coupons');
  await expect(page.getByRole('button', { name: 'クーポンを使う', exact: true })).toBeVisible();
});

test('スタンプへの導線と狭い画面・保存失敗', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'スタンプカードを見る ↗', exact: true }).click();
  await expect(page).toHaveURL(/#stamps$/);
  await page.setViewportSize({width:320,height:700});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.getByRole('button', { name: 'スタンプカードを保存する' }).click();
  await expect(page.getByRole('status')).toContainText('保存できませんでした');
  await expect(page.getByRole('button', { name: 'スタンプカードを保存する' })).toBeVisible();
});
