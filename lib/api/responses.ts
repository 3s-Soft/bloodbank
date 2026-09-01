import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiError, ApiSuccess } from "@/lib/types";

/**
 * One response shape for every route: `{ data }` on success, `{ error }` on
 * failure. Handlers previously returned bare arrays, `{ success: true, ... }`,
 * and `{ error }` interchangeably, which made client code guess.
 */

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
    return NextResponse.json({ data }, init);
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
    return ok(data, { status: 201 });
}

export function badRequest(error: string, details?: unknown): NextResponse<ApiError> {
    return NextResponse.json({ error, details }, { status: 400 });
}

export function unauthorized(error = "Authentication required"): NextResponse<ApiError> {
    return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "You do not have access to this resource"): NextResponse<ApiError> {
    return NextResponse.json({ error }, { status: 403 });
}

export function notFound(error = "Not found"): NextResponse<ApiError> {
    return NextResponse.json({ error }, { status: 404 });
}

export function conflict(error: string): NextResponse<ApiError> {
    return NextResponse.json({ error }, { status: 409 });
}

export function serverError(error = "Internal Server Error"): NextResponse<ApiError> {
    return NextResponse.json({ error }, { status: 500 });
}

/**
 * Thrown by guards and services to abort a request with a specific status.
 * `withErrorHandling` turns it into a response, so handlers do not need to
 * thread error branches back up through their return type.
 */
export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly details?: unknown,
    ) {
        super(message);
        this.name = "HttpError";
    }
}

type RouteHandler<TArgs extends unknown[]> = (
    ...args: TArgs
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler so validation and thrown HttpErrors become responses,
 * replacing the try/catch that was duplicated in all 27 route files.
 */
export function withErrorHandling<TArgs extends unknown[]>(
    handler: RouteHandler<TArgs>,
): RouteHandler<TArgs> {
    return async (...args: TArgs) => {
        try {
            return await handler(...args);
        } catch (error) {
            if (error instanceof HttpError) {
                return NextResponse.json(
                    { error: error.message, details: error.details },
                    { status: error.status },
                );
            }

            if (error instanceof ZodError) {
                return badRequest("Invalid request", error.issues);
            }

            // MySQL surfaces duplicate keys as a driver error; without this the
            // caller sees an opaque 500 for a recoverable conflict.
            if (isDuplicateEntryError(error)) {
                return conflict("That value is already taken");
            }

            console.error("Unhandled route error:", error);
            return serverError();
        }
    };
}

function isDuplicateEntryError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ER_DUP_ENTRY"
    );
}

/** Reads query-string parameters into a plain object for Zod to parse. */
export function searchParams(request: Request): Record<string, string> {
    return Object.fromEntries(new URL(request.url).searchParams.entries());
}
