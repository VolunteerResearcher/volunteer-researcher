
import { ProfileHero } from "./profile-hero";
import { ProfileCard } from "./profile-card";
import { ResearcherAbout } from "./researcher-about";

export type ResearcherProfileData = {
  id: string;
  name: string;
  title: string;
  location: string;
  university: string;
  image: string;
  fields: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  cvUrl?: string;
};

type ResearcherProfilePageProps = {
  researcher: ResearcherProfileData;
};

export function ResearcherProfilePage({
  researcher,
}: ResearcherProfilePageProps) {
  return (
    <>
      <ProfileHero />

      <ProfileCard
        name={researcher.name}
        title={researcher.title}
        location={researcher.location}
        university={researcher.university}
        fields={researcher.fields}
        rating={researcher.rating}
        reviewsCount={researcher.reviewsCount}
        
      />

      <ResearcherAbout
        description={researcher.description}
      />
    </>
  );
}
