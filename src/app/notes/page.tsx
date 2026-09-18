import Topbar from "@/components/layout/Topbar";
import NotesView from "@/components/notes/NotesView";

export default function NotesPage() {
  return (
    <>
      <Topbar title="Notes" sub="Freeform thoughts, pinned and tagged." />
      <NotesView />
    </>
  );
}
