"use client";

import { useState } from "react";

import { FilterHero } from "./filter-hero";
import {
  FilterForm,
  type ResearchFilters,
} from "./filter-form";
import { FilterResults } from "./filter-results";

export function ResearchersFilterPage() {
  const [searchFilters, setSearchFilters] =
    useState<ResearchFilters | null>(null);

  return (
    <>
      <FilterHero />

      <FilterForm
        onSearch={(filters) => {
          setSearchFilters(filters);
        }}
      />

      <FilterResults filters={searchFilters} />
    </>
  );
}