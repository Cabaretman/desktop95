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
export, and deletion. Requests go through `/api/chat`; API credentials are
never accepted from or returned to the browser.

Configure `AI_API_KEY` and `AI_MODEL` using Sites runtime secrets. Optional
`AI_ENDPOINT` defaults to the OpenAI chat-completions endpoint. Set
`OWNER_EMAIL` to the authorized account; the server defaults to this
project's owner. The endpoint checks Sites-provided identity on every
request and rejects anonymous visitors, other accounts, and cross-origin
POSTs. Public access to the desktop does not grant access to the AI key.

`.env.example` lists configuration names only. Keep actual credentials out
of source control, browser assets, and `.openai/hosting.json`. Live provider
calls require the server secret and a model; otherwise chat reports that
configuration is missing. For OpenAI key provisioning through Codex, enable
the OpenAI Developers plugin and use its API-key workflow.

## Assets

Pixel icons and synthesized effects are original. The system fonts come
from 98.css; their license is included in `public/fonts/LICENSE.txt`.
The Windows 95 startup recording is a Microsoft asset retrieved from:
https://cs.gettysburg.edu/~duncjo01/archive/icons/OEM/windows/Windows%2095/noise/mssound.wav

This is an independent recreation, unaffiliated with Microsoft or Win95GPT.
Third-party names and assets remain the property of their respective owners.
