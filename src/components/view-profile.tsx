"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { ref, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  GraduationCap,
  CalendarDays,
  MessageCircleQuestion,
  Award,
  Building2,
  Stethoscope,
  BookOpen,
} from "lucide-react";

export type UserData = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  type?: string;
  medicalId?: string | null;
  subSpecialty?: string[];
  profileEducation?: { school: string; residency: string; training: string }[];
  schedule?: {
    clinic: string;
    description: string;
    day: string;
    time: string;
    fee: number;
  }[];
  faq?: { question: string; answer: string }[];
  profileDescription?: string;
  profileExperience?: number;
  profileCertification?: string[];
  profileAffiliation?: string[];
  doctors?: string[];
  secretaries?: string[];
  requestedTo?: string[];
  requestedBy?: string[];
  field?: string | null;
  profileImage?: string;
};

// ── Shared with EditProfile ────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
      <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          {title}
        </h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

function getAvatar(id: string, type?: string) {
  return type?.toLowerCase() === "doctor"
    ? `https://i.pravatar.cc/150?u=doctor-${id}`
    : `https://i.pravatar.cc/150?u=secretary-${id}`;
}

function ProfileView({
  userData,
  uid,
  isDoctor,
}: {
  userData: UserData;
  uid: string;
  isDoctor: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCurrentUser = user?.uid === uid;
  const isAdmin = (user as any)?.role === "admin";

  return (
    <div className="px-4 md:px-8 lg:px-12">
      <Card className="p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* ── PAGE HEADER ── */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-[#00a896]/10 flex items-center justify-center">
                <User className="w-7 h-7 text-[#00a896]" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              {isDoctor
                ? `Dr. ${userData.firstName} ${userData.lastName}`
                : `${userData.firstName} ${userData.lastName}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {userData.field || (isDoctor ? "Doctor" : "Secretary")}
            </p>
            <div className="mt-4 h-1 w-16 bg-[#00c4b4] rounded-full mx-auto" />
          </div>

          {/* ── AVATAR CARD ── */}
          <div className="flex items-center gap-5 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={userData.profileImage || getAvatar(uid, userData.type)}
              />
              <AvatarFallback className="bg-[#00a896]/10 text-[#00a896] font-semibold text-lg">
                {userData.firstName?.[0]}
                {userData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {isDoctor ? "Dr. " : ""}
                {userData.firstName} {userData.lastName}
              </p>
              <span className="inline-block mt-1 text-xs bg-[#00a896]/10 text-[#00a896] px-2 py-0.5 rounded-full font-medium">
                {userData.type || "user"}
              </span>
            </div>
          </div>

          {/* ── PROFESSIONAL DETAILS ── */}
          <div className="space-y-4">
            <SectionHeader
              icon={<Stethoscope className="w-4 h-4 text-[#00a896]" />}
              title="Professional Details"
              description="Specialization and background"
            />
            {userData.profileDescription && (
              <p className="text-gray-600 text-sm pl-4 border-l-2 border-[#00c4b4]/40 leading-relaxed">
                {userData.profileDescription}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Specialty
                </p>
                <p className="font-medium text-gray-800">
                  {userData.field || "General Medicine"}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Experience
                </p>
                <p className="font-medium text-gray-800">
                  {userData.profileExperience || 0} years
                </p>
              </div>
            </div>
          </div>

          {/* ── CERTIFICATIONS ── */}
          {(userData.profileCertification?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={<Award className="w-4 h-4 text-[#00a896]" />}
                title="Certifications"
                description="Professional licenses and credentials"
              />
              <div className="space-y-3">
                {userData.profileCertification?.map((cert, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <Award className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                    <span className="text-gray-800">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AFFILIATIONS ── */}
          {(userData.profileAffiliation?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={<Building2 className="w-4 h-4 text-[#00a896]" />}
                title="Affiliations"
                description="Hospitals, clinics, and organizations"
              />
              <div className="space-y-3">
                {userData.profileAffiliation?.map((aff, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <Building2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                    <span className="text-gray-800">{aff}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EDUCATION ── */}
          {(userData.profileEducation?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={<GraduationCap className="w-4 h-4 text-[#00a896]" />}
                title="Education"
                description="Schools, residency, and training"
              />
              <div className="space-y-3">
                {userData.profileEducation?.map((edu, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          School
                        </p>
                        <p className="font-medium text-gray-800">
                          {edu.school}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Residency
                        </p>
                        <p className="text-gray-700">{edu.residency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Training
                        </p>
                        <p className="text-gray-700">{edu.training}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SCHEDULE (doctor only) ── */}
          {isDoctor && (userData.schedule?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={<CalendarDays className="w-4 h-4 text-[#00a896]" />}
                title="Schedule"
                description="Clinic hours and consultation fees"
              />
              <div className="space-y-3">
                {userData.schedule?.map((s, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Clinic
                        </p>
                        <p className="font-medium text-gray-800">{s.clinic}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Day
                        </p>
                        <p className="text-gray-700">{s.day}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Time
                        </p>
                        <p className="text-gray-700">{s.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Consultation Fee
                        </p>
                        <p className="font-medium text-gray-800">
                          ₱{s.fee?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        {s.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FAQ ── */}
          {(userData.faq?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader
                icon={
                  <MessageCircleQuestion className="w-4 h-4 text-[#00a896]" />
                }
                title="Frequently Asked Questions"
                description="What patients commonly ask"
              />
              <div className="space-y-3">
                {userData.faq?.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800 mb-2">
                      {f.question}
                    </p>
                    <p className="text-sm text-gray-600">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EDIT BUTTON ── */}
          {(isCurrentUser || isAdmin) && (
            <div className="flex justify-center pt-4 pb-2">
              <Button
                onClick={() => navigate("/edit-profile")}
                className="!bg-[#00a896] hover:!bg-[#028090] !text-white !px-12 !py-6 !text-lg font-semibold rounded-xl transition-all shadow-md"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function ViewProfile() {
  const { user } = useAuth();
  const { uid } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      const snapshot = await get(ref(db, `users/${uid}`));
      if (snapshot.exists()) setUserData(snapshot.val());
      setLoading(false);
    };
    fetchUser();
  }, [user, uid]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-[#00a896] font-medium">
        Loading profile...
      </div>
    );

  if (!userData)
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 italic">
        No profile found.
      </div>
    );

  return (
    <ProfileView
      userData={userData}
      uid={uid ?? ""}
      isDoctor={userData.type?.toLowerCase() === "doctor"}
    />
  );
}
