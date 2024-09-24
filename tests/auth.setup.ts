import { test as setup } from '@playwright/test'
import user from '../.auth/user.json'
import fs from 'fs'
import path from 'path'

const authFile = path.join(__dirname, '..', '.auth', 'user.json')

// Reset storage state for this file to avoid being authenticated
//test.use({storageState: '.auth/noAth.json'})
//test.use({ storageState: { cookies: [], origins: [] } });


// setup.skip('authenticate User Using Locators', async({page}) => {

//     // Perform authentication steps.
//     await page.goto('https://conduit.bondaracademy.com')
//     await page.getByText('Sign in').click()
//     await page.getByRole('textbox', {name: "Email"}).fill('afterlife094@gmail.com')
//     await page.getByRole('textbox', {name: "Password"}).fill('pwd12345')
//     await page.getByRole('button').click()

//     //Wait until the page receives the cookies.

//     //Wait for the final URL to ensure that the cookies are actully set/
//     await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

//     // End of authentication steps.
//     console.log(authFile)

//     await page.context().storageState({path: authFile})
// })

setup('authentication', async({request}) => {
  // Send authentication request
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {"email": "afterlife094@gmail.com", "password": "pwd12345"}
    }
  })
  
  const responseBody = await response.json()
  const accessToken = responseBody.user.token
  user.origins[0].localStorage[0].value = accessToken
  fs.writeFileSync(authFile, JSON.stringify(user))

  process.env['ACCESS_TOKEN'] = accessToken
})


