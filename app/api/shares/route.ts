import { NextResponse } from "next/server";
import { adminDb } from "@/services/firebaseAdmin";
import { cookies } from "next/headers";

// Helper to get authenticated username from session
async function getAuthenticatedUser(req: Request): Promise<string | null> {
  try {
    let sessionId = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionId = authHeader.substring(7);
    }

    if (!sessionId) {
      const cookieStore = await cookies();
      sessionId = cookieStore.get("session_id")?.value || "";
    }

    if (!sessionId) return null;

    const sessionSnapshot = await adminDb.ref(`boofor/sessions/${sessionId}`).once("value");
    if (!sessionSnapshot.exists()) return null;

    const session = sessionSnapshot.val();
    return session.username || null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

// 1. POST: Share an author with another user
export async function POST(req: Request) {
  try {
    const sender = await getAuthenticatedUser(req);
    if (!sender) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên làm việc hết hạn" }, { status: 401 });
    }

    const {
      recipientUsername,
      authorName,
      bookListText,
      bookIntroMap,
      genresText,
      chapterKeywords,
      customBlockPhrases,
    } = await req.json();

    if (!recipientUsername || !authorName) {
      return NextResponse.json({ error: "Thiếu thông tin người nhận hoặc tên tác giả" }, { status: 400 });
    }

    // Verify recipient exists
    const recipientSnapshot = await adminDb.ref(`boofor/users/${recipientUsername}`).once("value");
    if (!recipientSnapshot.exists()) {
      return NextResponse.json({ error: "Người nhận không tồn tại trên hệ thống" }, { status: 404 });
    }

    if (recipientUsername === sender) {
      return NextResponse.json({ error: "Không thể tự chia sẻ tác giả cho chính mình" }, { status: 400 });
    }

    // Push share record to recipient's shares node (excluding any covers or base64 images)
    const recipientSharesRef = adminDb.ref(`boofor/shares/${recipientUsername}`);
    const newShareRef = recipientSharesRef.push();
    const shareId = newShareRef.key;
    const nowStr = new Date().toISOString();
    
    await newShareRef.set({
      id: shareId,
      sender,
      authorName,
      bookListText: bookListText || "",
      bookIntroMap: bookIntroMap || {},
      genresText: genresText || "",
      chapterKeywords: chapterKeywords || "chapter, lesson",
      customBlockPhrases: customBlockPhrases || "",
      sharedAt: nowStr,
    });

    // Also record it under the sender's sent history node
    const senderSharesRef = adminDb.ref(`boofor/sent_shares/${sender}/${shareId}`);
    await senderSharesRef.set({
      id: shareId,
      recipient: recipientUsername,
      authorName,
      status: "pending",
      sharedAt: nowStr,
    });

    return NextResponse.json({ success: true, shareId: shareId });
  } catch (error) {
    console.error("Share Author Error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi chia sẻ tác giả" }, { status: 500 });
  }
}

// 2. GET: List all pending shares and sent shares history for the authenticated user
export async function GET(req: Request) {
  try {
    const username = await getAuthenticatedUser(req);
    if (!username) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên làm việc hết hạn" }, { status: 401 });
    }

    const sharesSnapshot = await adminDb.ref(`boofor/shares/${username}`).once("value");
    const sharesData = sharesSnapshot.val() || {};

    const sharesList = [];
    for (const key in sharesData) {
      sharesList.push(sharesData[key]);
    }

    // Sort by sharedAt (newest first)
    sharesList.sort((a: any, b: any) => {
      return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime();
    });

    // Fetch sent shares history
    const sentSnapshot = await adminDb.ref(`boofor/sent_shares/${username}`).once("value");
    const sentData = sentSnapshot.val() || {};

    const sentList = [];
    for (const key in sentData) {
      sentList.push(sentData[key]);
    }

    // Sort by sharedAt (newest first)
    sentList.sort((a: any, b: any) => {
      return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime();
    });

    return NextResponse.json({
      success: true,
      shares: sharesList,
      sentShares: sentList,
    });
  } catch (error) {
    console.error("Get Shares Error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi tải danh sách chia sẻ" }, { status: 500 });
  }
}

// 3. DELETE: Remove/Decline/Imported a share record
export async function DELETE(req: Request) {
  try {
    const username = await getAuthenticatedUser(req);
    if (!username) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên làm việc hết hạn" }, { status: 401 });
    }

    const { shareId, status } = await req.json();
    if (!shareId) {
      return NextResponse.json({ error: "Thiếu ID bản ghi chia sẻ" }, { status: 400 });
    }

    const shareRef = adminDb.ref(`boofor/shares/${username}/${shareId}`);
    const snapshot = await shareRef.once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Bản ghi chia sẻ không tồn tại hoặc đã bị xóa" }, { status: 404 });
    }

    const share = snapshot.val();
    await shareRef.remove();

    // Update status in sender's sent_shares node if it exists
    if (share.sender) {
      const sentShareRef = adminDb.ref(`boofor/sent_shares/${share.sender}/${shareId}`);
      const sentSnapshot = await sentShareRef.once("value");
      if (sentSnapshot.exists()) {
        await sentShareRef.update({
          status: status === "accept" ? "accepted" : status === "decline" ? "declined" : "removed",
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Send a status notification back to the sender if they shared it
    if (share.sender && (status === "accept" || status === "decline")) {
      const notificationRef = adminDb.ref(`boofor/notifications/${share.sender}`);
      const newNotifRef = notificationRef.push();
      await newNotifRef.set({
        id: newNotifRef.key,
        type: status,
        recipient: username,
        authorName: share.authorName,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Share Error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi xử lý xóa chia sẻ" }, { status: 500 });
  }
}
