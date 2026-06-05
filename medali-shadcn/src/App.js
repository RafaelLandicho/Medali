import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MedicalRecords } from "@/components/medical_records";
import { ViewUsers } from "./components/view-users";
import { SignUp } from "@/components/signup";
import { Login } from "@/components/login";
import Layout from "./layout";
import { Card, CardDescription, CardTitle } from "./components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import addUser from "./components/images/add-user.png";
import networking from "./components/images/networking.png";
import prescriptionSmall from "./components/images/prescription(3).png";
import healthReport from "./components/images/health-report(1).png";
import analysis from "./components/images/analysis.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/auth/authprovider";
import { Prescriptions } from "./components/view-prescriptions";
import { ViewLogs } from "./components/logs";
import { ViewProfile } from "./components/view-profile";
import { Toaster } from "sonner";
import { Analytics } from "./components/analytics";
import { Homepage } from "./components/home";
import { AddRecords } from "./components/add-records";
import { Spinner } from "@/components/ui/spinner";
import { PendingRecords } from "./components/view-pending";
import { EditProfile } from "./components/edit-profile";
function NavigateToMyProfile() {
    const { user } = useAuth();
    if (!user)
        return null;
    return _jsx(Navigate, { to: `/profile/${user.uid}`, replace: true });
}
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen w-full", children: _jsx(Spinner, { className: "size-40 text-orange-500" }) }));
    if (!user)
        return _jsx(Navigate, { to: "/", replace: true });
    return _jsx(_Fragment, { children: children });
}
function App() {
    const { user } = useAuth();
    return (_jsxs(_Fragment, { children: [_jsx(Toaster, { position: "top-right", toastOptions: {
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                } }), _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: !user ? (_jsxs("div", { className: "h-screen relative flex justify-center items-center overflow-y-auto bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 p-6", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "flex flex-col lg:flex-row  h-screen w-full", children: _jsxs("div", { className: "flex flex-col lg:flex-row h-screen w-full", children: [_jsx("div", { className: "flex flex-1 items-center justify-center ", children: _jsxs(Card, { className: "h-full w-full border-none rounded-none  flex flex-col items-center justify-center text-center px-6", children: [_jsx("p", { className: "flex text-3xl font-bold justify-center items-center", children: "Get access to everything MEDALI has to offer" }), _jsxs("div", { className: "flex flex-col gap-6 mt-6 max-w-md", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarImage, { src: healthReport }) }), _jsx("p", { className: "text-left", children: "Access and manage all patient medical records securely" })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarImage, { src: addUser }) }), _jsx("p", { className: "text-left", children: "Create and add a patient's medical record to the Medali Database." })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarImage, { src: networking }) }), _jsx("p", { className: "text-left", children: "Manage and link accounts with other users" })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarImage, { src: prescriptionSmall }) }), _jsx("p", { className: "text-left", children: "Create and manage patient prescriptions in the system." })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarImage, { src: analysis }) }), _jsx("p", { className: "text-left", children: "View analytics of patient records and prescriptions" })] })] })] }) }), _jsx("div", { className: "flex h-full w-full lg:w-1/2 ", children: _jsx(Card, { className: "p-8  border border-none rounded-none w-full h-full overflow-y-auto", children: _jsxs(Tabs, { defaultValue: "login", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-2 w-full mb-6", children: [_jsx(TabsTrigger, { value: "login", className: "data-[state=active]:!bg-blue-500 \n                                                                    data-[state=active]:!text-white\n                                                                    !bg-blue-200 text-blue-900 transition-colors", children: "Login" }), _jsx(TabsTrigger, { value: "signup", className: "data-[state=active]:!bg-blue-500 data-[state=active]:text-white\n                                !bg-blue-200 text-blue-900 transition-colors", children: "Signup" })] }), _jsxs("div", { className: "overflow-y-auto", children: [_jsxs(TabsContent, { value: "login", children: [_jsx(CardTitle, { className: "text-2xl font-semibold text-blue-900 flex justify-center items-center", children: "Login to your account" }), _jsx(CardDescription, { className: "text-gray-600 mb-4 flex justify-center items-center", children: "Enter your email and password below to continue." }), _jsx("div", { className: "flex items-center justify-center w-full", children: _jsx(Login, {}) })] }), _jsxs(TabsContent, { value: "signup", children: [_jsx(CardTitle, { className: "text-2xl font-semibold text-blue-900 flex justify-center items-center", children: "Create an account" }), _jsx(CardDescription, { className: "text-gray-600 mb-4 flex justify-center items-center", children: "Fill out your details to get started." }), _jsx("div", { className: "flex items-center justify-center w-full", children: _jsx(SignUp, {}) })] })] })] }) }) })] }) })] })) : (_jsx(Navigate, { to: "/home", replace: true })) }), _jsx(Route, { path: "/records", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(MedicalRecords, {}) }) }) }), _jsx(Route, { path: "/pending", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(PendingRecords, {}) }) }) }), _jsx(Route, { path: "/add-record", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(AddRecords, {}) }) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ViewUsers, {}) }) }) }), _jsx(Route, { path: "/prescriptions", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Prescriptions, {}) }) }) }), _jsx(Route, { path: "/add-prescriptions", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Prescriptions, {}) }) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(NavigateToMyProfile, {}) }) }) }), _jsx(Route, { path: "/profile/:uid", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ViewProfile, {}) }) }) }), _jsx(Route, { path: "/edit-profile", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(EditProfile, {}) }) }) }), _jsx(Route, { path: "/analytics", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Analytics, {}) }) }) }), _jsx(Route, { path: "/logs", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(ViewLogs, {}) }) }) }), _jsx(Route, { path: "/home", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(Homepage, {}) }) }) })] }) })] }));
}
export default App;
