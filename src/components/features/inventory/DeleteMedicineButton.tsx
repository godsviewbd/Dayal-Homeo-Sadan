
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Will use new button styles
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
} from '@/components/ui/alert-dialog'; // AlertDialog will need its own style review if not fitting
import { Trash2, Loader2 } from 'lucide-react';
import { deleteMedicineAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DeleteMedicineButtonProps {
  medicineId: string;
  medicineName: string;
  className?: string; // Allow passing custom class for trigger button
}

export function DeleteMedicineButton({ medicineId, medicineName, className }: DeleteMedicineButtonProps) {
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
        // Assuming toast can be styled for success/error via variant
        variant: "default", // Change to 'success' if available
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

  // Base style for desktop table icon button
  const baseTriggerClass = "flex h-9 w-9 items-center justify-center rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-800";
  
  // For mobile card, spec has a different button style
  const mobileCardTriggerClass = "h-9 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-800";


  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {/* 
          This button's styling is complex due to its usage in two contexts (table icon vs mobile card text button).
          The spec implies the mobile version is a text button "Delete".
          For simplicity now, it will be an icon button. A more robust solution might involve different trigger components.
        */}
        <Button
          variant="outline" // Using outline as a base, but specific destructive styling is applied
          size="icon" // Default to icon size
          title={`Delete ${medicineName}`}
          className={cn(
            className ? className : baseTriggerClass // Use passed class if available (for mobile card)
          )}
          aria-label={`Delete ${medicineName}`}
        >
          {className && className.includes("text-sm") ? ( // Crude check if it's mobile card style
             <>Delete</> // Show text if mobile
          ) : (
            <Trash2 className="h-5 w-5" />
          )
          }
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{medicineName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            disabled={isDeleting} 
            className="btn-outline h-11 !rounded-full !border-gray-300 !text-gray-700 hover:!bg-gray-100 dark:!border-gray-600 dark:!text-gray-300 dark:hover:!bg-gray-700"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="btn-destructive h-11 !rounded-full" // Use new destructive button style
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
