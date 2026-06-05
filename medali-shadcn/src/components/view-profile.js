"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function getAvatar(id, type) {
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
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        const fetchUser = async () => {
            const snapshot = await get(ref(db, `users/${uid}`));
            if (snapshot.exists())
                setUserData(snapshot.val());
            setLoading(false);
        };
        fetchUser();
    }, [user]);
    if (loading)
        return _jsx("div", { children: "Loading..." });
    if (!userData)
        return _jsx("div", { children: "No profile found" });
    if (userData.type === "doctor") {
        return (_jsx("div", { className: "min-h-screen bg-gray-100 py-10 px-4 !bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-8 text-xl", children: [_jsxs(Card, { className: "p-6 flex items-center gap-6", children: [_jsxs(Avatar, { className: "w-24 h-24", children: [_jsxs(Avatar, { className: "w-24 h-24", children: [_jsx(AvatarImage, { src: userData.profileImage || getAvatar(uid ?? "", userData.type) }), _jsx(AvatarFallback, { children: "DR" })] }), _jsx(AvatarFallback, { children: "DR" })] }), _jsx("div", { children: _jsxs("h1", { className: "text-2xl font-bold", children: ["Dr. ", userData.firstName, " ", userData.lastName] }) })] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: profilPic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Profile" })] }), _jsxs(Card, { className: "p-6 space-y-4", children: [_jsxs("div", { className: "text-gray-600", children: ["\uD83D\uDC49 ", userData.profileDescription || "No description provided"] }), _jsxs("div", { className: "grid grid-cols-2 gap-6 pt-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Specialty" }), _jsx("p", { children: userData.field || "General Medicine" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Experience" }), _jsxs("p", { children: [userData.profileExperience || 0, " years"] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Subspecialties" }), _jsx("p", { children: userData.profileCertification || "N/A" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Certfications" }), _jsx("p", { children: userData.profileCertification || "N/A" })] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: clinicPic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Clinic Schedules" })] }), _jsx("div", { className: "space-y-3", children: userData.schedule?.map((sched, i) => (_jsxs(Card, { className: "p-5", children: [_jsx("p", { className: "font-semibold", children: sched.clinic }), _jsx("p", { className: "text-gray-600", children: sched.description }), _jsxs("p", { className: "text-gray-600", children: ["Days Available: ", sched.day] }), _jsxs("p", { className: "text-gray-600", children: ["Time: ", sched.time] }), _jsxs("p", { className: "text-gray-600", children: ["Fee: ", sched.fee] })] }, i))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: faqPic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Frequently Askled Questions" })] }), _jsx("div", { className: "space-y-4", children: userData.faq?.map((f, i) => (_jsxs(Card, { className: "p-5", children: [_jsx("p", { className: "font-semibold", children: f.question }), _jsx("p", { className: "text-gray-600 mt-2", children: f.answer })] }, i))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: affiliatePic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Affiliations" })] }), _jsx(Card, { className: "p-5", children: userData.profileAffiliation?.map((afi, i) => (_jsx(Card, { className: "p-5", children: _jsx("p", { className: "font-semibold", children: afi }) }, i))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: educationPic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Education" })] }), _jsx("div", { className: "space-y-3", children: userData.profileEducation?.map((edu, i) => (_jsxs(Card, { className: "p-5", children: [_jsxs("p", { className: "font-semibold", children: ["School: ", edu.school] }), _jsxs("p", { className: "text-gray-600", children: ["Residency: ", edu.residency] }), _jsxs("p", { className: "text-gray-600", children: ["Training: ", edu.training] })] }, i))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("img", { src: certificatePic, className: "w-9 h-9" }), _jsx("h2", { className: "text-2xl font-semibold", children: "Certificates" })] }), _jsx(Card, { className: "p-5", children: userData.profileCertification || "No certifications listed" })] }), isCurrentUser && (_jsx("div", { className: "flex justify-center pt-6", children: _jsx(Button, { onClick: () => navigate("/edit-profile"), className: "!bg-[#00a896] text-white", children: "Edit Profile" }) }))] }) }));
    }
    else {
        return (_jsx("div", { className: "min-h-screen bg-gray-100 py-10 px-4", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs(Card, { className: "p-6 flex items-center gap-6", children: [_jsxs(Avatar, { className: "w-24 h-24", children: [_jsxs(Avatar, { className: "w-24 h-24", children: [_jsx(AvatarImage, { src: userData.profileImage || getAvatar(uid ?? "", userData.type) }), _jsx(AvatarFallback, { children: "DR" })] }), _jsx(AvatarFallback, { children: "Secretary" })] }), _jsx("div", { children: _jsxs("h1", { className: "text-2xl font-bold", children: ["Secretary ", userData.firstName, " ", userData.lastName] }) })] }), _jsxs(Card, { className: "p-6 space-y-4", children: [_jsxs("div", { className: "text-gray-600", children: ["\uD83D\uDC49 ", userData.profileDescription || "No description provided"] }), _jsxs("div", { className: "grid grid-cols-2 gap-6 pt-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Specialty" }), _jsx("p", { children: userData.field || " NA" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Experience" }), _jsxs("p", { children: [userData.profileExperience || 0, " years"] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Subspecialties" }), _jsx("p", { children: userData.profileCertification || "N/A" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Certfications" }), _jsx("p", { children: userData.profileCertification || "N/A" })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-4", children: userData.faq?.map((f, i) => (_jsxs(Card, { className: "p-5", children: [_jsx("p", { className: "font-semibold", children: f.question }), _jsx("p", { className: "text-gray-600 mt-2", children: f.answer })] }, i))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Affiliations" }), _jsx(Card, { className: "p-5", children: userData.profileAffiliation || "No affiliations" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Education" }), _jsx("div", { className: "space-y-3", children: userData.profileEducation?.map((edu, i) => (_jsxs(Card, { className: "p-5", children: [_jsxs("p", { className: "font-semibold", children: ["School: ", edu.school] }), _jsxs("p", { className: "text-gray-600", children: ["Residency: ", edu.residency] }), _jsxs("p", { className: "text-gray-600", children: ["Training: ", edu.training] })] }, i))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Certifications" }), _jsx(Card, { className: "p-5", children: userData.profileCertification || "No certifications listed" })] }), isCurrentUser && (_jsx("div", { className: "flex justify-center pt-6", children: _jsx(Button, { onClick: () => navigate("/edit-profile"), className: "!bg-[#00a896] text-white", children: "Edit Profile" }) }))] }) }));
    }
}
