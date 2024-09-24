import {expect, test} from '@playwright/test'
import {faker} from '@faker-js/faker'

test.skip('excesire 0923', async({page, request}) => {
    // Send authentication request

    const username = faker.internet.userName()
    const password = faker.internet.password() + '#'

    console.log(password)

    const response = await request.post('https://demoqa.com/Account/v1/User', {
    data: {
        "userName": username,
        "password": password
      }
  })

  const responseBody = await response.json()
  console.log(responseBody)

  expect(response.status()).toEqual(201)
  expect(responseBody.username).toEqual(username)
})

test('excesire 0924', async({page}) => {
    const fruits = [{name: 'Cam', id: 4}, {name: 'Táo', id: 2}, {name: 'Xoài', id: 8}];
    //const json_fruits = [{"name": "Cam", "id": 4}, {"name": "Táo", "id": 2}, {"name": "Xoài", "id": 8}];

    //console.log(json_fruits)
    //console.log(JSON.stringify(fruits))

    // Mock the api call before navigating
    await page.route('*/**/api/v1/fruits', async route => {
        await route.fulfill({body: JSON.stringify(fruits)});
    });

    // Go to the page
    await page.goto('https://demo.playwright.dev/api-mocking/');

    // Assert that the Strawberry fruit is visible
    await expect(page.getByText('Cam')).toBeVisible()
})

test("mocks a fruit and doesn't call api", async ({ page }) => {
    // Mock the api call before navigating
    await page.route('*/**/api/v1/fruits', async route => {
        const json = [{name: 'Cam', id: 4}, {name: 'Táo', id: 2}, {name: 'Xoài', id: 8}];
        await route.fulfill({ json });
    });
    // Go to the page
    await page.goto('https://demo.playwright.dev/api-mocking');
  
    // Assert that the Strawberry fruit is visible
    await expect(page.getByText('Cam')).toBeVisible()

});