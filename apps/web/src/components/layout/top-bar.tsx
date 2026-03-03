import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function TopBar() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/30 bg-background/50 px-6 backdrop-blur-sm">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {session?.user && (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {(session.user.name ?? session.user.email ?? "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span className="text-sm text-muted-foreground">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
