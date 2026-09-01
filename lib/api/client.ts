import type { ApiError, ApiSuccess } from "@/lib/types";

/**
 * Typed fetch helper for client components.
 *
 * Every route answers with `{ data }` or `{ error }`, so unwrapping and error
 * handling live here instead of being repeated at ~30 call sites that each
 * checked `response.ok` slightly differently.
 */

export class ApiRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly details?: unknown,
    ) {
        super(message);
        this.name = "ApiRequestError";
    }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...init,
        headers: {
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
            ...init?.headers,
        },
    });

    let payload: ApiSuccess<T> | ApiError | null = null;
    try {
        payload = (await response.json()) as ApiSuccess<T> | ApiError;
    } catch {
        // A non-JSON body (a proxy error page, an empty 204) is handled below.
    }

    if (!response.ok) {
        const message =
            payload && "error" in payload ? payload.error : `Request failed (${response.status})`;
        throw new ApiRequestError(
            message,
            response.status,
            payload && "details" in payload ? payload.details : undefined,
        );
    }

    if (!payload || !("data" in payload)) {
        throw new ApiRequestError("Malformed response from server", response.status);
    }

    return payload.data;
}

export function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
    return request<T>(url, { ...init, method: "GET" });
}

export function apiPost<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(url, {
        ...init,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

export function apiPut<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(url, {
        ...init,
        method: "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

export function apiDelete<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(url, {
        ...init,
        method: "DELETE",
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

/** Builds a query string, dropping empty values. */
export function query(params: Record<string, string | number | boolean | undefined | null>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        search.set(key, String(value));
    }
    return search.toString();
}
