import { test, expect, request } from '@playwright/test';
import  tags from '../test-data/tags.json'

// https://conduit-api.bondaracademy.com/api/tags
// https://conduit-api.bondaracademy.com/api/articles/NmTrn-article-389-8807/favorite


test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async route => {
    console.log('Intercepted API call to /api/tags');
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://conduit.bondaracademy.com')

  // Wait for the Tag's response after page load
  //const response_tags = await page.waitForResponse('*/**/api/tags');
  // Optionally, you can verify the response content
  //console.log(await response_tags.json())
  //await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
})

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response_article = await route.fetch()
    const responseBody = await response_article.json()
    responseBody.articles[0].title = "This is our MOCK test title"
    responseBody.articles[0].description = "This a MOCK description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('.sidebar')).toContainText('Automation')
  
  await expect(page.locator('app-article-list h1').first()).toContainText('This is our MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This a MOCK description')
});

//email: afterlife094@gmail.com
//acc: nmtrn_qa_engineer/nmtrn_qa
//pwd: pwd12345
//url: https://conduit-api.bondaracademy.com/api/users/login
test('delete artice using ui', async({page, request}) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {"email": "afterlife094@gmail.com", "password": "pwd12345"}
    }
  })
  
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleRespone = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data:  {
      article: {title: "NmTrn article " + Math.floor(Math.random() * 1000), description: "This is a description", body: "This is a body", tagList: []}
    },

    headers: {
      Authorization: `Token ${accessToken}`
    }
  })

  expect(articleRespone.status()).toEqual(201)

  // Parse the JSON response
  const responseData = await articleRespone.json();
  // Access the article title
  const articleTitle = responseData.article.title;
  console.log('Article Title:', articleTitle, 'has been created')

  await page.getByText('Global Feed').click()
  await page.getByText(articleTitle).click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  console.log('Article Title:', articleTitle, 'has been deleted')
  await page.getByText('Global Feed').click()
})

test('create article', async({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name:'Article Title'}).fill('Playwright is awesome')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the Playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('We like to use Playwright for automation')
  await page.getByRole('button', {name:'Publish Article'}).click()

  // Get the Respone and extract the slug-id
  const articleResponeAfterPublising = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponeBody = await articleResponeAfterPublising.json();
  const slugid = articleResponeBody.article.slug;

  await expect(page.locator('h1')).toContainText('Playwright is awesome')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is awesome')

  //Log in and get the access otken
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {"email": "afterlife094@gmail.com", "password": "pwd12345"}
    }
  })
  
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  //Do the REQUEST DELETE
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugid}`, {
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })

  expect(deleteArticleResponse.status()).toEqual(204)
})