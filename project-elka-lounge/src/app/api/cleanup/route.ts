import { NextResponse } from "next/server";
import { truncateAllReservations } from "@/app/actions/admin";

export async function POST() {
  const result = await truncateAllReservations();
  return NextResponse.json(result);
}
