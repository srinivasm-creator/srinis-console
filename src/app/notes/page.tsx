import Topbar from "@/components/layout/Topbar";
import NotesView from "@/components/notes/NotesView";

export default function NotesPage() {
  return (
    <>
      <Topbar title="Notes" sub="Quick things to hold on to, delete whenever" />
      <NotesView />
    </>
  );
}
