import Topbar from "@/components/layout/Topbar";
import TasksView from "@/components/tasks/TasksView";

export default function Home() {
  return (
    <>
      <Topbar title="Tasks" sub="Everything on your plate, one honest list." />
      <TasksView />
    </>
  );
}
