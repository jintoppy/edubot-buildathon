import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customDataSchema, type CustomData } from "../types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Import TipTap editor dynamically to avoid SSR issues
const Tiptap = dynamic(() => import("@/components/ui/tiptap"), {
  ssr: false,
});

const AdminAddDataPage = () => {
  const router = useRouter();
  const form = useForm<CustomData>({
    resolver: zodResolver(customDataSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: CustomData) => {
    try {
      // TODO: Implement your API call here
      const response = await fetch("/api/custom-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add custom data");

      router.push("/admin/data");
      router.refresh();
    } catch (error) {
      console.error("Error adding custom data:", error);
    }
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Add Custom Data"
          text="Add new custom data with rich text formatting"
        />
        <Button variant="outline" onClick={() => router.push("/admin/data")}>
          Cancel
        </Button>
      </div>
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Tiptap 
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Custom Data</Button>
          </form>
        </Form>
      </div>
    </DashboardShell>
  );
};

export default AdminAddDataPage;
