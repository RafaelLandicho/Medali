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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  GraduationCap,
  CalendarDays,
  MessageCircleQuestion,
  Award,
  Building2,
  Stethoscope,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

type UserData = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  profileEducation?: { school: string; residency: string; training: string }[];
  schedule?: { clinic: string; day: string; time: string; fee: number }[];
  faq?: { question: string; answer: string }[];
  profileDescription?: string;
  profileExperience?: number;
  profileCertification?: string[];
  profileAffiliation?: string[];
};

type UserListItem = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
};

// ── Reusable section header (same pattern as AddRecords / EditRecords) ────────
function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
        <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function AddButton({
  onClick,
  label = "+ Add",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className="!bg-[#00a896] text-white hover:!bg-[#028090]"
    >
      {label}
    </Button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className="!bg-red-400 text-white hover:!bg-red-500"
    >
      Remove
    </Button>
  );
}

export function EditProfile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      const snapshot = await get(ref(db, `users/${user.uid}/role`));
      setIsAdmin(snapshot.val() === "admin");
    };
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!isAdmin || !user) return;
    const fetchAllUsers = async () => {
      setUsersLoading(true);
      const snapshot = await get(ref(db, "users"));
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        setAllUsers(
          Object.entries(usersData).map(([uid, data]: [string, any]) => ({
            uid,
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            role: data.role || "user",
          })),
        );
      }
      setUsersLoading(false);
    };
    fetchAllUsers();
  }, [isAdmin, user]);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      setLoading(true);
      const targetUid = isAdmin && selectedUserId ? selectedUserId : user.uid;
      if (!targetUid) {
        setLoading(false);
        return;
      }
      const snapshot = await get(ref(db, `users/${targetUid}`));
      setUserData(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    };
    fetchUser();
  }, [user, isAdmin, selectedUserId]);

  const handleChange = (key: keyof UserData, value: any) =>
    setUserData((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleAddEducation = () =>
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

  const handleAddSchedule = () =>
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

  const handleAddFaq = () =>
    setUserData((prev) =>
      prev
        ? { ...prev, faq: [...(prev.faq || []), { question: "", answer: "" }] }
        : prev,
    );

  const removeEducation = (i: number) =>
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileEducation: prev.profileEducation?.filter(
              (_, idx) => idx !== i,
            ),
          }
        : prev,
    );

  const removeSchedule = (i: number) =>
    setUserData((prev) =>
      prev
        ? { ...prev, schedule: prev.schedule?.filter((_, idx) => idx !== i) }
        : prev,
    );

  const removeFaq = (i: number) =>
    setUserData((prev) =>
      prev ? { ...prev, faq: prev.faq?.filter((_, idx) => idx !== i) } : prev,
    );

  const handleAddCertification = () =>
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileCertification: [...(prev.profileCertification || []), ""],
          }
        : prev,
    );

  const handleAddAffiliation = () =>
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileAffiliation: [...(prev.profileAffiliation || []), ""],
          }
        : prev,
    );

  const removeCertification = (i: number) =>
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileCertification: prev.profileCertification?.filter(
              (_, idx) => idx !== i,
            ),
          }
        : prev,
    );

  const removeAffiliation = (i: number) =>
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            profileAffiliation: prev.profileAffiliation?.filter(
              (_, idx) => idx !== i,
            ),
          }
        : prev,
    );

  const handleSave = async () => {
    if (!user || !userData) return;
    const targetUid = isAdmin && selectedUserId ? selectedUserId : user.uid;
    await update(ref(db, `users/${targetUid}`), userData);
    toast.success(
      `Profile updated for ${userData.firstName || userData.email || targetUid}!`,
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-[#00a896] font-medium">
        Loading profile...
      </div>
    );

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
              Edit Profile
              {isAdmin && (
                <span className="ml-2 text-sm font-medium text-[#00a896] bg-[#00a896]/10 px-2 py-0.5 rounded-full">
                  Admin Mode
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your professional information and preferences
            </p>
            <div className="mt-4 h-1 w-16 bg-[#00c4b4] rounded-full mx-auto" />
          </div>

          {/* ── ADMIN CONTROLS ── */}
          {isAdmin && (
            <div className="p-4 rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/5">
              <SectionHeader
                icon={<ShieldCheck className="w-4 h-4 text-[#00a896]" />}
                title="Admin Controls"
                description="Select a user to edit their profile"
              />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Select User to Edit
                  </label>
                  {usersLoading ? (
                    <div className="text-sm text-gray-400 italic">
                      Loading users...
                    </div>
                  ) : (
                    <Select
                      onValueChange={setSelectedUserId}
                      value={selectedUserId || undefined}
                    >
                      <SelectTrigger className="!bg-white border-[#00c4b4]/40">
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers.map((u) => (
                          <SelectItem key={u.uid} value={u.uid}>
                            {u.firstName} {u.lastName} ({u.email}) —{" "}
                            {u.role || "user"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {selectedUserId && userData && (
                  <div className="flex items-end">
                    <div className="text-sm bg-white border border-[#00c4b4]/30 rounded-xl px-4 py-3 space-y-1">
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        Editing
                      </p>
                      <p className="font-bold text-gray-800">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <span className="inline-block text-xs bg-[#00a896]/10 text-[#00a896] px-2 py-0.5 rounded-full font-medium">
                        {userData.role || "user"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!userData && selectedUserId && (
            <div className="text-center py-8 text-gray-400 italic">
              No profile data found for this user.
            </div>
          )}

          {userData && (
            <>
              {/* ── BASIC INFORMATION ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<User className="w-4 h-4 text-[#00a896]" />}
                  title="Basic Information"
                  description="Your name and account details"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <Input
                      value={userData.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                    />
                    <FieldDescription>First Name</FieldDescription>
                  </Field>
                  <Field>
                    <Input
                      value={userData.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last name"
                    />
                    <FieldDescription>Last Name</FieldDescription>
                  </Field>
                  <Field>
                    <Input
                      value={userData.username || ""}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="@username"
                    />
                    <FieldDescription>Username</FieldDescription>
                  </Field>
                </div>

                {isAdmin && (
                  <Field>
                    <Select
                      value={userData.role || "user"}
                      onValueChange={(v) => handleChange("role", v)}
                    >
                      <SelectTrigger className="!bg-[#00a896] !text-white w-full md:w-64">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>User Role (Admin only)</FieldDescription>
                  </Field>
                )}
              </div>

              {/* ── PROFESSIONAL DETAILS ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<Stethoscope className="w-4 h-4 text-[#00a896]" />}
                  title="Professional Details"
                  description="Your specialization and background"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <Input
                      value={userData.profileDescription || ""}
                      onChange={(e) =>
                        handleChange("profileDescription", e.target.value)
                      }
                      placeholder="e.g. Board-certified cardiologist..."
                    />
                    <FieldDescription>
                      Description / Specialization
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Input
                      type="number"
                      value={userData.profileExperience ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "profileExperience",
                          Number(e.target.value),
                        )
                      }
                      placeholder="e.g. 10"
                    />
                    <FieldDescription>Years of Experience</FieldDescription>
                  </Field>
                </div>
              </div>

              {/* ── CERTIFICATIONS ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<Award className="w-4 h-4 text-[#00a896]" />}
                  title="Certifications"
                  description="Professional licenses and credentials"
                  action={<AddButton onClick={handleAddCertification} />}
                />
                {(userData.profileCertification?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 italic pl-4">
                    No certifications added yet.
                  </p>
                )}
                <div className="space-y-3">
                  {userData.profileCertification?.map((cert, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                    >
                      <Award className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                      <Input
                        value={cert}
                        onChange={(e) => {
                          const updated = [
                            ...(userData.profileCertification || []),
                          ];
                          updated[index] = e.target.value;
                          handleChange("profileCertification", updated);
                        }}
                        placeholder="e.g. Board Certified in Internal Medicine"
                        className="flex-1"
                      />
                      <RemoveButton
                        onClick={() => removeCertification(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── AFFILIATIONS ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<Building2 className="w-4 h-4 text-[#00a896]" />}
                  title="Affiliations"
                  description="Hospitals, clinics, and organizations"
                  action={<AddButton onClick={handleAddAffiliation} />}
                />
                {(userData.profileAffiliation?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 italic pl-4">
                    No affiliations added yet.
                  </p>
                )}
                <div className="space-y-3">
                  {userData.profileAffiliation?.map((aff, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                    >
                      <Building2 className="w-4 h-4 text-[#00a896] flex-shrink-0" />
                      <Input
                        value={aff}
                        onChange={(e) => {
                          const updated = [
                            ...(userData.profileAffiliation || []),
                          ];
                          updated[index] = e.target.value;
                          handleChange("profileAffiliation", updated);
                        }}
                        placeholder="e.g. Philippine General Hospital"
                        className="flex-1"
                      />
                      <RemoveButton onClick={() => removeAffiliation(index)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── EDUCATION ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<GraduationCap className="w-4 h-4 text-[#00a896]" />}
                  title="Education"
                  description="Schools, residency, and training"
                  action={<AddButton onClick={handleAddEducation} />}
                />
                {(userData.profileEducation?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 italic pl-4">
                    No education records added yet.
                  </p>
                )}
                <div className="space-y-3">
                  {userData.profileEducation?.map((edu, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Field>
                          <Input
                            value={edu.school}
                            onChange={(e) => {
                              const updated = [
                                ...(userData.profileEducation || []),
                              ];
                              updated[index].school = e.target.value;
                              handleChange("profileEducation", updated);
                            }}
                            placeholder="e.g. University of Santo Tomas"
                          />
                          <FieldDescription>School</FieldDescription>
                        </Field>
                        <Field>
                          <Input
                            value={edu.residency}
                            onChange={(e) => {
                              const updated = [
                                ...(userData.profileEducation || []),
                              ];
                              updated[index].residency = e.target.value;
                              handleChange("profileEducation", updated);
                            }}
                            placeholder="e.g. Philippine General Hospital"
                          />
                          <FieldDescription>Residency</FieldDescription>
                        </Field>
                        <Field>
                          <Input
                            value={edu.training}
                            onChange={(e) => {
                              const updated = [
                                ...(userData.profileEducation || []),
                              ];
                              updated[index].training = e.target.value;
                              handleChange("profileEducation", updated);
                            }}
                            placeholder="e.g. Fellowship in Cardiology"
                          />
                          <FieldDescription>Training</FieldDescription>
                        </Field>
                      </div>
                      <div className="flex justify-end">
                        <RemoveButton onClick={() => removeEducation(index)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SCHEDULE ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<CalendarDays className="w-4 h-4 text-[#00a896]" />}
                  title="Schedule"
                  description="Clinic hours and consultation fees"
                  action={<AddButton onClick={handleAddSchedule} />}
                />
                {(userData.schedule?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 italic pl-4">
                    No schedules added yet.
                  </p>
                )}
                <div className="space-y-3">
                  {userData.schedule?.map((s, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Field>
                          <Input
                            value={s.clinic}
                            onChange={(e) => {
                              const updated = [...(userData.schedule || [])];
                              updated[index].clinic = e.target.value;
                              handleChange("schedule", updated);
                            }}
                            placeholder="e.g. Main Clinic"
                          />
                          <FieldDescription>Clinic</FieldDescription>
                        </Field>
                        <Field>
                          <Input
                            value={s.day}
                            onChange={(e) => {
                              const updated = [...(userData.schedule || [])];
                              updated[index].day = e.target.value;
                              handleChange("schedule", updated);
                            }}
                            placeholder="e.g. Mon, Wed, Fri"
                          />
                          <FieldDescription>Day</FieldDescription>
                        </Field>
                        <Field>
                          <Input
                            value={s.time}
                            onChange={(e) => {
                              const updated = [...(userData.schedule || [])];
                              updated[index].time = e.target.value;
                              handleChange("schedule", updated);
                            }}
                            placeholder="e.g. 9:00 AM – 5:00 PM"
                          />
                          <FieldDescription>Time</FieldDescription>
                        </Field>
                        <Field>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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
                          <FieldDescription>Consultation Fee</FieldDescription>
                        </Field>
                      </div>
                      <div className="flex justify-end">
                        <RemoveButton onClick={() => removeSchedule(index)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── FAQ ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={
                    <MessageCircleQuestion className="w-4 h-4 text-[#00a896]" />
                  }
                  title="Frequently Asked Questions"
                  description="Help patients know what to expect"
                  action={<AddButton onClick={handleAddFaq} />}
                />
                {(userData.faq?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-400 italic pl-4">
                    No FAQs added yet.
                  </p>
                )}
                <div className="space-y-3">
                  {userData.faq?.map((f, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field>
                          <Input
                            value={f.question}
                            onChange={(e) => {
                              const updated = [...(userData.faq || [])];
                              updated[index].question = e.target.value;
                              handleChange("faq", updated);
                            }}
                            placeholder="e.g. What should I bring to my first visit?"
                          />
                          <FieldDescription>Question</FieldDescription>
                        </Field>
                        <Field>
                          <Input
                            value={f.answer}
                            onChange={(e) => {
                              const updated = [...(userData.faq || [])];
                              updated[index].answer = e.target.value;
                              handleChange("faq", updated);
                            }}
                            placeholder="e.g. Please bring a valid ID and your medical history."
                          />
                          <FieldDescription>Answer</FieldDescription>
                        </Field>
                      </div>
                      <div className="flex justify-end">
                        <RemoveButton onClick={() => removeFaq(index)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SAVE ── */}
              <div className="flex justify-center pt-4 pb-2">
                <Button
                  onClick={handleSave}
                  className="!bg-[#00a896] hover:!bg-[#028090] !text-white !px-12 !py-6 !text-lg font-semibold rounded-xl transition-all shadow-md"
                >
                  Save Profile
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
