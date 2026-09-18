import Topbar from "@/components/layout/Topbar";
import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <>
      <Topbar title="Calendar" sub="Every task with a due date, laid out by month." />
      <CalendarView />
    </>
  );
}
