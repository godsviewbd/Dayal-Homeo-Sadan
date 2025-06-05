
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteMedicineAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface DeleteMedicineButtonProps {
  medicineId: string;
  medicineName: string;
}

export function DeleteMedicineButton({ medicineId, medicineName }: DeleteMedicineButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMedicineAction(medicineId);
      toast({
        title: "Medicine Deleted",
        description: `"${medicineName}" has been removed from the inventory.`,
      });
      setIsOpen(false); 
    } catch (error) {
      toast({
        title: "Error Deleting Medicine",
        description: `Failed to delete "${medicineName}". Please try again. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" title={`Delete ${medicineName}`} className="h-9 w-9 btn-transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {medicineName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete "{medicineName}"? This action cannot be undone and will permanently remove the medicine.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting} className="h-10 btn-transition">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 btn-transition">
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Medicine"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
