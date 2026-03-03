import { useState } from "react";
import JobHunter from "./JobHunter";
import ProfileSetup from "./ProfileSetup";

export default function App() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = sessionStorage.getItem("jh_profile");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleSave = (p) => {
    sessionStorage.setItem("jh_profile", JSON.stringify(p));
    setProfile(p);
  };

  const handleReset = () => {
    sessionStorage.removeItem("jh_profile");
    setProfile(null);
  };

  if (!profile) return <ProfileSetup onSave={handleSave} />;
  return <JobHunter profile={profile} onReset={handleReset} />;
}
