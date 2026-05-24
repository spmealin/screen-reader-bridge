import ScreenReaderBridge, {
    ScreenReaderBridge as NamedScreenReaderBridge,
    type ScreenReaderBridgeChildElementType,
    type ScreenReaderBridgeOptions,
    type ScreenReaderBridgePolitenessLevel
} from "screen-reader-bridge";

const captionElement = document.createElement("div");
const politenessLevel: ScreenReaderBridgePolitenessLevel = "assertive";
const childElementType: ScreenReaderBridgeChildElementType = "span";
const options: ScreenReaderBridgeOptions = {
    childElementType,
    configureElement: true,
    politenessLevel
};

ScreenReaderBridge.addAriaAttributes(captionElement, politenessLevel);
NamedScreenReaderBridge.addAriaAttributes(captionElement, "polite");

const defaultBridge = new ScreenReaderBridge(captionElement, childElementType);
const namedBridge = new NamedScreenReaderBridge(captionElement, "div");
const optionsBridge = new ScreenReaderBridge(captionElement, options);

defaultBridge.render("Default import works");
namedBridge.render("Named import works");
optionsBridge.render("Options object works");

// @ts-expect-error Only valid aria-live politeness levels are accepted.
ScreenReaderBridge.addAriaAttributes(captionElement, "urgent");

// @ts-expect-error Only div and span child elements are supported.
new ScreenReaderBridge(captionElement, "p");

// @ts-expect-error Only valid aria-live politeness levels are accepted in options.
new ScreenReaderBridge(captionElement, { politenessLevel: "urgent" });
