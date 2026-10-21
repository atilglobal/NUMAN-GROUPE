"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import type { ActionState } from "@/auth/session";
import { buttonClass, type ButtonVariant } from "./button-styles";

/*
 * Panel forms. Every form posts to a Server Action that authorizes and
 * validates on the server; this layer only shows the returned state. The
 * submission is dispatched manually so a failed validation keeps what the
 * user typed (React would otherwise reset the form).
 */

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

const FormContext = createContext<{ state: ActionState; pending: boolean }>({
  state: { ok: false },
  pending: false,
});

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);
  const locked = useRef(false);

  useEffect(() => {
    if (!pending) locked.current = false;
  }, [pending]);

  useEffect(() => {
    if (!state.ok) return;
    if (resetOnSuccess) formRef.current?.reset();
    onSuccess?.();
    // Runs once per returned state object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || locked.current) return;
    locked.current = true;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(formData));
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className={className} noValidate>
      <FormContext value={{ state, pending }}>{children}</FormContext>
    </form>
  );
}

export function useFormState() {
  return use(FormContext);
}

/** Announces the result of the last submission. */
export function FormStatus() {
  const { state, pending } = useFormState();
  if (pending) return null;
  const fallback =
    !state.ok && state.fieldErrors && Object.keys(state.fieldErrors).length > 0
      ? "Kayıt tamamlanamadı. İşaretli alanları kontrol edin."
      : null;
  const message = state.message ?? fallback;
  if (!message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-md border px-4 py-3 text-sm ${
        state.ok ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Kaydediliyor…",
  variant = "primary",
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormState();
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-disabled={pending} className={buttonClass(variant)}>
      {pending ? pendingLabel : children}
    </button>
  );
}

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
};

function FieldShell({
  label,
  name,
  hint,
  id,
  children,
}: FieldProps & { id: string; children: (describedBy: string | undefined, error?: string) => ReactNode }) {
  const { state } = useFormState();
  const error = state.fieldErrors?.[name];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-navy-950">
        {label}
      </label>
      {children(describedBy, error)}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm aria-[invalid=true]:border-red-600";

export function TextField({ label, name, hint, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldShell label={label} name={name} hint={hint} id={id}>
      {(describedBy, error) => (
        <input
          id={id}
          name={name}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`${inputClass} min-h-10`}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({ label, name, hint, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell label={label} name={name} hint={hint} id={id}>
      {(describedBy, error) => (
        <textarea
          id={id}
          name={name}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={inputClass}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  hint,
  options,
  defaultValue,
}: FieldProps & { options: { value: string; label: string }[]; defaultValue?: string }) {
  const id = useId();
  return (
    <FieldShell label={label} name={name} hint={hint} id={id}>
      {(describedBy, error) => (
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`${inputClass} min-h-10`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

/**
 * Explicit confirmation for destructive or far-reaching actions. Uses the
 * native modal dialog (focus trap, Escape to cancel).
 */
export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel,
  action,
  variant = "danger",
  triggerVariant = "secondary",
  children,
}: {
  triggerLabel: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  action: ServerAction;
  variant?: ButtonVariant;
  triggerVariant?: ButtonVariant;
  /** Extra fields submitted with the confirmation. */
  children?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className={buttonClass(triggerVariant)} onClick={() => dialogRef.current?.showModal()}>
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-navy-950/50"
      >
        <ActionForm action={action} className="grid gap-4 p-6" onSuccess={close} resetOnSuccess>
          <h2 id={titleId} className="text-lg font-semibold text-navy-950">
            {title}
          </h2>
          <div className="text-sm leading-relaxed text-muted">{description}</div>
          {children}
          <FormStatus />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={buttonClass("secondary")} onClick={close}>
              Vazgeç
            </button>
            <SubmitButton variant={variant} pendingLabel="İşleniyor…">
              {confirmLabel}
            </SubmitButton>
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
