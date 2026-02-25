"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function DocSearch({ defaultValue = "" }: { defaultValue?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [inputValue, setInputValue] = useState(defaultValue);

    function handleSearch(term: string) {
        setInputValue(term);
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.replace(`?${params.toString()}`, { scroll: false });
        });
    }

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
                type="text"
                placeholder="Search platform guides..."
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-800 border-none text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
            />
            {isPending && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
