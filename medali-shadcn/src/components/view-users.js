"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CheckCircle, PlusCircle } from "lucide-react";
import { db } from "@/firebaseConfig";
import { ref, onValue, update, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
function getEarliestSchedule(user) {
    if (!user.schedule || user.schedule.length === 0)
        return null;
    return user.schedule[0];
}
function getAvatar(id, type) {
    if (type?.toLowerCase() === "doctor") {
        return `https://i.pravatar.cc/300?u=doctor-${id}`;
    }
    return `https://i.pravatar.cc/300?u=secretary-${id}`;
}
export function ViewUsers() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = React.useState([]);
    const [currentUserDB, setCurrentUserDB] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState("firstName");
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (!user)
            return;
        console.log(user);
        const usersRef = ref(db, "users");
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const users = data
                ? Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value,
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
    const doctorsFiltered = filteredUsers.filter((u) => u.type?.toLowerCase() === "doctor");
    const secretariesFiltered = filteredUsers.filter((u) => u.type?.toLowerCase() === "secretary");
    if (loading)
        return _jsx("div", { children: "Loading..." });
    console.log(userIsSecretary, "CHECK SECRETARY STATUS");
    async function addRequest(u) {
        if (!user)
            return;
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
    const SectionLabel = ({ title }) => (_jsxs("div", { className: "flex items-center w-full my-4", children: [_jsx("div", { className: "flex-grow border-t border-gray-400" }), _jsx("span", { className: "px-4 text-lg font-semibold text-gray-700 uppercase tracking-wider", children: title }), _jsx("div", { className: "flex-grow border-t border-gray-400" })] }));
    async function acceptRequest(u) {
        if (!user)
            return;
        const doctorRef = ref(db, `users/${user.uid}`);
        console.log("Add doctor:", u);
        console.log(doctorRef);
        const doctorSnapshot = await get(doctorRef);
        const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
        const requestedBy = Array.isArray(doctorData.requestedBy)
            ? doctorData.requestedBy
            : [];
        const newRequestedBy = requestedBy.filter((uid) => uid !== u.id);
        const secretaries = Array.isArray(doctorData.secretaries)
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
        const requestedTo = Array.isArray(secData.requestedTo)
            ? secData.requestedTo
            : [];
        const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);
        const doctors = Array.isArray(secData.doctors)
            ? secData.doctors
            : [];
        const newDoctors = [...doctors, user.uid];
        await update(secRef, { requestedTo: newRequestedTo, doctors: newDoctors });
        console.log(`Accepted request from ${u.firstName} ${u.lastName}`);
    }
    async function cancelRequest(s) {
        if (!user)
            return;
        const doctorRef = ref(db, `users/${user.uid}`);
        const doctorSnapshot = await get(doctorRef);
        const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
        const requestedBy = Array.isArray(doctorData.requestedBy)
            ? doctorData.requestedBy
            : [];
        const newRequestedBy = requestedBy.filter((uid) => uid !== s.id);
        await update(doctorRef, { requestedBy: newRequestedBy });
        const secRef = ref(db, `users/${s.id}`);
        const secSnapshot = await get(secRef);
        const secData = secSnapshot.exists() ? secSnapshot.val() : {};
        const requestedTo = Array.isArray(secData.requestedTo)
            ? secData.requestedTo
            : [];
        const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);
        await update(secRef, { requestedTo: newRequestedTo });
        console.log(`Cancelled request from ${s.firstName} ${s.lastName}`);
    }
    return (_jsx("div", { className: "p-6 space-y-10", children: _jsxs("div", { className: "p-10 space-y-10 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "View and Search for Doctors and Secretaries" }), _jsxs("p", { className: "text-gray-500", children: ["We\u2019ve found ", doctorsFiltered.length + secretariesFiltered.length, " ", "Users Available"] })] }) }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Input, { placeholder: `Search by ${filter.toLocaleUpperCase()}`, value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-md" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { className: "!bg-blue-400 !text-white", children: ["Filter ", _jsx(ChevronDown, { className: "ml-2 w-4 h-4" })] }) }), _jsx(DropdownMenuContent, { children: ["firstName", "lastName", "field", "email"].map((col) => (_jsx(DropdownMenuItem, { onSelect: (e) => {
                                            e.preventDefault();
                                            setFilter(col);
                                            setSearch("");
                                            setOpen(false);
                                        }, children: col }, col))) })] })] }), _jsxs("div", { className: "space-y-6", children: [doctorsFiltered.length > 0 && _jsx(SectionLabel, { title: "Doctors" }), doctorsFiltered.map((u) => {
                            const alreadyLinked = userIsSecretary && currentUserDB?.doctors?.includes?.(u.id);
                            const alreadyRequested = userIsSecretary && currentUserDB?.requestedTo?.includes?.(u.id);
                            const sched = getEarliestSchedule(u);
                            return (_jsxs("div", { className: "\r\n                      bg-white\r\n                      rounded-2xl\r\n                      shadow-md\r\n                      border\r\n                      p-6\r\n                      grid\r\n                      grid-cols-1\r\n                      lg:grid-cols-[320px_1fr_220px]\r\n                      gap-8\r\n                      items-center\r\n                    ", children: [_jsxs("div", { className: "flex gap-4 items-center", children: [_jsxs(Avatar, { className: "w-24 h-24 shrink-0", children: [_jsx(AvatarImage, { src: getAvatar(u.id, u.type) }), _jsx(AvatarFallback, { children: "DR" })] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-semibold", children: ["Dr. ", u.firstName, " ", u.lastName] }), _jsx("p", { className: "text-gray-500", children: u.field }), _jsxs("p", { className: "text-gray-500", children: [u.profileExperience ?? 5, " yrs experience"] })] })] }), _jsxs("div", { className: "flex items-center justify-center gap-4 h-full", children: [_jsx("div", { className: "bg-blue-50 p-4 rounded-xl shrink-0", children: "\uD83D\uDCF1" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-700", children: "Earliest Available Schedule" }), sched ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-semibold text-lg", children: sched.clinic }), _jsxs("p", { className: "text-gray-600", children: [sched.day, ", ", sched.time] }), _jsxs("p", { className: "font-semibold mt-2", children: ["Fee: \u20B1", sched.fee?.toLocaleString()] })] })) : (_jsx("p", { className: "text-gray-500", children: "No schedule yet" }))] })] }), _jsx("div", { className: "flex justify-end items-center", children: userIsSecretary ? (alreadyLinked ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { className: "!bg-white text-black underline", onClick: () => navigate(`/profile/${u.id}`), children: "VIEW PROFILE" }), _jsxs("div", { className: "flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full font-semibold", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), "LINKED"] })] })) : (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { className: "!bg-white text-black underline", onClick: () => navigate(`/profile/${u.id}`), children: "VIEW PROFILE" }), alreadyRequested ? (_jsxs("div", { className: "flex items-center gap-2 bg-yellow-500/10 text-yellow-800 px-4 py-2 rounded-full font-semibold", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), "REQUEST SENT"] })) : (_jsxs("button", { onClick: () => addRequest(u), className: "\r\n                                      flex items-center gap-2\r\n                                      bg-sky-50\r\n                                      text-sky-600\r\n                                      px-4 py-2\r\n                                      rounded-full\r\n                                      font-semibold\r\n                                      border border-sky-200\r\n                                      hover:bg-sky-100\r\n                                      transition\r\n                                    ", children: [_jsx(PlusCircle, { className: "w-5 h-5" }), "Add Doctor"] }))] }))) : (_jsx(Button, { className: "!bg-white text-black underline", onClick: () => navigate(`/profile/${u.id}`), children: "VIEW PROFILE" })) })] }, u.id));
                        })] }), secretariesFiltered.length > 0 && _jsx(SectionLabel, { title: "Secretaries" }), _jsx("div", { className: "space-y-6", children: secretariesFiltered.map((s) => {
                        const alreadyLinked = userIsDoctor && currentUserDB?.secretaries?.includes?.(s.id);
                        const hasRequest = userIsDoctor && currentUserDB?.requestedBy?.includes?.(s.id);
                        return (_jsxs("div", { className: "bg-white rounded-2xl shadow-md p-6 flex flex-col lg:flex-row justify-between gap-6 border", children: [_jsxs("div", { className: "flex gap-4 min-w-[280px]", children: [_jsxs(Avatar, { className: "w-20 h-20", children: [_jsx(AvatarImage, { src: getAvatar(s.id, s.type) }), _jsx(AvatarFallback, { children: "SC" })] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-semibold", children: [s.firstName, " ", s.lastName] }), _jsx("p", { className: "text-gray-500", children: "Secretary" }), _jsx("p", { className: "text-gray-500", children: s.email })] })] }), _jsxs("div", { className: "flex items-center gap-4 min-w-[260px]", children: [_jsx("div", { className: "bg-blue-50 p-4 rounded-xl", children: "\uD83D\uDCE9" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-700", children: "Contact Info" }), _jsx("p", { className: "text-gray-600", children: s.email })] })] }), _jsxs("div", { className: "flex flex-col justify-center items-end gap-4 min-w-[200px]", children: [_jsx(Button, { className: "!bg-white text-black underline", onClick: () => navigate(`/profile/${s.id}`), children: "VIEW PROFILE" }), userIsDoctor && (_jsx(_Fragment, { children: alreadyLinked ? (_jsxs("div", { className: "flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full font-semibold", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), "LINKED"] })) : hasRequest ? (_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => acceptRequest(s), className: "flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-semibold border border-emerald-200 hover:bg-emerald-100 transition", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), "Accept"] }), _jsx("button", { onClick: () => cancelRequest(s), className: "flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-semibold border border-red-200 hover:bg-red-100 transition", children: "Cancel" })] })) : (_jsx("div", { className: "flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-semibold", children: "Not Linked" })) }))] })] }, s.id));
                    }) })] }) }));
}
