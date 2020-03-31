# How to set up Google authentication

Each developer needs to create a project on their google account in order to be able to set up Google's OAuth.

Go to this link: https://developers.google.com/identity/sign-in/web/sign-in and click on "Configure a Project."

-Call the project "splash-sign-in"

-The product name shown on the OAuth screen is "Splash"

-The code is going to be called from a web browser

-The name of the JavaScript Origin is "http://localhost:8080"

When the project is created Google will provide you with a "credentials.json" file.

In your development directory create a file called .env.local. This will be ignored by github and stores environment variables for Vue to use. These values will be compiled into the source before being sent to the client so don't put any secrets in here! https://cli.vuejs.org/guide/mode-and-env.html#modes

So now this file should look like this (use the value from your credentials.json file):

`
VUE_APP_CLIENT_ID=your-client-id #only put in the string of characters before the ".apps.googleusercontent.com"
`

