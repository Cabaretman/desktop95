# Desktop 95

A Windows 95-style browser desktop with Explorer, Recycle Bin, Notepad,
Calculator, Paint, Minesweeper, Solitaire, MS-DOS Prompt, AI Chat, and
Settings. Includes movable icons, desktop context menus and selection
boxes, a boot sequence with startup audio, and shutdown/restart dialogs.

Live site: https://rafay-desktop-95.robustcreek66.chatgpt.site

## Run locally

Use Node.js 22.13 or newer:

```sh
npm ci
npm run dev -- --port 5173
```

Open http://localhost:5173. The vanilla desktop assets live in `public/`.
Vinext supplies the server routes and the Sites hosting integration.

```sh
npm test
npm run build
```

## Files, games, and desktop

Explorer supports folders, text files, renaming, moving, and soft deletion.
Notepad saves directly to the browser's file store. The Recycle Bin can
restore items or permanently empty its contents after confirmation.
Use Save As to export important text files; clearing browser storage
removes local files and saved conversations. This is a browser file store,
not access to the computer's actual disk.

Minesweeper uses a 9-by-9 board with ten mines and a safe first reveal.
Right-click or use Flag mode to flag a cell. Solitaire uses Klondike rules
with draw one, waste recycling, foundation moves, and undo. Select a card
or run, then click a destination; double-click a top card to send it home.

Type HELP in MS-DOS Prompt for supported commands. It operates on the
same virtual files as Explorer. Desktop icon positions are saved locally.

## AI chat

AI Chat saves conversations in this browser and supports new threads,
export, and deletion. No sign-in is required. Choose Connection in AI Chat
or open Settings and enter a provider endpoint, model ID, and API key.

Requests go directly from the browser to the chosen HTTPS provider. The
provider must support the chat-completions format and allow browser
requests (CORS). API usage is charged to the user's provider account.

The key is held only in page memory, not local storage, cookies, server
secrets, source files, or conversation exports. Refreshing the page or
choosing Clear API key removes it. Changing the endpoint also clears the
key, so it cannot accidentally be reused for a different provider.
Endpoint and model preferences are saved locally. Browser scripts and
extensions with access to the page may still access a session key; this
is a user-supplied browser credential, not a server-side secret.

## Assets

Pixel icons and synthesized effects are original. The system fonts come
from 98.css; their license is included in `public/fonts/LICENSE.txt`.
The Windows 95 startup recording is a Microsoft asset retrieved from:
https://cs.gettysburg.edu/~duncjo01/archive/icons/OEM/windows/Windows%2095/noise/mssound.wav

This is an independent recreation, unaffiliated with Microsoft or Win95GPT.
Third-party names and assets remain the property of their respective owners.
