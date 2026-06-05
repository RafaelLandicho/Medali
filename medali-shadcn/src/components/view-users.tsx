"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CheckCircle, PlusCircle } from "lucide-react";
import { db } from "@/firebaseConfig";
import { ref, onValue, update, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import linkPic from "./images/link.png";
import { useNavigate } from "react-router-dom";
export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  field: string;
  medicalId: string;
  type: string;
  email: string;

  subSpecialty?: string[];

  profileDescription?: string;
  profileExperience?: number;
  profileCertification?: string[];
  profileAffiliation?: string[];

  schedule?: {
    clinic: string;
    description: string;
    day: string;
    time: string;
    fee: number;
  }[];

  requestedBy?: string[];
  requestedTo?: string[];
  doctors?: string[];
  secretaries: string[];
  uid?: string;
};

function getEarliestSchedule(user: User) {
  if (!user.schedule || user.schedule.length === 0) return null;
  return user.schedule[0];
}
function getAvatar(id: string, type?: string) {
  if (type?.toLowerCase() === "doctor") {
    return `https://i.pravatar.cc/300?u=doctor-${id}`;
  }

  return `https://i.pravatar.cc/300?u=secretary-${id}`;
}
export function ViewUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = React.useState<User[]>([]);
  const [currentUserDB, setCurrentUserDB] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<keyof User>("firstName");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    console.log(user);
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const users: User[] = data
        ? Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as any),
          }))
        : [];
      const currentUser = users.find((u) => u.id === user.uid) || null;
      setCurrentUserDB(currentUser);
      setData(users.filter((u) => u.id !== user.uid));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const doctors = data.filter((u) => u.type?.toLowerCase() === "doctor");
  const secretaries = data.filter((u) => u.type?.toLowerCase() === "secretary");
  const userIsSecretary = user?.type?.toLowerCase() === "secretary";
  const userIsDoctor = user?.type?.toLowerCase() === "doctor";

  const filteredUsers = React.useMemo(() => {
    const term = search.toLowerCase();

    return data.filter((u) => {
      const value = (u[filter] ?? "").toString().toLowerCase();
      return value.includes(term);
    });
  }, [data, search, filter]);

  const doctorsFiltered = filteredUsers.filter(
    (u) => u.type?.toLowerCase() === "doctor",
  );
  const secretariesFiltered = filteredUsers.filter(
    (u) => u.type?.toLowerCase() === "secretary",
  );
  if (loading) return <div>Loading...</div>;

  console.log(userIsSecretary, "CHECK SECRETARY STATUS");

  async function addRequest(u: User): Promise<void> {
    if (!user) return;

    const doctorRef = ref(db, `users/${u.id}`);
    console.log("Add doctor:", u);

    console.log(doctorRef);
    const doctorSnapshot = await get(doctorRef);
    const docData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
    const requestedBy = Array.isArray(docData.requestedBy)
      ? docData.requestedBy
      : Array.isArray(docData.requestedby)
        ? docData.requestedby
        : [];
    const newRequestedBy = [...requestedBy, user.uid];
    await update(doctorRef, {
      requestedBy: newRequestedBy,
    });

    console.log(user);
    const secRef = ref(db, `users/${user.uid}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};
    const requestedTo = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : Array.isArray(secData.requestedto)
        ? secData.requestedto
        : [];
    const newRequestedTo = [...requestedTo, u.id];
    await update(secRef, {
      requestedTo: newRequestedTo,
    });
  }

  const SectionLabel = ({ title }: { title: string }) => (
    <div className="flex items-center w-full my-4">
      <div className="flex-grow border-t border-gray-400" />
      <span className="px-4 text-lg font-semibold text-gray-700 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-grow border-t border-gray-400" />
    </div>
  );

  async function acceptRequest(u: User): Promise<void> {
    if (!user) return;

    const doctorRef = ref(db, `users/${user.uid}`);
    console.log("Add doctor:", u);

    console.log(doctorRef);
    const doctorSnapshot = await get(doctorRef);
    const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};

    const requestedBy: string[] = Array.isArray(doctorData.requestedBy)
      ? doctorData.requestedBy
      : [];
    const newRequestedBy = requestedBy.filter((uid) => uid !== u.id);

    const secretaries: string[] = Array.isArray(doctorData.secretaries)
      ? doctorData.secretaries
      : [];
    const newSecretaries = [...secretaries, u.id];

    await update(doctorRef, {
      requestedBy: newRequestedBy,
      secretaries: newSecretaries,
    });

    const secRef = ref(db, `users/${u.id}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};

    const requestedTo: string[] = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : [];
    const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);

    const doctors: string[] = Array.isArray(secData.doctors)
      ? secData.doctors
      : [];
    const newDoctors = [...doctors, user.uid];

    await update(secRef, { requestedTo: newRequestedTo, doctors: newDoctors });

    console.log(`Accepted request from ${u.firstName} ${u.lastName}`);
  }

  async function cancelRequest(s: any) {
    if (!user) return;

    const doctorRef = ref(db, `users/${user.uid}`);
    const doctorSnapshot = await get(doctorRef);
    const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
    const requestedBy: string[] = Array.isArray(doctorData.requestedBy)
      ? doctorData.requestedBy
      : [];
    const newRequestedBy = requestedBy.filter((uid) => uid !== s.id);
    await update(doctorRef, { requestedBy: newRequestedBy });

    const secRef = ref(db, `users/${s.id}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};
    const requestedTo: string[] = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : [];
    const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);
    await update(secRef, { requestedTo: newRequestedTo });
    console.log(`Cancelled request from ${s.firstName} ${s.lastName}`);
  }

  return (
    <div className="p-6 space-y-10">
      <div className="p-10 space-y-10 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              View and Search for Doctors and Secretaries
            </h1>
            <p className="text-gray-500">
              We’ve found {doctorsFiltered.length + secretariesFiltered.length}{" "}
              Users Available
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex gap-4">
          <Input
            placeholder={`Search by ${filter.toLocaleUpperCase()}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="!bg-blue-400 !text-white">
                Filter <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {["firstName", "lastName", "field", "email"].map((col) => (
                <DropdownMenuItem
                  key={col}
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilter(col as keyof User);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  {col}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* DOCTORS LIST */}
        <div className="space-y-6">
          {doctorsFiltered.length > 0 && <SectionLabel title="Doctors" />}
          {doctorsFiltered.map((u) => {
            const alreadyLinked =
              userIsSecretary && currentUserDB?.doctors?.includes?.(u.id);
            const alreadyRequested =
              userIsSecretary && currentUserDB?.requestedTo?.includes?.(u.id);
            const sched = getEarliestSchedule(u);

            return (
              <div
                key={u.id}
                className="
                      bg-white
                      rounded-2xl
                      shadow-md
                      border
                      p-6
                      grid
                      grid-cols-1
                      lg:grid-cols-[320px_1fr_220px]
                      gap-8
                      items-center
                    "
              >
                {/* LEFT COLUMN */}
                <div className="flex gap-4 items-center">
                  <Avatar className="w-24 h-24 shrink-0">
                    <AvatarImage src={getAvatar(u.id, u.type)} />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-2xl font-semibold">
                      Dr. {u.firstName} {u.lastName}
                    </h2>

                    <p className="text-gray-500">{u.field}</p>

                    <p className="text-gray-500">
                      {u.profileExperience ?? 5} yrs experience
                    </p>
                  </div>
                </div>

                {/* MIDDLE COLUMN */}
                {/* MIDDLE COLUMN */}
                <div className="flex items-center justify-center gap-4 h-full">
                  <div className="bg-blue-50 p-4 rounded-xl shrink-0">📱</div>

                  <div>
                    <p className="font-semibold text-slate-700">
                      Earliest Available Schedule
                    </p>

                    {sched ? (
                      <>
                        <p className="font-semibold text-lg">{sched.clinic}</p>

                        <p className="text-gray-600">
                          {sched.day}, {sched.time}
                        </p>

                        <p className="font-semibold mt-2">
                          Fee: ₱{sched.fee?.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">No schedule yet</p>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex justify-end items-center">
                  {userIsSecretary ? (
                    alreadyLinked ? (
                      <div className="flex items-center gap-3">
                        <Button
                          className="!bg-white text-black underline"
                          onClick={() => navigate(`/profile/${u.id}`)}
                        >
                          VIEW PROFILE
                        </Button>

                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          LINKED
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button
                          className="!bg-white text-black underline"
                          onClick={() => navigate(`/profile/${u.id}`)}
                        >
                          VIEW PROFILE
                        </Button>

                        {alreadyRequested ? (
                          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            REQUEST SENT
                          </div>
                        ) : (
                          <button
                            onClick={() => addRequest(u)}
                            className="
                                      flex items-center gap-2
                                      bg-sky-50
                                      text-sky-600
                                      px-4 py-2
                                      rounded-full
                                      font-semibold
                                      border border-sky-200
                                      hover:bg-sky-100
                                      transition
                                    "
                          >
                            <PlusCircle className="w-5 h-5" />
                            Add Doctor
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <Button
                      className="!bg-white text-black underline"
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      VIEW PROFILE
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {secretariesFiltered.length > 0 && <SectionLabel title="Secretaries" />}

        <div className="space-y-6">
          {secretariesFiltered.map((s) => {
            const alreadyLinked =
              userIsDoctor && currentUserDB?.secretaries?.includes?.(s.id);
            const hasRequest =
              userIsDoctor && currentUserDB?.requestedBy?.includes?.(s.id);

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col lg:flex-row justify-between gap-6 border"
              >
                {/* LEFT */}
                <div className="flex gap-4 min-w-[280px]">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={getAvatar(s.id, s.type)} />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-2xl font-semibold">
                      {s.firstName} {s.lastName}
                    </h2>
                    <p className="text-gray-500">Secretary</p>
                    <p className="text-gray-500">{s.email}</p>
                  </div>
                </div>

                {/* MIDDLE */}
                <div className="flex items-center gap-4 min-w-[260px]">
                  <div className="bg-blue-50 p-4 rounded-xl">📩</div>

                  <div>
                    <p className="font-semibold text-gray-700">Contact Info</p>
                    <p className="text-gray-600">{s.email}</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col justify-center items-end gap-4 min-w-[200px]">
                  <Button
                    className="!bg-white text-black underline"
                    onClick={() => navigate(`/profile/${s.id}`)}
                  >
                    VIEW PROFILE
                  </Button>

                  {userIsDoctor && (
                    <>
                      {alreadyLinked ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          LINKED
                        </div>
                      ) : hasRequest ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(s)}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept
                          </button>

                          <button
                            onClick={() => cancelRequest(s)}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-semibold border border-red-200 hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-semibold">
                          Not Linked
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
