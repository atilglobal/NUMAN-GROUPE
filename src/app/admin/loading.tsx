import { PanelSkeleton } from "@/components/admin/ui";

export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PanelSkeleton />
    </div>
  );
}
