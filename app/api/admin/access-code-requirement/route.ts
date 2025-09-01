import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../lib/firebaseAdmin";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the current access code requirement setting from Firestore
    const configDoc = await db
      .collection("systemConfig")
      .doc("accessControl")
      .get();

    if (!configDoc.exists) {
      // If no config exists, create default (access codes required)
      await db
        .collection("systemConfig")
        .doc("accessControl")
        .set({
          accessCodeRequired: true,
          lastUpdated: new Date(),
          updatedBy: cookieStore.get("userId")?.value || "unknown",
        });

      const response = NextResponse.json({ success: true, required: true });
      response.cookies.set("accessCodeRequired", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    const config = configDoc.data();
    const required = config?.accessCodeRequired ?? true;

    const response = NextResponse.json({
      success: true,
      required: required,
    });

    response.cookies.set("accessCodeRequired", required.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error fetching access code requirement:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { required } = await request.json();

    if (typeof required !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid required parameter" },
        { status: 400 }
      );
    }

    // Update the access code requirement setting in Firestore
    await db
      .collection("systemConfig")
      .doc("accessControl")
      .set({
        accessCodeRequired: required,
        lastUpdated: new Date(),
        updatedBy: cookieStore.get("userId")?.value || "unknown",
      });

    const status = required ? "enabled" : "disabled";
    const response = NextResponse.json({
      success: true,
      message: `✅ Access code requirement ${status} successfully`,
      required: required,
    });

    // Set a cookie that middleware can read to determine if access codes are required
    if (required) {
      response.cookies.set("accessCodeRequired", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: false, // Allow JavaScript to read this cookie
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    } else {
      response.cookies.set("accessCodeRequired", "false", {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: false, // Allow JavaScript to read this cookie
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error updating access code requirement:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
