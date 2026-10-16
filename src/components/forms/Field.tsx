import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/components/ui/cn";

type FieldFrameProps = {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel: string;
  hint?: string;
  error?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

const controlClasses =
  "block w-full rounded-[3px] border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/80 transition-colors hover:border-navy-700 aria-[invalid=true]:border-red-700";

function FieldFrame({ id, label, required, requiredLabel, hint, error, children }: FieldFrameProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-navy-950">
        {label}
        {required ? (
          <span className="ml-1 text-muted">
            <span aria-hidden="true">*</span>
            <span className="sr-only"> ({requiredLabel})</span>
          </span>
        ) : null}
      </label>
      {children(describedBy)}
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseFieldProps = {
  id: string;
  label: string;
  requiredLabel: string;
  hint?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  requiredLabel,
  hint,
  error,
  className,
  ...input
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldFrame {...{ id, label, requiredLabel, hint, error }} required={input.required}>
      {(describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClasses, className)}
          {...input}
        />
      )}
    </FieldFrame>
  );
}

export function TextAreaField({
  id,
  label,
  requiredLabel,
  hint,
  error,
  className,
  ...textarea
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldFrame {...{ id, label, requiredLabel, hint, error }} required={textarea.required}>
      {(describedBy) => (
        <textarea
          id={id}
          rows={6}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClasses, "resize-y", className)}
          {...textarea}
        />
      )}
    </FieldFrame>
  );
}

export function SelectField({
  id,
  label,
  requiredLabel,
  hint,
  error,
  className,
  options,
  ...select
}: BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
  }) {
  return (
    <FieldFrame {...{ id, label, requiredLabel, hint, error }} required={select.required}>
      {(describedBy) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClasses, "appearance-auto", className)}
          {...select}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldFrame>
  );
}
