"use client";

import React from "react";
import { Input } from "./input";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    label,
    error,
}) => {
    const presets = [
        { color: "#ef4444", name: "Red" },
        { color: "#3b82f6", name: "Blue" },
        { color: "#10b981", name: "Green" },
        { color: "#8b5cf6", name: "Purple" },
        { color: "#f59e0b", name: "Orange" },
        { color: "#06b6d4", name: "Teal" },
        { color: "#ec4899", name: "Pink" },
        { color: "#6366f1", name: "Indigo" },
    ];

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-slate-300 ml-1">
                    {label}
                </label>
            )}

            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="w-16 h-16 rounded-2xl border-2 border-slate-800 shadow-lg transition-transform group-hover:scale-105"
                            style={{ backgroundColor: value }}
                        />
                    </div>

                    <div className="flex-1">
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="#000000"
                            className="font-mono uppercase"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                    {presets.map((preset) => (
                        <button
                            key={preset.color}
                            type="button"
                            onClick={() => onChange(preset.color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${value.toLowerCase() === preset.color.toLowerCase()
                                    ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                    : "border-slate-800 hover:border-slate-600"
                                }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                        />
                    ))}
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-500 ml-1 mt-1 font-medium italic">
                    {error}
                </p>
            )}
        </div>
    );
};
