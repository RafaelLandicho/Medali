import * as React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Activity } from "lucide-react";

function NavigateToMyProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return <Navigate to={`/profile/${user.uid}`} replace />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Spinner className="size-40 text-orange-500" />
      </div>
    );
  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  const { user } = useAuth();
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="min-h-screen flex flex-col lg:flex-row bg-white">
                  {/* ── Left panel: feature highlights ── */}
                  <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 bg-gradient-to-br from-[#00c4b4]/10 via-white to-[#00a896]/5">
                    <div className="max-w-md">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl !bg-[#00a896] flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          Medali
                        </span>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
                        Everything you need to manage patient care
                      </h1>
                      <p className="text-gray-500 text-lg mb-10">
                        Secure, fast, and built for medical professionals.
                      </p>

                      <div className="space-y-5">
                        {[
                          {
                            src: healthReport,
                            text: "Access and manage all patient medical records securely",
                          },
                          {
                            src: addUser,
                            text: "Create and add patient records to the Medali database",
                          },
                          {
                            src: networking,
                            text: "Manage and link accounts with other users",
                          },
                          {
                            src: prescriptionSmall,
                            text: "Create and manage patient prescriptions",
                          },
                          {
                            src: analysis,
                            text: "View analytics of patient records and prescriptions",
                          },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-[#00a896]/10 flex items-center justify-center flex-shrink-0">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={item.src} />
                              </Avatar>
                            </div>
                            <p className="text-gray-600 text-sm">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Right panel: auth forms ── */}
                  <div className="flex flex-1 flex-col justify-start lg:justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20 overflow-y-auto">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                      <div className="w-8 h-8 rounded-lg bg-[#00a896] flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xl font-bold text-gray-800">
                        Medali
                      </span>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                      <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid grid-cols-2 w-full mb-8 bg-gray-100 rounded-xl p-1">
                          <TabsTrigger
                            value="login"
                            className="rounded-lg text-sm font-medium transition-all
                data-[state=active]:!bg-[#00a896] data-[state=active]:!text-white
                data-[state=inactive]:text-gray-500"
                          >
                            Login
                          </TabsTrigger>
                          <TabsTrigger
                            value="signup"
                            className="rounded-lg text-sm font-medium transition-all
                data-[state=active]:!bg-[#00a896] data-[state=active]:!text-white
                data-[state=inactive]:text-gray-500"
                          >
                            Sign Up
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                          <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                              Welcome back
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                              Enter your credentials to continue
                            </p>
                          </div>
                          <Login />
                        </TabsContent>

                        <TabsContent value="signup">
                          <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                              Create an account
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                              Fill out your details to get started
                            </p>
                          </div>
                          <SignUp />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />

          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Layout>
                  <MedicalRecords />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendingRecords />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-record"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewUsers />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Prescriptions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-prescriptions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Prescriptions />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* View user profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <NavigateToMyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* View other profiles */}
          <Route
            path="/profile/:uid"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewLogs />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
