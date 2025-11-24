
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const AppShell = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
};
