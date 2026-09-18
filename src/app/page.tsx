import Topbar from "@/components/layout/Topbar";
import TasksView from "@/components/tasks/TasksView";

export default function Home() {
  return (
    <>
      <Topbar title="Tasks" sub="Everything open, in progress, and done" />
      <TasksView />
    </>
  );
}
