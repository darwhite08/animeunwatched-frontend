"use client"

import { useState } from "react"
import FilterSection from "./FilterSection"
import FilterCheckboxGroup from "./FilterCheckboxGroup"
import { FILTER_CONFIG } from "./filterData"
import Image from "next/image"

interface Props {
  selectedFilters: Record<string, string[]>
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
}

export default function FilterDrawer({
  selectedFilters,
  setSelectedFilters,
}: Props) {
  const [showAdvanced, setShowAdvanced] =
    useState(false)

  return (
    <div className="sticky">

      {/* 🧑‍🌾 Character Sitting On Drawer */}
      <div className="absolute -top-[254px] right-20 z-20 hidden md:block pointer-events-none select-none">
        <Image
          src="/assets/png/luffy_sitting.png" // make sure file exists in /public/images
          alt="Anime Character"
          width={220}
          height={220}
          priority
          className="
            drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)]
            transition-transform duration-500
            hover:scale-105
          "
        />
      </div>

      {/* Drawer Card */}
      <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h3 className="text-lg font-semibold tracking-wide">
            Filters
          </h3>

          <button
            onClick={() => setSelectedFilters({})}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Reset
          </button>
        </div>

        {/* BASIC FILTERS */}
        <div>
          <h4 className="mb-6 text-xs uppercase tracking-wider text-white/40">
            Basic Filters
          </h4>

          {Object.entries(FILTER_CONFIG.basic).map(
            ([title, options]) => (
              <FilterSection
                key={title}
                title={title}
                 defaultOpen={false}
              >
                <FilterCheckboxGroup
                  title={title}
                  options={options}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              </FilterSection>
            )
          )}
        </div>

        {/* ADVANCED TOGGLE */}
        <button
          onClick={() =>
            setShowAdvanced(!showAdvanced)
          }
          className="
            mt-6 w-full rounded-lg
            border border-white/10
            bg-white/5
            py-2 text-sm
            hover:bg-white/10
            transition
          "
        >
          {showAdvanced
            ? "Hide Advanced Filters"
            : "Show Advanced Filters"}
        </button>

        {/* ADVANCED FILTERS */}
        {showAdvanced && (
          <div className="mt-8 border-t border-white/10 pt-8">
            <h4 className="mb-6 text-xs uppercase tracking-wider text-white/40">
              Advanced Filters
            </h4>

            {Object.entries(
              FILTER_CONFIG.advanced
            ).map(([title, options]) => (
              <FilterSection
                key={title}
                title={title}
                defaultOpen={false}
              >
                <FilterCheckboxGroup
                  title={title}
                  options={options}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              </FilterSection>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}