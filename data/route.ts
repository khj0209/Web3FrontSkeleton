import { NextResponse } from "next/server";
import { db } from "../lib/firebase/clientApp";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const data = await request.json();
    
    try {
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }
  }
  