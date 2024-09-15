import {test as setup} from '@playwright/test'
import { AsyncLocalStorage } from 'async_hooks';
import * as path from 'path';


const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate User Using Locators', async({page}) => {

    // Perform authentication steps.
    await page.goto('https://conduit.bondaracademy.com')
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', {name: "Email"}).fill('afterlife094@gmail.com')
    await page.getByRole('textbox', {name: "Password"}).fill('pwd12345')
    await page.getByRole('button').click()

    //Wait until the page receives the cookies.

    //Wait for the final URL to ensure that the cookies are actully set/
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    // End of authentication steps.
    console.log(authFile)
    await page.context().storageState({path: authFile})
})

setup('authenticate Using API', async({request}) => {
  // Send authentication request
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {"email": "afterlife094@gmail.com", "password": "pwd12345"}
    }
  })
  
  const responseBody = await response.json()
  const accessToken = responseBody.user.token
})


