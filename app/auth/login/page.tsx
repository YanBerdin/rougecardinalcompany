import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
