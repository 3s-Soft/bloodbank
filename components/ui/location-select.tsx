"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, MapPin } from "lucide-react";
import { districts, getUpazilasForDistrict } from "@/lib/data/locations";

interface LocationSelectProps {
    type: "district" | "upazila";
    value: string;
    onChange: (value: string) => void;
    district?: string; // Required when type is "upazila"
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function LocationSelect({
    type,
    value,
    onChange,
    district,
    placeholder,
    error,
    disabled = false,
    className = "",
}: LocationSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get options based on type
    const options = type === "district"
        ? districts
        : district
            ? getUpazilasForDistrict(district)
            : [];

    // Filter options by search
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset upazila when district changes
    useEffect(() => {
        if (type === "upazila" && district && value) {
            const upazilas = getUpazilasForDistrict(district);
            if (!upazilas.includes(value)) {
                onChange("");
            }
        }
    }, [district, type, value, onChange]);

    const handleSelect = (opt: string) => {
        onChange(opt);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    const displayPlaceholder = placeholder || (type === "district" ? "Select District" : "Select Upazila");

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled || (type === "upazila" && !district)}
                className={`w-full h-10 px-4 pr-10 text-left rounded-xl border transition-all flex items-center gap-2 ${error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:ring-2 focus:ring-red-500/50"
                    } ${disabled || (type === "upazila" && !district)
                        ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800 hover:border-slate-600"
                    } outline-none`}
            >
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className={value ? "text-white text-sm" : "text-slate-500 text-sm"}>
                    {value || displayPlaceholder}
                </span>

                {/* Clear button — uses span to avoid nested <button> */}
                {value && !disabled && (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={handleClear}
                        onKeyDown={(e) => { if (e.key === "Enter") handleClear(e as any); }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                )}

                {/* Chevron */}
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={`Search ${type}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-600 bg-slate-900 focus:ring-2 focus:ring-red-500/50 outline-none text-sm text-white placeholder-slate-500"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm">
                                {type === "upazila" && !district
                                    ? "Select a district first"
                                    : searchQuery
                                        ? "No matches found"
                                        : "No options available"}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${value === opt ? "bg-red-500/10 text-red-400 font-medium" : "text-slate-300"
                                        }`}
                                >
                                    <MapPin className={`w-3.5 h-3.5 ${value === opt ? "text-red-400" : "text-slate-600"}`} />
                                    {opt}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
}

// Blood Group Select Component
interface BloodGroupSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    className?: string;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function BloodGroupSelect({
    value,
    onChange,
    error,
    disabled = false,
    className = "",
}: BloodGroupSelectProps) {
    return (
        <div className={className}>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {bloodGroups.map((group) => (
                    <button
                        key={group}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(value === group ? "" : group)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${value === group
                            ? "bg-red-600 text-white shadow-lg scale-105"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {group}
                    </button>
                ))}
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
            )}
        </div>
    );
}
