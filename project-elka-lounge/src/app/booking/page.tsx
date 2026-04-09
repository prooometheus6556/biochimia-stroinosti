import BookingFormClient from "./BookingFormClient";
import { getTables } from "@/app/actions";

export default async function BookingPage() {
  const tables = await getTables();
  
  return <BookingFormClient tables={tables} />;
}
