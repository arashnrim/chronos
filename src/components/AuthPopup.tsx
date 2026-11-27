import { Button } from "@components/ui/Button";
import { IconHandStop } from "@tabler/icons-react";

type AuthPopupProps = {
  attempt: number;
  onRetry: () => void;
};

export const AuthPopup = ({ attempt, onRetry }: AuthPopupProps) => (
  <section
    className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/35 px-6 py-12 backdrop-blur-sm"
    role="alert"
  >
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl sm:p-10">
      <IconHandStop className="mx-auto mt-4 mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold">Halt! Who goes there?</h1>
      <p className="mt-4 text-muted-foreground">
        {attempt > 1
          ? "Doesn't look right leh, try sending your name and password again."
          : "Just enter your name and the password to continue. The capitalisation doesn't matter, just spell properly can already."}
      </p>
      <Button className="mt-6" onClick={onRetry}>
        {attempt > 1 ? "One more time" : "Let me in leh"}
      </Button>
      {attempt > 1 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Nothing happening after clicking the button? Try closing your browser
          and loading the page again.
        </p>
      )}
    </div>
  </section>
);
