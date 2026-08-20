import { redirect } from "next/navigation";

/** Legacy route - the trainer now lives at /quiz with subject + topic selection. */
export default function TasksPage() {
    redirect("/quiz?subject=finance");
}
