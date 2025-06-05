
import { getMedicines } from "@/lib/data";
import { InventoryClientView } from "@/components/features/inventory/InventoryClientView";

export default async function InventoryPage() {
  const medicines = await getMedicines();

  return (
    <InventoryClientView initialMedicines={medicines} />
  );
}
