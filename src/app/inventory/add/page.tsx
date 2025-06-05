import { MedicineForm } from "@/components/features/inventory/MedicineForm";
import { addMedicineAction } from "@/lib/actions";

export default function AddMedicinePage() {
  return (
    <div>
      <MedicineForm action={addMedicineAction} formType="add" />
    </div>
  );
}
