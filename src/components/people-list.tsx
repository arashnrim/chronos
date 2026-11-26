import type { Person, PersonOut } from "@utils/attendance";

export function PeopleList({
  title,
  people,
}: {
  title: string;
  people: (Person | PersonOut)[];
}) {
  return (
    <section
      className="min-w-0 rounded-lg border bg-card p-5"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {people.length}
        </span>
      </div>
      {people.length === 0 ? (
        <p className="py-5 text-sm text-muted-foreground">
          No people {title === "People in" ? "in" : "out"}.
        </p>
      ) : (
        <ul className="divide-y">
          {people.map((person) => (
            <li key={person.name} className="flex items-center gap-3 py-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
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
                <p className="break-words text-sm font-medium">{person.name}</p>
                {"reasons" in person && (
                  <p className="break-words text-sm text-muted-foreground">
                    {person.reasons.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
