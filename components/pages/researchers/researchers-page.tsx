"use client";

import { useState } from "react";
import { ResearchersHero } from "./researchers-hero";
import { ResearchersToolbar } from "./researchers-toolbar";
import { ResearchersList } from "./researchers-list";

export function ResearchersPage() {
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

      {showResearchers && <ResearchersList />}
    </>
  );
}