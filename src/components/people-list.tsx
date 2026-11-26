import type { Person, PersonOut } from "@utils/attendance";
import { capacityLevelColors, getCapacityLevel } from "@utils/attendance";
import { Spinner } from "@components/ui/spinner";

export function PeopleList({
  title,
  people,
  capacityLevel,
}: {
  title: string;
  people: (Person | PersonOut)[];
  capacityLevel: ReturnType<typeof getCapacityLevel>;
}) {
  return (
    <section
      className="min-w-0 rounded-lg border bg-card p-5"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm">
          <span
            className={[
              "font-semibold",
              title === "People in" && capacityLevel
                ? capacityLevelColors[capacityLevel]
                : "",
            ].join(" ")}
          >
            {people.length}
          </span>
          <span className="text-muted-foreground">
            {" "}
            {people.length === 1 ? "person" : "people"}
          </span>
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
                <p className="break-words text-sm font-semibold">
                  {person.name}
                </p>
                {"reasons" in person && (
                  <p className="break-words text-xs text-muted-foreground">
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

export function PeopleListLoading({ title }: { title: string }) {
  return (
    <section
      className="min-w-0 rounded-lg border bg-card p-5"
      aria-label={`${title} loading`}
      aria-busy="true"
    >
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span
          aria-hidden="true"
          className="h-4 w-8 animate-pulse rounded bg-muted"
        />
      </div>
      <div className="flex min-h-24 items-center justify-center">
        <Spinner aria-label={`Loading ${title.toLowerCase()}`} />
      </div>
    </section>
  );
}
