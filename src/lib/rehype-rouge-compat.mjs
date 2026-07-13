/**
 * S1 highlighter DOM: wrap fenced code as Rouge/Jekyll-compatible structure.
 * Output: div.highlighter-rouge.language-X > div.highlight > pre.highlight > code
 */

function hasClass(node, name) {
    const c = node.properties?.className;
    if (Array.isArray(c)) return c.map(String).includes(name);
    if (typeof c === "string") return c.split(/\s+/).includes(name);
    return false;
}

function addClass(node, name) {
    const c = node.properties?.className;
    if (Array.isArray(c)) {
        if (!c.map(String).includes(name)) c.push(name);
        return;
    }
    if (typeof c === "string" && c.length) {
        node.properties.className = c.split(/\s+/).includes(name) ? c : `${c} ${name}`;
        return;
    }
    node.properties = node.properties || {};
    node.properties.className = [name];
}

function langFromCode(code) {
    const c = code.properties?.className;
    const list = Array.isArray(c)
        ? c.map(String)
        : typeof c === "string"
          ? c.split(/\s+/)
          : [];
    const hit = list.find((x) => x.startsWith("language-"));
    return hit ? hit.slice("language-".length) : undefined;
}

function walk(parent) {
    const children = parent.children;
    if (!children) return;

    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (!node || node.type !== "element") continue;

        if (hasClass(node, "highlighter-rouge")) {
            walk(node);
            continue;
        }

        if (node.tagName === "pre") {
            const code = node.children?.find(
                (c) => c.type === "element" && c.tagName === "code"
            );
            if (code) {
                const lang = langFromCode(code);
                addClass(node, "highlight");
                children[i] = {
                    type: "element",
                    tagName: "div",
                    properties: {
                        className: lang
                            ? ["highlighter-rouge", `language-${lang}`]
                            : ["highlighter-rouge"],
                    },
                    children: [
                        {
                            type: "element",
                            tagName: "div",
                            properties: { className: ["highlight"] },
                            children: [node],
                        },
                    ],
                };
                continue;
            }
        }

        walk(node);
    }
}

export function rehypeRougeCompat() {
    return (tree) => {
        walk(tree);
    };
}

export default rehypeRougeCompat;
