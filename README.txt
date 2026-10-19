THE TECH GEEKS / ALEX / PIXEL EDITION V4

WHAT CHANGED
- The copied Google Sites home / Digital Communications section has been removed.
- The pixel-art homepage remains in place.
- All seven topic pages use pixel-art module heroes, brighter high-contrast reading cards,
  an in-page file explorer, and previous/next navigation.
- Fixed the transparent background from Google Sites that was hiding dark text.
- Original Google Sites wording, spelling, paragraphs, inline emphasis,
  and picture files are imported without rewriting them.

FIRST-TIME SETUP (Windows)
1. Extract the entire ZIP. Keep all files together, including style.css and topic.js.
2. Double-click BUILD_WEBSITE.bat while connected to the internet.
3. Wait until the seven topic pages and original pictures finish downloading.
4. Double-click index.html to open the homepage.
5. Edit the extracted folder with VS Code.

The .bat launcher uses Windows PowerShell. No new software is installed.
Python users can alternatively run: python BUILD_WEBSITE.py

IMPORTANT
- The homepage is deliberately NOT imported from Google Sites. Running the
  build script again will not reintroduce Digital Communications.
- Re-running the script replaces ONLY the seven topic-page assessment content
  blocks with the CURRENT published Google Sites text. It does not replace
  the new design or the original homepage.
- For safety, manually review any copied images and formatting against
  the Google Sites pages before handing in your assignment.
- Don't double-click individual page files while they're still inside the ZIP.
  Extract the ZIP first so CSS, JavaScript and links work correctly.

FILES
  index.html                  Pixel-art homepage
  style.css                   All visual styling
  topic.js                    Topic-page navigation and progress
  binary-background.js        Floating 1s and 0s for every page
  networking.html             Networking
  history-of-the-internet.html History of the Internet
  bits-bytes.html             Bits & Bytes
  pixels-pictures.html        Pixels & Pictures
  interland.html              Interland
  artificial-intelligence.html AI
  sources.html                Sources
  BUILD_WEBSITE.bat           Windows launcher (no install)
  BUILD_WEBSITE.ps1           Windows importer
  BUILD_WEBSITE.py            Alternative Python importer
  assets/                     Original downloaded pictures after import

GOOGLE SITES ORIGINAL
https://sites.google.com/view/thetechgeeks/bits-bytes


FLOATING BINARY / V4 UPDATE
- Added many more gently floating 1s and 0s behind ALL pages.
- Colours: turquoise, pink, electric blue, yellow. Mobile density reduced.
- Respects reduced-motion preference. Decorative layer cannot block clicks.
- No changes made to existing assessment wording or original images.
- If you ALREADY imported text into V3: copy style.css and
  binary-background.js from V4 to your populated website folder,
  then add <script src="binary-background.js" defer></script> before
  </head> in each HTML page (or use the new HTML pages and re-import).
- To start afresh: extract the V4 ZIP and run BUILD_WEBSITE.bat
  while online, then view index.html in your browser.


V5 update: the floating 1s and 0s now also shift as you scroll, creating a subtle parallax effect across the website.

V6 update: the copied Google Sites information now uses the same dark navy,
neon borders and monospace tech font as the pixel-art homepage. The source
words, spelling, images, paragraph breaks and emphasis remain untouched.

IF YOU ALREADY IMPORTED ALL YOUR ASSESSMENT CONTENT IN V5:
You only need to copy V6's style.css over the existing style.css, then
refresh your browser with Ctrl+F5. This does not require re-importing.

IF YOU ARE STARTING FRESH:
Extract this ZIP, run BUILD_WEBSITE.bat once while online, then open
index.html. The importer fetches the original published Google Sites content.


V7 / BITS & BYTES BINARY LAB
- Text-to-binary converter added after the imported information, before original pictures.
- Characters are encoded using UTF-8 bytes (each displayed as eight bits).
- Type a message, see live binary, byte/bit totals, copy or clear.
- Original assessment words, spelling, formatting and image files remain unchanged.
- BUILD_WEBSITE.bat can be re-run: it only replaces the marked source-content
  area and leaves the interactive converter alone.

V8 / FOUR INTERACTIVE UPGRADES
- Pixel Art Creator: Pixels & Pictures, includes 8x8, 16x16 or 24x24 colour grid, RGB data calculations and PNG export.
- Interactive Network Diagram: Networking, click a device to learn its role and watch a simulated data packet.
- Interactive Internet Timeline: History of the Internet, selectable 1962, 1969, 1989 and 1991 milestones.
- IT Knowledge Quiz: New quiz.html page linked from the homepage and topic navigation. Seven questions, scoring and restart.

These demonstrations are outside the imported content markers. Re-running BUILD_WEBSITE.bat replaces ONLY published Google Sites text and original pictures on the seven source pages, without changing the interactive features.
Upload quiz.html and interactive-labs.js to GitHub along with the rest of the files.

V9 // SMOOTHER INTERACTIVE LABS
- Pixel Art Creator: smoothly animated painting, flood fill, Undo/Redo (40 changes),
  a sample pixel face, live thumbnail preview, and touch-friendly editing.
- History of the Internet: animated progress rail, smooth changing story card,
  keyboard arrow navigation, and an optional Play/Pause timeline tour.
- Networking: two new clickable devices (Modem and Switch), explanatory details,
  sample packet routes via the switch, router, modem and optional Wi-Fi hop.
- These features are separate from the ORIGINAL_CONTENT_START / END blocks.
  Re-importing via BUILD_WEBSITE.bat will not overwrite them.
- Motion-reduction system preference is respected.

V10: Smooth prismatic timeline. The old six-pixel decoration is removed; original assessment text remains untouched.

V13: Timeline milestone story cards maintain a consistent height across all four years.

V14 // AI SIMULATOR + MISSION CONTROL
- AI page: educational offline response simulator (prepared examples, not a real AI model).
  Includes prompt choices, a temperature slider, animated network diagram,
  low/medium/high sample responses and side-by-side style comparison.
- Homepage: Mission Control marks seven topic pages as visited, stores the
  best quiz score and whether the AI simulation was tried.
- Progress is saved on this browser only, using localStorage. It is never
  uploaded. Use RESET MY PROGRESS to clear it.
- Both additions are outside protected original Google Sites content markers.
- Run BUILD_WEBSITE.bat after extracting a fresh copy to import source text
  and pictures. Do not upload an unpopulated version to GitHub.
- Also upload ai-simulator.js and mission-control.js when publishing.

V15 changes:
- AI page: detailed five-stage animated network diagram with clickable stages, an
  educational description for each stage, moving signals, and visible process states.
- Expanded offline simulated responses: high temperature recombines prepared
  topic-specific examples (64 distinct combinations per supported topic).
- Network animation: dash offsets repeat at exact pattern multiples so glowing
  lines loop without visible jumps. No original assessment text altered.
