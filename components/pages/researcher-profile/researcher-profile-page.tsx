import { ProfileHero } from "./profile-hero";
import { ProfileCard } from "./profile-card";
import { ResearcherAbout } from "./researcher-about";

export function ResearcherProfilePage() {
  return (
    <>
      <ProfileHero />

      <ProfileCard
        name="د. مشاري العنزي"
        title="أستاذ مشارك في الهندسة الكهربائية"
        location="سكاكا - المملكة العربية السعودية"
        university="جامعة الجوف"
        image="/brand/researcher.png"
        fields={[
          "الذكاء الاصطناعي",
          "تعلم الآلة",
          "تحليل البيانات",
        ]}
      />

      <ResearcherAbout
        description="باحث متخصص في علوم الحاسب، مهتم بمجالات الذكاء الاصطناعي وتعلم الآلة وتحليل البيانات، ويسعى إلى توظيف التقنيات الحديثة في تطوير حلول مبتكرة ودعم البحث العلمي وإنتاج أبحاث ذات أثر يسهم في خدمة المجتمع."
      />
    </>
  );
}