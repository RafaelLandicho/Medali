"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { ref, get, update } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UserData = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;

  profileEducation?: {
    school: string;
    residency: string;
    training: string;
  }[];

  schedule?: {
    clinic: string;
    day: string;
    time: string;
    fee: number;
  }[];

  faq?: {
    question: string;
    answer: string;
  }[];

  profileDescription?: string;
  profileExperience?: number;
  profileCertification?: string[];
  profileAffiliation?: string[];
};

export function EditProfile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const snapshot = await get(ref(db, `users/${user.uid}`));
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
      setLoading(false);
    };

    fetchUser();
  }, [user]);

  const handleChange = (key: keyof UserData, value: any) => {
    setUserData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleAddEducation = () => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileEducation: [
              ...(prev.profileEducation || []),
              { school: "", residency: "", training: "" },
            ],
          }
        : prev,
    );
  };

  const handleAddSchedule = () => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            schedule: [
              ...(prev.schedule || []),
              { clinic: "", day: "", time: "", fee: 0 },
            ],
          }
        : prev,
    );
  };

  const handleAddFaq = () => {
    setUserData((prev) =>
      prev
        ? { ...prev, faq: [...(prev.faq || []), { question: "", answer: "" }] }
        : prev,
    );
  };

  const removeEducation = (index: number) => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileEducation: prev.profileEducation?.filter(
              (_, i) => i !== index,
            ),
          }
        : prev,
    );
  };

  const removeSchedule = (index: number) => {
    setUserData((prev) =>
      prev
        ? { ...prev, schedule: prev.schedule?.filter((_, i) => i !== index) }
        : prev,
    );
  };

  const removeFaq = (index: number) => {
    setUserData((prev) =>
      prev ? { ...prev, faq: prev.faq?.filter((_, i) => i !== index) } : prev,
    );
  };
  const handleAddCertification = () => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileCertification: [...(prev.profileCertification || []), ""],
          }
        : prev,
    );
  };

  const handleAddAffiliation = () => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileAffiliation: [...(prev.profileAffiliation || []), ""],
          }
        : prev,
    );
  };

  const removeCertification = (index: number) => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileCertification: prev.profileCertification?.filter(
              (_, i) => i !== index,
            ),
          }
        : prev,
    );
  };

  const removeAffiliation = (index: number) => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileAffiliation: prev.profileAffiliation?.filter(
              (_, i) => i !== index,
            ),
          }
        : prev,
    );
  };

  const handleSave = async () => {
    if (!user || !userData) return;

    await update(ref(db, `users/${user.uid}`), userData);
    toast.success("Profile updated!");
  };

  if (loading) return <div className="text-xl">Loading profile...</div>;
  if (!userData) return <div>No data found</div>;

  return (
    <div className="px-4 md:px-8 lg:px-12">
      <Card className="p-6 md:p-8 rounded-2xl">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-center text-orange-500">
            Edit Profile
          </h1>

          {/* INFO*/}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field>
                <Input
                  value={userData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
                <FieldDescription>First Name</FieldDescription>
              </Field>

              <Field>
                <Input
                  value={userData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
                <FieldDescription>Last Name</FieldDescription>
              </Field>

              <Field>
                <Input
                  value={userData.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                <FieldDescription>Username</FieldDescription>
              </Field>
            </div>
          </div>

          {/* SPECIALIZATION*/}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              Professional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={userData.profileDescription || ""}
                onChange={(e) =>
                  handleChange("profileDescription", e.target.value)
                }
                placeholder="Description"
              />

              <Input
                value={userData.profileExperience ?? ""}
                onChange={(e) =>
                  handleChange("profileExperience", Number(e.target.value))
                }
                placeholder="Experience"
              />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Certifications
                  </h2>
                  <Button onClick={handleAddCertification}>+ Add</Button>
                </div>

                {userData.profileCertification?.map((cert, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 border rounded-xl bg-gray-50"
                  >
                    <Input
                      value={cert}
                      onChange={(e) => {
                        const updated = [
                          ...(userData.profileCertification || []),
                        ];
                        updated[index] = e.target.value;
                        handleChange("profileCertification", updated);
                      }}
                      placeholder="Certification"
                    />

                    <Button
                      onClick={() => removeCertification(index)}
                      className="!bg-red-400 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Affiliations
                  </h2>
                  <Button onClick={handleAddAffiliation}>+ Add</Button>
                </div>

                {userData.profileAffiliation?.map((aff, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 border rounded-xl bg-gray-50"
                  >
                    <Input
                      value={aff}
                      onChange={(e) => {
                        const updated = [
                          ...(userData.profileAffiliation || []),
                        ];
                        updated[index] = e.target.value;
                        handleChange("profileAffiliation", updated);
                      }}
                      placeholder="Affiliation"
                    />

                    <Button
                      onClick={() => removeAffiliation(index)}
                      className="!bg-red-400 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EDUCATION */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Education</h2>
              <Button onClick={handleAddEducation}>+ Add</Button>
            </div>

            {userData.profileEducation?.map((edu, index) => (
              <div
                key={index}
                className="grid md:grid-cols-4 gap-3 p-4 border rounded-xl bg-gray-50"
              >
                <Input
                  value={edu.school}
                  onChange={(e) => {
                    const updated = [...(userData.profileEducation || [])];
                    updated[index].school = e.target.value;
                    handleChange("profileEducation", updated);
                  }}
                  placeholder="School"
                />

                <Input
                  value={edu.residency}
                  onChange={(e) => {
                    const updated = [...(userData.profileEducation || [])];
                    updated[index].residency = e.target.value;
                    handleChange("profileEducation", updated);
                  }}
                  placeholder="Residency"
                />

                <Input
                  value={edu.training}
                  onChange={(e) => {
                    const updated = [...(userData.profileEducation || [])];
                    updated[index].training = e.target.value;
                    handleChange("profileEducation", updated);
                  }}
                  placeholder="Training"
                />

                <Button
                  onClick={() => removeEducation(index)}
                  className="!bg-red-400 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* SCHED*/}
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Schedule</h2>
              <Button onClick={handleAddSchedule}>+ Add</Button>
            </div>

            {userData.schedule?.map((s, index) => (
              <div
                key={index}
                className="grid md:grid-cols-5 gap-3 p-4 border rounded-xl bg-gray-50"
              >
                <Input
                  value={s.clinic}
                  onChange={(e) => {
                    const updated = [...(userData.schedule || [])];
                    updated[index].clinic = e.target.value;
                    handleChange("schedule", updated);
                  }}
                  placeholder="Clinic"
                />

                <Input
                  value={s.day}
                  onChange={(e) => {
                    const updated = [...(userData.schedule || [])];
                    updated[index].day = e.target.value;
                    handleChange("schedule", updated);
                  }}
                  placeholder="Day"
                />

                <Input
                  value={s.time}
                  onChange={(e) => {
                    const updated = [...(userData.schedule || [])];
                    updated[index].time = e.target.value;
                    handleChange("schedule", updated);
                  }}
                  placeholder="Time"
                />

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₱
                  </span>

                  <Input
                    type="number"
                    className="pl-7"
                    value={s.fee}
                    onChange={(e) => {
                      const updated = [...(userData.schedule || [])];
                      updated[index].fee = Number(e.target.value);
                      handleChange("schedule", updated);
                    }}
                    placeholder="0"
                  />
                </div>

                <Button
                  onClick={() => removeSchedule(index)}
                  className="!bg-red-400 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/*FAQ*/}
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg md:text-xl font-semibold">FAQ</h2>
              <Button onClick={handleAddFaq}>+ Add</Button>
            </div>

            {userData.faq?.map((f, index) => (
              <div
                key={index}
                className="grid md:grid-cols-3 gap-3 p-4 border rounded-xl bg-gray-50"
              >
                <Input
                  value={f.question}
                  onChange={(e) => {
                    const updated = [...(userData.faq || [])];
                    updated[index].question = e.target.value;
                    handleChange("faq", updated);
                  }}
                  placeholder="Question"
                />

                <Input
                  value={f.answer}
                  onChange={(e) => {
                    const updated = [...(userData.faq || [])];
                    updated[index].answer = e.target.value;
                    handleChange("faq", updated);
                  }}
                  placeholder="Answer"
                />

                <Button
                  onClick={() => removeFaq(index)}
                  className="!bg-red-400 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <Button onClick={handleSave} className="!bg-orange-400 text-white">
              Save Profile
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
