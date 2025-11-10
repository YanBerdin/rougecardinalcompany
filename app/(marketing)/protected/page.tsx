import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";

//TODO: remove this page before production
export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 mt-20">
      <div className="w-full">
        <Link
          href="/admin/team"
          className="underline text-5xl hover:bg-primary/10 rounded px-1"
        >
          👉🏼 ADMIN/TEAM PAGE
        </Link>
        <br />
        <Link
          href="/admin"
          className="underline text-5xl hover:bg-primary/10 rounded px-1 mt-5 block"
        >
          👉🏼 ADMIN PAGE
        </Link>
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center mt-10">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
