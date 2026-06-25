import type { StimulusOut } from "@/lib/types/practice";
import { cn } from "@/lib/utils";

/**
 * Shared reading passage / scenario (متن مشترک) shown above a question. The full
 * passage travels with every question of its group, so the learner can re-read
 * it at any time. The panel scrolls internally for long passages so it never
 * pushes the question off-screen.
 */
export function PassagePanel({
  stimulus,
  className,
}: {
  stimulus: StimulusOut;
  className?: string;
}) {
  return (
    <section
      dir="rtl"
      className={cn(
        "rounded-2xl border border-border bg-muted/30 p-5 shadow-xs",
        className,
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        متن
        {stimulus.group_no ? ` ${stimulus.group_no}` : ""}
      </p>
      <div className="mt-3 max-h-[42vh] overflow-y-auto pe-1">
        <p className="whitespace-pre-line text-[15px] leading-loose text-foreground">
          {stimulus.content}
        </p>
        {stimulus.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={stimulus.image_url}
            alt=""
            className="mt-4 max-h-64 rounded-lg border border-border object-contain"
          />
        )}
      </div>
    </section>
  );
}
