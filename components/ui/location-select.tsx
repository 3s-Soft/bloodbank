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
                className={`w-full h-12 px-4 pr-10 text-left rounded-xl border transition-all flex items-center gap-2 ${error
                        ? "border-red-500 focus:ring-red-500"
                        : "border-neutral-200 focus:ring-2 focus:ring-red-500"
                    } ${disabled || (type === "upazila" && !district)
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : "bg-white hover:border-neutral-300"
                    } outline-none`}
            >
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className={value ? "text-neutral-900" : "text-neutral-400"}>
                    {value || displayPlaceholder}
                </span>

                {/* Clear button */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"
                    >
                        <X className="w-4 h-4 text-neutral-400" />
                    </button>
                )}

                {/* Chevron */}
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-neutral-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={`Search ${type}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-8 text-center text-neutral-500 text-sm">
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
                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 transition-colors flex items-center gap-2 ${value === opt ? "bg-red-50 text-red-600 font-medium" : "text-neutral-700"
                                        }`}
                                >
                                    <MapPin className={`w-4 h-4 ${value === opt ? "text-red-500" : "text-neutral-300"}`} />
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
            <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((group) => (
                    <button
                        key={group}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(group)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${value === group
                                ? "bg-red-600 text-white shadow-lg scale-105"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
