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
import { ChevronDown, Trash2, X, AlertTriangle } from "lucide-react";
import { CheckCircle, PlusCircle } from "lucide-react";
import { db } from "@/firebaseConfig";
import { ref, onValue, update, get, remove } from "firebase/database";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Delete confirmation state
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Check if current user is admin
  const isAdmin = user?.type?.toLowerCase() === "admin";

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

  // Delete user function
  const handleDeleteUser = async () => {
    if (!userToDelete || !isAdmin) return;

    setIsDeleting(true);
    try {
      const userRef = ref(db, `users/${userToDelete.id}`);

      // Remove user from all references (doctors' secretaries lists, secretaries' doctors lists, etc.)
      const updates: Record<string, any> = {};

      // Remove from doctors' secretaries lists if this user is a secretary
      if (userToDelete.type?.toLowerCase() === "secretary") {
        for (const doctor of doctors) {
          if (doctor.secretaries?.includes(userToDelete.id)) {
            const newSecretaries = doctor.secretaries.filter(
              (id) => id !== userToDelete.id,
            );
            updates[`users/${doctor.id}/secretaries`] = newSecretaries;
          }
        }
      }

      // Remove from secretaries' doctors lists if this user is a doctor
      if (userToDelete.type?.toLowerCase() === "doctor") {
        for (const secretary of secretaries) {
          if (secretary.doctors?.includes(userToDelete.id)) {
            const newDoctors = secretary.doctors.filter(
              (id) => id !== userToDelete.id,
            );
            updates[`users/${secretary.id}/doctors`] = newDoctors;
          }
        }
      }

      // Remove from requestedBy and requestedTo lists
      for (const otherUser of data) {
        if (otherUser.requestedBy?.includes(userToDelete.id)) {
          const newRequestedBy = otherUser.requestedBy.filter(
            (id) => id !== userToDelete.id,
          );
          updates[`users/${otherUser.id}/requestedBy`] = newRequestedBy;
        }
        if (otherUser.requestedTo?.includes(userToDelete.id)) {
          const newRequestedTo = otherUser.requestedTo.filter(
            (id) => id !== userToDelete.id,
          );
          updates[`users/${otherUser.id}/requestedTo`] = newRequestedTo;
        }
      }

      // Apply all updates
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }

      // Finally, delete the user
      await remove(userRef);

      console.log(
        `User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`,
      );
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-10">
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.firstName}{" "}
              {userToDelete?.lastName}? This action cannot be undone and will
              remove all associated data including:
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-lg space-y-2">
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              <li>User profile and personal information</li>
              <li>All schedules and appointments</li>
              <li>Links with doctors/secretaries</li>
              <li>Pending requests</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="!bg-red-300 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="flex items-center gap-2 !bg-green-700 !text-white"
            >
              {isDeleting ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-10 space-y-10 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              View and Search for Doctors and Secretaries
            </h1>
            <p className="text-gray-500">
              We've found {doctorsFiltered.length + secretariesFiltered.length}{" "}
              Users Available
            </p>
          </div>
          {isAdmin && (
            <div className="bg-red-50 px-4 py-2 rounded-lg">
              <p className="text-red-600 text-sm font-semibold">
                Admin Mode: You can delete users
              </p>
            </div>
          )}
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
                      relative
                    "
              >
                {/* Delete button for admin */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50 !bg-white"
                    onClick={() => {
                      setUserToDelete(u);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

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
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col lg:flex-row justify-between gap-6 border relative"
              >
                {/* Delete button for admin */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50 !bg-white"
                    onClick={() => {
                      setUserToDelete(s);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

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
