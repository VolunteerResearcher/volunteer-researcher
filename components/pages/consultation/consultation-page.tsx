
"use client";

import { useState } from "react";

import { ConsultationHero } from "./consultation-hero";
import { ConsultationType } from "./consultation-type";
import { RequesterInfo } from "./requester-info";
import { ConsultationForm } from "./consultation-form";

type ConsultationMode = "researcher" | "field";

export function ConsultationPage() {
  const [consultationMode, setConsultationMode] =
    useState<ConsultationMode>("researcher");

  const [requestedResearcherId, setRequestedResearcherId] =
    useState("");

  const [researchField, setResearchField] = useState("");

  const resetConsultationSelection = () => {
    setConsultationMode("researcher");
    setRequestedResearcherId("");
    setResearchField("");
  };

  return (
    <>
      <ConsultationHero />

      <ConsultationType
        mode={consultationMode}
        onModeChange={setConsultationMode}
        requestedResearcherId={requestedResearcherId}
        onRequestedResearcherChange={
          setRequestedResearcherId
        }
        researchField={researchField}
        onResearchFieldChange={setResearchField}
      />

      <RequesterInfo />

      <ConsultationForm
        consultationMode={consultationMode}
        requestedResearcherId={requestedResearcherId}
        researchField={researchField}
        onResetConsultationSelection={
          resetConsultationSelection
        }
      />
    </>
  );
}
