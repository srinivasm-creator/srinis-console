import Topbar from "@/components/layout/Topbar";
import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <>
      <Topbar title="Calendar" sub="Tasks laid out by due date" />
      <CalendarView />
    </>
  );
}
