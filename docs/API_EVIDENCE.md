<!--
Purpose: Records the real Banana API call, the reply, and two failures.
Theme: Interoperability
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Banana API evidence

The React app does not call this API. The evidence below is from `server/scripts/testBananaApi.js`, run on 25 October 2026 with `npm run test:banana` in the `server` folder.

Documentation page: https://marcconrad.com/uob/banana/doc.php

## What the documentation says

- Base URL written in the docs: `http://marcconrad.com/uob/banana/api.php`
- Optional `out` parameter. Default is `json`.
- Optional `base64` parameter. Default is `no`, which means the reply contains a link to the picture.
- `out=csv` is also offered. This project does not use CSV.

## What a real call showed

Calling the documented `http` address returns **301 Moved Permanently** to the `https` address. The server therefore calls https directly:

`https://marcconrad.com/uob/banana/api.php?out=json`

### Successful request (25 Oct 2026, 11:51 UTC)

Status: `200 OK`

Headers that matter:

| Header | Value |
| --- | --- |
| content-type | `text/html` |
| server | `Apache` |
| access-control-allow-origin | `*` |

The body was JSON even though the content type says HTML:

```json
{ "question" : "https://www.sanfoh.com/uob/banana/data/t7474a643b918bf0eb2b310f5b7n18.png" , "solution" : 8 }
```

Meaning of the fields, from this real reply:

| Field | What it is |
| --- | --- |
| `question` | A link to a PNG puzzle. The picture is hosted on `www.sanfoh.com`, not on the API path. |
| `solution` | The missing digit, as a number from 0 to 9. In this example it was `8`. |

Our `GET /api/puzzle` route reads those two fields, stores `solution` in server memory, and sends the browser only `puzzleId` and `imageUrl`. A checked response had the keys `success`, `puzzleId`, and `imageUrl`. It did not contain `solution`.

The browser then loads the PNG from the link, so the player can see the picture. That image request is not a call to `api.php`.

## Failure: wrong URL

Request: `https://marcconrad.com/uob/banana/not-a-real-endpoint.php`

Status: `404 Not Found`

Content-Type: `text/html`

The body is an HTML error page, starting with:

```html
<html>
<head>
<title>Error - File Not Found</title>
</head>
<body>
<big><b>Error 404 - File Not Found</b></big>
```

`GET /api/puzzle` treats that as a bad gateway and returns **502** with `{ "success": false, "message": "The Banana API returned an error status." }`. Checked on 25 Oct 2026.

## Failure: timeout

The same real URL was called with a 1 millisecond limit.

```text
Request failed
Error name: TimeoutError
Error message: The operation was aborted due to timeout
```

`GET /api/puzzle` maps that kind of abort to **504** with `{ "success": false, "message": "The Banana API took too long to answer." }`. Checked on 25 Oct 2026 with `BANANA_TIMEOUT_MS=1`.

## What can go wrong

| Problem | What the server returns |
| --- | --- |
| Site unreachable, or the body is not JSON | 502 |
| HTTP status is not 200, including a wrong URL | 502 |
| JSON has no image link, or the solution is not a digit 0–9 | 502 |
| The call exceeds 8 seconds | 504 |
