"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type GeneralOption = {
  id: string;
  name: string;
  grouping?: string;
  is_essential?: boolean;
};

type SearchableSelectProps = {
  options: GeneralOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchableSelect({ options, value, onChange, placeholder = "Pilih opsi..." }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) => 
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (opt.grouping && opt.grouping.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedCategories = filteredOptions.reduce((acc: any, cat: GeneralOption) => {
    const groupKey = cat.grouping || "Lainnya";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(cat);
    return acc;
  }, {});

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className={cn(
          "w-full bg-black/40 border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "border-blue-500/50 ring-2 ring-blue-500/20" : "border-white/10 hover:border-white/20",
          !selectedOption ? "text-zinc-600" : "text-white"
        )}
      >
        <span className="truncate">
          {selectedOption ? `${selectedOption.name} ${selectedOption.is_essential ? '⭐' : ''}` : placeholder}
        </span>
        <ChevronDown size={16} className={cn("text-zinc-400 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-white/10 bg-black/20">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                autoFocus
                placeholder="Cari kategori..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-zinc-600"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2 category-scrollbar">
            {Object.keys(groupedCategories).length === 0 ? (
              <div className="p-4 text-center text-sm text-zinc-500">Tidak ada kategori yang cocok.</div>
            ) : (
              Object.keys(groupedCategories).map(groupName => (
                <div key={groupName} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10">
                    {groupName}
                  </div>
                  <div className="space-y-0.5">
                    {groupedCategories[groupName].map((cat: GeneralOption) => (
                      <div 
                        key={cat.id}
                        onClick={() => {
                          onChange(cat.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                          value === cat.id ? "bg-blue-500/20 text-blue-400" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span className="truncate">{cat.name} {cat.is_essential ? '⭐' : ''}</span>
                        {value === cat.id && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
