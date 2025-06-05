import { MedicineForm } from "@/components/features/inventory/MedicineForm";
import { updateMedicineAction, fetchMedicineById } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function EditMedicinePage({ params }: { params: { id: string } }) {
  const medicine = await fetchMedicineById(params.id);

  if (!medicine) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" /> Medicine Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>The medicine you are trying to edit does not exist or could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  // Bind the ID to the action
  const updateActionWithId = updateMedicineAction.bind(null, params.id);

  return (
    <div>
      <MedicineForm
        action={updateActionWithId}
        initialData={medicine}
        formType="edit"
      />
    </div>
  );
}
