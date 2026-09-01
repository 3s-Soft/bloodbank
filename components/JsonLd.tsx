import type { JsonLd as JsonLdObject } from "@/lib/seo";

/**
 * Renders schema.org structured data.
 *
 * A server component on purpose: the payload is built from database rows and
 * must be in the HTML the crawler receives, not injected after hydration.
 *
 * `JSON.stringify` output is escaped for `<` so a value containing `</script>`
 * — an organization name is user-supplied — cannot close the tag and inject
 * markup.
 */
export default function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
    const payload = JSON.stringify(data).replace(/</g, "\\u003c");

    return (
        <script
            type="application/ld+json"
            // The value is serialized JSON with `<` escaped, never raw input.
            dangerouslySetInnerHTML={{ __html: payload }}
        />
    );
}
