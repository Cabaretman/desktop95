# Desktop 95

A Windows 95-style browser desktop with AI Chat, Notepad, Calculator,
Paint, and Settings. Includes pixel icons, bitmap-style system text,
movable windows, a taskbar, a boot sequence, and startup sound effects.

Live site: https://rafay-desktop-95.robustcreek66.chatgpt.site

## Run locally

Serve `dist/` using a static HTTP server, for example:

```sh
python -m http.server 5173 --directory dist
```

Open http://localhost:5173. No build or package installation is required.

## AI chat

In Settings, enter an HTTPS chat-completions endpoint and model ID.
The provider must allow browser requests. An optional API key remains
in memory for the current page session. Messages go directly to the
configured provider. Notes and appearance settings stay in local storage.

## Assets

Pixel icons and synthesized effects are original. The system fonts come
from 98.css; their license is included in `dist/fonts/LICENSE.txt`.
The Windows 95 startup recording is a Microsoft asset retrieved from:
https://cs.gettysburg.edu/~duncjo01/archive/icons/OEM/windows/Windows%2095/noise/mssound.wav

This is an independent recreation, unaffiliated with Microsoft or Win95GPT.
Third-party names and assets remain the property of their respective owners.
