# ScreenReaderBridge

ScreenReaderBridge is a small TypeScript library for announcing text through an
ARIA live region. It is useful when an app needs a screen reader to read status
messages, validation updates, or other short captions without using generated
audio, the Web Audio API, or the Web Speech API.

The end user must have a screen reader such as NVDA, JAWS, VoiceOver, or TalkBack
running to hear the announcements.

## Install

```bash
npm install screen-reader-bridge
```

## Usage

Create or choose an element that will host the live region, apply the ARIA
attributes, then render messages into it.

```ts
import { ScreenReaderBridge } from "screen-reader-bridge";

const captionElement = document.getElementById("screen-reader-caption");

if (captionElement) {
    const bridge = new ScreenReaderBridge(captionElement, {
        configureElement: true
    });
    bridge.render("Saved successfully.");
}
```

Default imports are also supported:

```ts
import ScreenReaderBridge from "screen-reader-bridge";
```

The live region element must be present in the DOM. If you visually hide it,
use an off-screen CSS pattern rather than `display: none`, `visibility: hidden`,
or `aria-hidden="true"`, because hidden elements are not announced by screen
readers.

```html
<div id="screen-reader-caption" class="sr-only"></div>
```

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

### CommonJS

```js
const { ScreenReaderBridge } = require("screen-reader-bridge");
```

### Browser Script

A browser-global build is published for CDN or direct script use. It exposes the
class as `window.ScreenReaderBridge`.

```html
<script src="https://unpkg.com/screen-reader-bridge/dist/index.global.js"></script>
<script>
    const captionElement = document.getElementById("screen-reader-caption");
    ScreenReaderBridge.addAriaAttributes(captionElement);

    const bridge = new ScreenReaderBridge(captionElement);
    bridge.render("Loaded.");
</script>
```

## API

### `ScreenReaderBridge.addAriaAttributes(element, politenessLevel?)`

Adds the ARIA attributes needed for a status live region:

- `aria-live`: defaults to `assertive`
- `role`: `status`
- `aria-atomic`: `true`
- `aria-relevant`: `additions text`

`politenessLevel` is typed as `ScreenReaderBridgePolitenessLevel` and can be
`"off"`, `"polite"`, or `"assertive"`. The default is `"assertive"` because
most consumers use this package for messages that should be announced
immediately. Use `"polite"` when messages should wait behind other screen reader
output, but this is almost always not what you want.

### `new ScreenReaderBridge(captionElement, options?)`

Creates a bridge that writes messages into `captionElement`.

For backwards compatibility, `options` can be a
`ScreenReaderBridgeChildElementType` string:

```ts
const bridge = new ScreenReaderBridge(captionElement, "span");
```

For new code, prefer a `ScreenReaderBridgeOptions` object:

```ts
const bridge = new ScreenReaderBridge(captionElement, {
    childElementType: "span",
    configureElement: true,
    politenessLevel: "assertive"
});
```

`childElementType` defaults to `"div"` and can also be `"span"` when inline
children are preferred. `configureElement` defaults to `false`; when it is
`true`, the constructor calls `ScreenReaderBridge.addAriaAttributes()` for the
caption element. `politenessLevel` is used only when `configureElement` is
`true`.

### `bridge.render(text)`

Adds `text` to the live region so screen readers announce it. Repeated messages
are padded internally with non-breaking spaces so screen readers treat them as
changed text.

Old message nodes are hidden first and removed after a short delay. This reduces
DOM churn in the live region while keeping the newest announcement available.

### `bridge.clear()`

Removes all rendered message nodes from the live region and resets
`lastCreatedElement` to `null`.

### `bridge.lastCreatedElement`

Returns the most recent message element, or `null` before the first call to
`render`. This is mainly useful for testing and debugging.

### Exported Types

```ts
import type {
    ScreenReaderBridgeChildElementType,
    ScreenReaderBridgeOptions,
    ScreenReaderBridgePolitenessLevel
} from "screen-reader-bridge";

const politenessLevel: ScreenReaderBridgePolitenessLevel = "assertive";
const childElementType: ScreenReaderBridgeChildElementType = "span";
const options: ScreenReaderBridgeOptions = {
    childElementType,
    configureElement: true,
    politenessLevel
};
```

## Package Formats

The package exposes:

- ESM through `exports.import` and `module`
- CommonJS through `exports.require` and `main`
- TypeScript declarations through `exports.types` and `types`
- Browser-global output through `unpkg`, `jsdelivr`, and
  `dist/index.global.js`

## Development

```bash
npm install
npm test
npm run build
```

Other useful commands:

```bash
npm run lint-check
npm run clean
```

Contributions and bug reports are welcome through pull requests and GitHub
issues.
