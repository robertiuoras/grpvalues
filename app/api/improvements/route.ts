import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";

// Initialize Firestore
const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all improvements from Firestore
    const improvementsRef = db.collection("improvements");
    const snapshot = await improvementsRef.orderBy("createdAt", "desc").get();

    const improvements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ improvements });
  } catch (error) {
    console.error("Error fetching improvements:", error);
    return NextResponse.json(
      { error: "Failed to fetch improvements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, priority, category, assignedTo, dueDate } =
      body;

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Create improvement document
    const improvementData = {
      title: title.trim(),
      description: description.trim(),
      priority: priority || "medium",
      category: category?.trim() || "",
      assignedTo: assignedTo?.trim() || "",
      dueDate: dueDate || "",
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await db.collection("improvements").add(improvementData);

    const savedImprovement = {
      id: docRef.id,
      ...improvementData,
    };

    return NextResponse.json(
      {
        message: "Improvement created successfully",
        improvement: savedImprovement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating improvement:", error);
    return NextResponse.json(
      { error: "Failed to create improvement" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      priority,
      category,
      assignedTo,
      dueDate,
      isCompleted,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Improvement ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Update improvement document
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      priority: priority || "medium",
      category: category?.trim() || "",
      assignedTo: assignedTo?.trim() || "",
      dueDate: dueDate || "",
      updatedAt: new Date().toISOString(),
    };

    // Handle completion status
    if (typeof isCompleted === "boolean") {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date().toISOString();
      } else {
        updateData.completedAt = null;
      }
    }

    // Update in Firestore
    await db.collection("improvements").doc(id).update(updateData);

    return NextResponse.json({
      message: "Improvement updated successfully",
    });
  } catch (error) {
    console.error("Error updating improvement:", error);
    return NextResponse.json(
      { error: "Failed to update improvement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("isAuthenticated")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!isAuthenticated || userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Improvement ID is required" },
        { status: 400 }
      );
    }

    // Delete from Firestore
    await db.collection("improvements").doc(id).delete();

    return NextResponse.json({
      message: "Improvement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting improvement:", error);
    return NextResponse.json(
      { error: "Failed to delete improvement" },
      { status: 500 }
    );
  }
}
