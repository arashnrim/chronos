import { Spinner } from "@root/src/components/ui/Spinner";
import { IconUserCheck, IconUserX } from "@tabler/icons-react";
import type { PersonIn, PersonOut } from "@utils/attendance";
import type { ReactNode } from "react";

type ListVariant = "in" | "out";

const titles: Record<ListVariant, string> = {
  in: "People in",
  out: "People out",
};

function PeopleListShell({
  variant,
  loading = false,
  headerContent,
  children,
}: {
  variant: ListVariant;
  loading?: boolean;
  headerContent?: ReactNode;
  children: ReactNode;
}) {
  const title = titles[variant];

  return (
    <section
      className="min-w-0 rounded-lg border bg-card p-5 relative overflow-hidden"
      aria-label={loading ? `${title} loading` : title}
      aria-busy={loading || undefined}
    >
      {variant === "in" ? (
        <IconUserCheck
          className="absolute rotate-350 -right-0 -top-10 opacity-5 dark:opacity-2.5 z-0 w-3/5 h-auto"
          stroke={2}
        />
      ) : (
        <IconUserX
          className="absolute rotate-350 -right-0 -top-10 opacity-5 dark:opacity-2.5 z-0 w-3/5 h-auto"
          stroke={2}
        />
      )}
      <div className="flex items-center justify-between gap-4 border-b pb-4 z-10">
        <h2 className="text-lg font-semibold">{title}</h2>
        {headerContent}
      </div>
      {children}
    </section>
  );
}

export function PeopleList({
  variant,
  people,
}: {
  variant: ListVariant;
  people: (PersonIn | PersonOut)[];
}) {
  return (
    <PeopleListShell variant={variant}>
      {people.length === 0 ? (
        <p className="py-5 text-center text-muted-foreground z-10">
          {variant === "in" ? "Weird leh, no one's in" : "Everyone in liao"}
        </p>
      ) : (
        <ul className="divide-y z-10">
          {people.map((person) => (
            <li key={person.name} className="flex items-center gap-3 py-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${person.color}20`,
                  color: person.color,
                }}
              >
                {person.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="break-words font-semibold">{person.name}</p>
                {variant === "in" && "presentPeriod" in person && (
                  <p className="break-words text-xs text-muted-foreground">
                    In {person.presentPeriod}
                  </p>
                )}
                {variant === "out" && "reasons" in person && (
                  <p className="break-words text-xs text-muted-foreground">
                    {"absencePeriod" in person &&
                      `Out ${person.absencePeriod} · `}
                    {person.reasons.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PeopleListShell>
  );
}

export function PeopleListLoading({ variant }: { variant: ListVariant }) {
  const title = titles[variant];

  return (
    <PeopleListShell variant={variant} loading>
      <div className="flex min-h-24 items-center justify-center">
        <Spinner aria-label={`Loading ${title.toLowerCase()}`} />
      </div>
    </PeopleListShell>
  );
}
