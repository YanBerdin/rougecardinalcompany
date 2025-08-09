//import { DeployButton } from "@/components/deploy-button";
//import { EnvVarWarning } from "@/components/env-var-warning";
//import { AuthButton } from "@/components/auth-button";
//import { Hero } from "@/components/deleted comp/hero";
//import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
//import Link from "next/link";
import { AboutPreview } from '@/components/sections/about-preview';
import { Hero } from '@/components/sections/hero';

export default function Home() {
  return (
    <main className="space-y-0">
      <Hero />
      <AboutPreview />
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>
      </div>
    </main>
  );
}
