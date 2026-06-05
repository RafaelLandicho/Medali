"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { ref, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profilPic from "./images/profile.png";
import certificatePic from "./images/certificate.png";
import clinicPic from "./images/clinic.png";
import affiliatePic from "./images/affiliate.png";
import educationPic from "./images/graduation-cap.png";
import faqPic from "./images/question.png";

import { Button } from "@/components/ui/button";

export type UserData = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  type?: string;
  medicalId?: string | null;
  subSpecialty?: string[];

  profileEducation?: {
    school: string;
    residency: string;
    training: string;
  }[];
  schedule?: {
    clinic: string;
    description: string;
    day: string;
    time: string;
    fee: number;
  }[];
  faq?: {
    question: "";
    answer: "";
  }[];

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

function getAvatar(id: string, type?: string) {
  if (type?.toLowerCase() === "doctor") {
    return `https://i.pravatar.cc/150?u=doctor-${id}`;
  }

  return `https://i.pravatar.cc/150?u=secretary-${id}`;
}
export function ViewProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uid } = useParams();
  const isCurrentUser = user?.uid === uid;
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
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>No profile found</div>;

  if (userData.type === "doctor") {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 !bg-white">
        <div className="max-w-7xl mx-auto space-y-8 text-xl">
          {/* ================= HEADER ================= */}
          <Card className="p-6 flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={
                    userData.profileImage || getAvatar(uid ?? "", userData.type)
                  }
                />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold">
                Dr. {userData.firstName} {userData.lastName}
              </h1>
            </div>
          </Card>
          <div className="flex items-center gap-2 mb-2">
            <img src={profilPic} className="w-9 h-9" />
            <h2 className="text-2xl font-semibold">Profile</h2>
          </div>
          {/* ================= SUMMARY ================= */}
          <Card className="p-6 space-y-4">
            <div className="text-gray-600">
              👉 {userData.profileDescription || "No description provided"}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="font-semibold">Specialty</p>
                <p>{userData.field || "General Medicine"}</p>
              </div>

              <div>
                <p className="font-semibold">Experience</p>
                <p>{userData.profileExperience || 0} years</p>
              </div>

              <div>
                <p className="font-semibold">Subspecialties</p>
                <p>{userData.profileCertification || "N/A"}</p>
              </div>

              <div>
                <p className="font-semibold">Certfications</p>
                <p>{userData.profileCertification || "N/A"}</p>
              </div>

              {/* <div>
                <p className="font-semibold">Availability</p>
                <p className="text-green-600">✔ Online</p>
                <p className="text-red-500">✖ In-Person</p>
              </div> */}
            </div>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={clinicPic} className="w-9 h-9" />
              <h2 className="text-2xl font-semibold">Clinic Schedules</h2>
            </div>

            <div className="space-y-3">
              {userData.schedule?.map((sched, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">{sched.clinic}</p>
                  <p className="text-gray-600">{sched.description}</p>
                  <p className="text-gray-600">
                    {"Days Available: "}
                    {sched.day}
                  </p>
                  <p className="text-gray-600">
                    {"Time: "}
                    {sched.time}
                  </p>
                  <p className="text-gray-600">
                    {"Fee: "}
                    {sched.fee}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* ================= FAQ ================= */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={faqPic} className="w-9 h-9" />
              <h2 className="text-2xl font-semibold">
                Frequently Askled Questions
              </h2>
            </div>

            <div className="space-y-4">
              {userData.faq?.map((f, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">{f.question}</p>
                  <p className="text-gray-600 mt-2">{f.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* ================= AFFILIATIONS ================= */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={affiliatePic} className="w-9 h-9" />
              <h2 className="text-2xl font-semibold">Affiliations</h2>
            </div>
            <Card className="p-5">
              {userData.profileAffiliation?.map((afi, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">{afi}</p>
                </Card>
              ))}
            </Card>
          </div>

          {/* ================= EDUCATION ================= */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={educationPic} className="w-9 h-9" />
              <h2 className="text-2xl font-semibold">Education</h2>
            </div>

            <div className="space-y-3">
              {userData.profileEducation?.map((edu, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">
                    {"School: "}
                    {edu.school}
                  </p>
                  <p className="text-gray-600">
                    {"Residency: "}
                    {edu.residency}
                  </p>
                  <p className="text-gray-600">
                    {"Training: "}
                    {edu.training}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* ================= CERTIFICATIONS ================= */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={certificatePic} className="w-9 h-9" />
              <h2 className="text-2xl font-semibold">Certificates</h2>
            </div>
            <Card className="p-5">
              {userData.profileCertification || "No certifications listed"}
            </Card>
          </div>
          {/* Check if current user is viewing their own profile*/}
          {isCurrentUser && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => navigate("/edit-profile")}
                className="!bg-[#00a896] text-white"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* ================= HEADER ================= */}
          <Card className="p-6 flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={
                    userData.profileImage || getAvatar(uid ?? "", userData.type)
                  }
                />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>

              <AvatarFallback>Secretary</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold">
                Secretary {userData.firstName} {userData.lastName}
              </h1>
            </div>
          </Card>

          {/* ================= SUMMARY ================= */}
          <Card className="p-6 space-y-4">
            <div className="text-gray-600">
              👉 {userData.profileDescription || "No description provided"}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="font-semibold">Specialty</p>
                <p>{userData.field || " NA"}</p>
              </div>

              <div>
                <p className="font-semibold">Experience</p>
                <p>{userData.profileExperience || 0} years</p>
              </div>

              <div>
                <p className="font-semibold">Subspecialties</p>
                <p>{userData.profileCertification || "N/A"}</p>
              </div>

              <div>
                <p className="font-semibold">Certfications</p>
                <p>{userData.profileCertification || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* ================= FAQ ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {userData.faq?.map((f, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">{f.question}</p>
                  <p className="text-gray-600 mt-2">{f.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* ================= AFFILIATIONS ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Affiliations</h2>
            <Card className="p-5">
              {userData.profileAffiliation || "No affiliations"}
            </Card>
          </div>

          {/* ================= EDUCATION ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Education</h2>

            <div className="space-y-3">
              {userData.profileEducation?.map((edu, i) => (
                <Card key={i} className="p-5">
                  <p className="font-semibold">
                    {"School: "}
                    {edu.school}
                  </p>
                  <p className="text-gray-600">
                    {"Residency: "}
                    {edu.residency}
                  </p>
                  <p className="text-gray-600">
                    {"Training: "}
                    {edu.training}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* ================= CERTIFICATIONS ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Certifications</h2>
            <Card className="p-5">
              {userData.profileCertification || "No certifications listed"}
            </Card>
          </div>

          {/* Check if current user is viewing their own profile*/}
          {isCurrentUser && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => navigate("/edit-profile")}
                className="!bg-[#00a896] text-white"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
