"use client";

import { useRef, useState } from "react";
import { UploadIcon, XIcon, Loader2Icon } from "lucide-react";
import { itemsApi } from "@/lib/api/items";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * Per-question image control (web/PWA). Uploads the file to the server
 * (`POST /items/images`), then hands the returned URL up via `onChange`; the
 * parent stores it in the item version's `media_attachments` on save. Shows a
 * preview with a remove button once set.
 */
export function QuestionImageField({
  value,
  onChange,
  disabled,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const m = t.common.media;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const { url } = await itemsApi.uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? m.tooLarge : m.failed);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">{m.image}</div>

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-48 rounded-lg border border-border object-contain"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label={m.remove}
            className="absolute -top-2 -end-2 flex size-7 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            (disabled || busy) && "pointer-events-none opacity-60",
          )}
        >
          {busy ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <UploadIcon className="size-4" />
          )}
          {busy ? m.uploading : m.upload}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{m.imageHint}</p>
    </div>
  );
}
