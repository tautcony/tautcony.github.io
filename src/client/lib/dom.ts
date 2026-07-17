/**
 * Lightweight DOM helpers for evergreen browsers.
 * Prefer `el()` over hand-rolled createElement trees or a mini-framework.
 */

/** Values that can appear as children of {@link el}. Arrays are flattened. */
export type DomChild =
    | Node
    | string
    | number
    | boolean
    | null
    | undefined
    | DomChild[];

/** CSS properties: camelCase (`marginTop`) or kebab-case (`margin-top`). */
export type StyleProps = Record<string, string | number | null | undefined>;

type TypedEventMap = HTMLElementEventMap & Record<string, Event>;

/**
 * Element props for {@link el}.
 * - `class` / `className` — CSS classes
 * - `style` — inline styles
 * - `dataset` — `data-*` attributes
 * - `on` — event listeners (`{ click: handler }`)
 * - other keys become attributes / DOM properties (booleans → presence attrs)
 */
export interface ElProps {
    class?: string;
    className?: string;
    id?: string;
    style?: StyleProps;
    dataset?: Record<string, string | number | boolean | null | undefined>;
    on?: {
        [K in keyof TypedEventMap]?: (this: HTMLElement, ev: TypedEventMap[K]) => void;
    };
    textContent?: string;
    innerHTML?: string;
    [attr: string]: unknown;
}

const PROPS_RESERVED = new Set([
    "class",
    "className",
    "id",
    "style",
    "dataset",
    "on",
    "textContent",
    "innerHTML",
]);

function isPlainProps(value: unknown): value is ElProps {
    return (
        value !== null
        && typeof value === "object"
        && !Array.isArray(value)
        && !(value instanceof Node)
    );
}

function appendChildren(parent: ParentNode, children: DomChild[]): void {
    for (const child of children) {
        if (child === null || child === undefined || child === false || child === true) {
            continue;
        }
        if (Array.isArray(child)) {
            appendChildren(parent, child);
            continue;
        }
        if (typeof child === "string" || typeof child === "number") {
            parent.append(document.createTextNode(String(child)));
            continue;
        }
        parent.append(child);
    }
}

function applyStyle(element: HTMLElement, style: StyleProps): void {
    for (const [key, value] of Object.entries(style)) {
        if (value === null || value === undefined) {
            continue;
        }
        const text = String(value);
        if (key.includes("-")) {
            element.style.setProperty(key, text);
        } else {
            // CSSStyleDeclaration accepts camelCase keys (e.g. marginTop, zIndex).
            Object.assign(element.style, { [key]: text });
        }
    }
}

function applyProps(element: HTMLElement, props: ElProps): void {
    if (props.class !== undefined || props.className !== undefined) {
        element.className = String(props.class ?? props.className ?? "");
    }
    if (props.id !== undefined) {
        element.id = String(props.id);
    }
    if (props.style) {
        applyStyle(element, props.style);
    }
    if (props.dataset) {
        for (const [key, value] of Object.entries(props.dataset)) {
            if (value === null || value === undefined) {
                delete element.dataset[key];
            } else {
                element.dataset[key] = String(value);
            }
        }
    }
    if (props.on) {
        for (const [type, listener] of Object.entries(props.on)) {
            if (listener) {
                element.addEventListener(type, listener as EventListener);
            }
        }
    }
    if (props.textContent !== undefined) {
        element.textContent = props.textContent;
    }
    if (props.innerHTML !== undefined) {
        element.innerHTML = props.innerHTML;
    }

    for (const [key, value] of Object.entries(props)) {
        if (PROPS_RESERVED.has(key) || value === undefined) {
            continue;
        }
        if (key.startsWith("on") && key.length > 2 && key[2] === key[2]?.toUpperCase()) {
            // onClick / onKeyDown → click / keydown
            const type = key.slice(2).toLowerCase();
            if (typeof value === "function") {
                element.addEventListener(type, value as EventListener);
            }
            continue;
        }
        if (typeof value === "boolean") {
            if (value) {
                element.setAttribute(key, "");
            } else {
                element.removeAttribute(key);
            }
            // Prefer IDL property when it exists (e.g. hidden, disabled).
            if (key in element) {
                (element as unknown as Record<string, unknown>)[key] = value;
            }
            continue;
        }
        if (key in element && key !== "list") {
            try {
                (element as unknown as Record<string, unknown>)[key] = value;
                continue;
            } catch {
                // fall through to attribute
            }
        }
        if (value !== null) {
            element.setAttribute(key, String(value));
        }
    }
}

/**
 * Create a typed HTML element (hyperscript-style).
 *
 * @example
 * el("button", { class: "btn", on: { click: () => {} } }, "Save")
 * el("ul", el("li", "one"), el("li", "two"))
 * el("div", { style: { marginTop: "1em" } }, [childA, childB])
 */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props?: ElProps | DomChild | null,
    ...children: DomChild[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    const childList: DomChild[] = [];

    if (isPlainProps(props)) {
        applyProps(element, props);
    } else if (props !== undefined && props !== null) {
        childList.push(props);
    }
    childList.push(...children);
    appendChildren(element, childList);
    return element;
}

