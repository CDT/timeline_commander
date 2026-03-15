import { NextResponse } from "next/server";

export type ApiError = {
  code: string;
  message: string;
};

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function apiOk<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

export function apiCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}
