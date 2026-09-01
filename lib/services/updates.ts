/**
 * Builds the change set for a partial update.
 *
 * Update services all faced the same problem: a partial input where an absent
 * key means "leave it alone" and an empty string from a cleared form field
 * means "store null". Written out field by field, that is a long chain of
 * `if (input.x !== undefined) updates.x = input.x || null` — one branch per
 * column, repeated in every service, and easy to get subtly wrong by omitting
 * a field or dropping the `|| null`.
 *
 * Passing the column list instead states the same intent once.
 */
export function definedFields<TSource extends Record<string, unknown>>(
    input: TSource,
    keys: readonly (keyof TSource)[],
): Partial<TSource> {
    const updates: Partial<TSource> = {};

    for (const key of keys) {
        const value = input[key];

        // Absent means "not being changed", which is different from being
        // cleared. Only an explicitly provided value reaches the update.
        if (value === undefined) continue;

        // A cleared text input arrives as "". Columns are nullable, so store
        // null rather than an empty string, keeping "no value" single-valued.
        updates[key] = (value === "" ? null : value) as TSource[keyof TSource];
    }

    return updates;
}
