import assert from "node:assert/strict";
import test from "node:test";
import {
    getProductDisplayTagsByPlacement,
    normalizeProductDisplayTags,
} from "../shared/types/product-display-tag.ts";

function createTag(
    id: string,
    placement:
        | "card_top_left"
        | "card_top_right"
        | "card_bottom_left"
        | "card_bottom_right"
        | "under_price",
    overrides: Record<string, unknown> = {},
) {
    return {
        id,
        name: `Tag ${id}`,
        text_color: "#ffffff",
        background_color: "#000000",
        font_weight: "normal",
        placement,
        ...overrides,
    };
}

test("returns no tags for null and empty values", () => {
    assert.deepEqual(normalizeProductDisplayTags(null), []);
    assert.deepEqual(normalizeProductDisplayTags([]), []);
});

test("filters a tag placed under the price", () => {
    const tags = [createTag("price", "under_price")];

    assert.deepEqual(
        getProductDisplayTagsByPlacement(tags, "under_price"),
        tags,
    );
});

test("supports all four card corners", () => {
    const placements = [
        "card_top_left",
        "card_top_right",
        "card_bottom_left",
        "card_bottom_right",
    ] as const;
    const tags = placements.map((placement) => createTag(placement, placement));

    for (const placement of placements) {
        assert.equal(
            getProductDisplayTagsByPlacement(tags, placement).length,
            1,
        );
    }
});

test("keeps multiple tags in the same position and their order", () => {
    const tags = [
        createTag("first", "card_top_left"),
        createTag("second", "card_top_left"),
    ];

    assert.deepEqual(
        getProductDisplayTagsByPlacement(tags, "card_top_left").map(
            (tag) => tag.id,
        ),
        ["first", "second"],
    );
});

test("preserves admin colors and normal or bold font weight", () => {
    const tags = [
        createTag("light", "under_price", {
            text_color: "#111111",
            background_color: "#ffffff",
            font_weight: "normal",
        }),
        createTag("dark", "under_price", {
            text_color: "#ffffff",
            background_color: "#111111",
            font_weight: "bold",
        }),
    ];

    assert.deepEqual(normalizeProductDisplayTags(tags), tags);
});

test("preserves a long tag name for CSS wrapping", () => {
    const name =
        "Очень длинное название витринного тега, которое должно переноситься";
    const [tag] = normalizeProductDisplayTags([
        createTag("long", "under_price", { name }),
    ]);

    assert.equal(tag?.name, name);
});

test("drops unknown placements and malformed values", () => {
    const tags = [
        createTag("unknown", "under_price", { placement: "product_tag" }),
        createTag("invalid-weight", "under_price", {
            font_weight: "semibold",
        }),
    ];

    assert.deepEqual(normalizeProductDisplayTags(tags), []);
});

test("does not treat standard Medusa product.tags as display tags", () => {
    const product = {
        tags: [createTag("standard", "under_price")],
    };

    assert.deepEqual(
        normalizeProductDisplayTags(
            (product as { product_display_tags?: unknown })
                .product_display_tags,
        ),
        [],
    );
});
