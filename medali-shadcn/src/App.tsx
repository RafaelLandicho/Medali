import * as React from "react";
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="h-screen relative flex justify-center items-center overflow-y-auto bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 p-6">
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="flex flex-col lg:flex-row  h-screen w-full">
                    {/* <div className="flex flex-col items-center text-center mb-8">
                      <h1 className="text-4xl font-bold text-green-500 tracking-tight drop-shadow-sm">
                        Welcome to Medali
                      </h1>
                      <p className="text-gray-700 text-lg mt-2">
                        Manage patient records online
                      </p>
                    </div> */}
                    <div className="flex flex-col lg:flex-row h-screen w-full">
                      <div className="flex flex-1 items-center justify-center ">
                        <Card className="h-full w-full border-none rounded-none  flex flex-col items-center justify-center text-center px-6">
                          <p className="flex text-3xl font-bold justify-center items-center">
                            Get access to everything MEDALI has to offer
                          </p>
                          <div className="flex flex-col gap-6 mt-6 max-w-md">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={healthReport} />
                              </Avatar>
                              <p className="text-left">
                                Access and manage all patient medical records
                                securely
                              </p>
                            </div>

                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={addUser} />
                              </Avatar>
                              <p className="text-left">
                                Create and add a patient's medical record to the
                                Medali Database.
                              </p>
                            </div>

                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={networking} />
                              </Avatar>
                              <p className="text-left">
                                Manage and link accounts with other users
                              </p>
                            </div>

                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={prescriptionSmall} />
                              </Avatar>
                              <p className="text-left">
                                Create and manage patient prescriptions in the
                                system.
                              </p>
                            </div>

                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={analysis} />
                              </Avatar>
                              <p className="text-left">
                                View analytics of patient records and
                                prescriptions
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                      <div className="flex h-full w-full lg:w-1/2 ">
                        <Card className="p-8  border border-none rounded-none w-full h-full overflow-y-auto">
                          <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 w-full mb-6">
                              <TabsTrigger
                                value="login"
                                className="data-[state=active]:!bg-blue-500 
                                                                    data-[state=active]:!text-white
                                                                    !bg-blue-200 text-blue-900 transition-colors"
                              >
                                Login
                              </TabsTrigger>
                              <TabsTrigger
                                value="signup"
                                className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white
                                !bg-blue-200 text-blue-900 transition-colors"
                              >
                                Signup
                              </TabsTrigger>
                            </TabsList>
                            <div className="overflow-y-auto">
                              <TabsContent value="login">
                                <CardTitle className="text-2xl font-semibold text-blue-900 flex justify-center items-center">
                                  Login to your account
                                </CardTitle>
                                <CardDescription className="text-gray-600 mb-4 flex justify-center items-center">
                                  Enter your email and password below to
                                  continue.
                                </CardDescription>
                                <div className="flex items-center justify-center w-full">
                                  <Login />
                                </div>
                              </TabsContent>

                              <TabsContent value="signup">
                                <CardTitle className="text-2xl font-semibold text-blue-900 flex justify-center items-center">
                                  Create an account
                                </CardTitle>
                                <CardDescription className="text-gray-600 mb-4 flex justify-center items-center">
                                  Fill out your details to get started.
                                </CardDescription>
                                <div className="flex items-center justify-center w-full">
                                  <SignUp />
                                </div>
                              </TabsContent>
                            </div>
                          </Tabs>
                        </Card>
                      </div>
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
      </BrowserRouter>
    </>
  );
}

export default App;
