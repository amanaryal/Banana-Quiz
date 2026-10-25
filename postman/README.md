<!--
Purpose: How to run the automatic Postman tests for Banana Quiz.
Theme: All four themes
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Postman tests

1. Start the app from the Banana Quiz folder with `npm run dev`. MongoDB must be running.
2. In Postman, choose Import and pick `Banana-Quiz.postman_collection.json`.
3. Open the collection, then Run collection. Leave the order as it is. Click Run Banana Quiz API.
4. Every request has a Tests tab. Postman runs those checks by itself and marks each one pass or fail.

The first request creates a new test player, so you can run the collection again. The login cookie is saved by Postman and sent on the later requests.

These checks are not in the collection, because Postman cannot wait on a clock or click the page:

- Wait 17 seconds on Hard, then send a digit. Expect 400 `Too late`.
- The 360 px layout, the logout modal, and the number pad. Check those in the browser.
