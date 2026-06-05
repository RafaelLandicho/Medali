import { QuickTool } from "@/components/quick-tool";
import { useAuth } from "@/auth/authprovider";
import HeaderPage from "./components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen w-full">
      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="sticky top-0 z-50 w-full bg-background border-b">
          <HeaderPage />
        </div>
        {/* Floating QuickTool */}
        <div>
          <QuickTool />
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
