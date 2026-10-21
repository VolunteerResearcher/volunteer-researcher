
"use client";

import { useState } from "react";
import { ResearchersHero } from "./researchers-hero";
import { ResearchersToolbar } from "./researchers-toolbar";
import { ResearchersList } from "./researchers-list";

export type PublicResearcher = {
  id: string;
  name: string;
  title: string;
  university: string;
  image: string;
  fields: string[];
  description: string;
  rating: number;
  reviewsCount: number;
};

type ResearchersPageProps = {
  researchers: PublicResearcher[];
};

export function ResearchersPage({
  researchers,
}: ResearchersPageProps) {
  const [showResearchers, setShowResearchers] = useState(true);

  return (
    <>
      <ResearchersHero />

      <ResearchersToolbar
        showResearchers={showResearchers}
        onToggleResearchers={() =>
          setShowResearchers((current) => !current)
        }
      />

      {showResearchers && (
        <ResearchersList researchers={researchers} />
      )}
    </>
  );
}
