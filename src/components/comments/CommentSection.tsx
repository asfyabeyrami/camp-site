"use client";
import {
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  StarIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Cookies from "js-cookie";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_BASE_URL;

type User = { id: string; userName: string };

// این دقیقا با خروجی جدید سرور
type ApiComment = {
  id: string;
  userId: string;
  comment: string;
  isPublish: boolean;
  star: number;
  createdAt: string;
  User?: { id: string; userName: string };
  replay_comment?: ApiReply[];
};

type ApiReply = {
  id: string;
  commentId: string;
  userId: string;
  comment: string;
  isPublish: boolean;
  createdAt: string;
  User?: { id: string; userName: string };
};

// ساختار قابل استفاده در کل کامپوننت قبلی (با replies)
type RawComment = {
  id: string;
  userId: string;
  userName?: string;
  comment: string;
  parentId?: string;
  star: number;
  createdAt: string;
  replies?: RawComment[];
  User?: { userName: string; id: string };
};

async function fetchUser(token: string): Promise<User | null> {
  const resp = await fetch(`${API}/user/whoAmI`, {
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!resp.ok) return null;
  return await resp.json();
}

// اصلاح‌شده بدون any و با map صحیح ریپلای:
async function fetchComments(productId: string): Promise<RawComment[]> {
  const resp = await fetch(`${API}/comment/getcomment/${productId}`);
  const data: { data: ApiComment[] } = await resp.json();
  if (!resp.ok || !data?.data) return [];
  return data.data.map((item) => ({
    id: item.id,
    userId: item.userId,
    userName: item.User?.userName || "کاربر",
    comment: item.comment,
    star: item.star,
    createdAt: item.createdAt,
    replies: Array.isArray(item.replay_comment)
      ? item.replay_comment.map((reply) => ({
          id: reply.id,
          userId: reply.userId,
          userName: reply.User?.userName || "کاربر",
          comment: reply.comment,
          star: 0,
          createdAt: reply.createdAt,
          replies: [],
          User: reply.User
            ? { userName: reply.User.userName, id: reply.User.id }
            : undefined,
        }))
      : [],
    User: item.User
      ? { userName: item.User.userName, id: item.User.id }
      : undefined,
  }));
}

async function postComment({
  token,
  productId,
  comment,
  star,
}: {
  token: string;
  productId: string;
  comment: string;
  star: number | undefined;
}) {
  const resp = await fetch(`${API}/comment/create`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, comment, star }),
  });
  if (!resp.ok) throw new Error("ثبت نظر انجام نشد");
  return await resp.json();
}
async function editComment({
  token,
  commentId,
  productId,
  comment,
  star,
}: {
  token: string;
  commentId: string;
  productId: string;
  comment: string;
  star: number;
}) {
  const resp = await fetch(`${API}/comment/update/${commentId}`, {
    method: "PUT",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, comment, star }),
  });
  if (!resp.ok) throw new Error("آپدیت نظر انجام نشد");
  return await resp.json();
}
async function deleteComment({
  token,
  commentId,
}: {
  token: string;
  commentId: string;
}) {
  const resp = await fetch(`${API}/comment/comment/${commentId}`, {
    method: "DELETE",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) throw new Error("حذف نظر انجام نشد");
  return await resp.json();
}
function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("fa-IR");
  } catch {
    return date;
  }
}
const LOCAL_COMMENT_KEY = "pending-comment";
const LOCAL_REPLY_KEY = "pending-reply";
export const CommentSection: React.FC<{ productId: string }> = ({
  productId,
}) => {
  const [comments, setComments] = useState<RawComment[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myComment, setMyComment] = useState<null | {
    comment: string;
    star: number;
    id?: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = Cookies.get("token");
      let who: User | null = null;
      if (token) {
        who = await fetchUser(token);
        setUser(who);
      } else {
        setUser(null);
      }
      const cs = await fetchComments(productId);
      if (who) {
        cs.forEach((c) => {
          if (c.userId === who.id) {
            setMyComment({ comment: c.comment, star: c.star, id: c.id });
          }
        });
      } else {
        setMyComment(null);
      }
      setComments(cs);
      const restoringComment =
        searchParams.get("pending") === "comment" &&
        sessionStorage.getItem(LOCAL_COMMENT_KEY);
      if (restoringComment && who) {
        setMyComment((old) => ({
          comment: sessionStorage.getItem(LOCAL_COMMENT_KEY) || "",
          star: old?.star ?? 5,
          id: old?.id,
        }));
        setTimeout(() => {
          document
            .getElementById("product-comment-form")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
      }
      setLoading(false);
      sessionStorage.removeItem(LOCAL_COMMENT_KEY);
      sessionStorage.removeItem(LOCAL_REPLY_KEY);
    }
    load();
    // eslint-disable-next-line
  }, [productId]);
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);
  // ثبت/ویرایش نظر
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const token = Cookies.get("token");
    const redirectPath = `${pathname}${window.location.search || ""}`;
    if (!token) {
      sessionStorage.setItem(LOCAL_COMMENT_KEY, myComment?.comment || "");
      router.push(
        `/auth?redirect=${encodeURIComponent(redirectPath)}&pending=comment`
      );
      setSubmitting(false);
      return;
    }
    const who = await fetchUser(token);
    if (!who) {
      sessionStorage.setItem(LOCAL_COMMENT_KEY, myComment?.comment || "");
      router.push(
        `/auth?redirect=${encodeURIComponent(redirectPath)}&pending=comment`
      );
      setSubmitting(false);
      return;
    }
    try {
      if (!myComment?.id) {
        await postComment({
          token,
          productId,
          comment: myComment?.comment || "",
          star: myComment?.star,
        });
      } else {
        await editComment({
          token,
          commentId: myComment.id,
          productId,
          comment: myComment.comment,
          star: myComment.star,
        });
      }
      setError(null);
      const cs = await fetchComments(productId);
      cs.forEach((c) => {
        if (c.userId === who.id)
          setMyComment({ comment: c.comment, star: c.star, id: c.id });
      });
      setComments(cs);
      sessionStorage.removeItem(LOCAL_COMMENT_KEY);
      setSuccess(
        myComment?.id
          ? "نظر شما با موفقیت ویرایش شد!"
          : "نظر شما با موفقیت ثبت شد!"
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "مشکلی در ثبت نظر! لطفاً بعداً دوباره تلاش کنید."
      );
    } finally {
      setSubmitting(false);
    }
  }
  // حذف نظر
  async function handleDelete(commentId: string) {
    if (!window.confirm("آیا از حذف نظر مطمئن هستید؟")) return;
    const token = Cookies.get("token");
    const redirectPath = `${pathname}${window.location.search || ""}`;
    if (!token) {
      router.push(
        `/auth?redirect=${encodeURIComponent(redirectPath)}&pending=comment`
      );
      return;
    }
    const who = await fetchUser(token);
    if (!who) {
      router.push(
        `/auth?redirect=${encodeURIComponent(redirectPath)}&pending=comment`
      );
      return;
    }
    setSubmitting(true);
    try {
      await deleteComment({ token, commentId });
      if (myComment?.id === commentId) setMyComment(null);
      const cs = await fetchComments(productId);
      setComments(cs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف نشد");
    } finally {
      setSubmitting(false);
    }
  }
  // فرم ثبت/ویرایش کامنت خودم
  function myForm() {
    if (!user) {
      return (
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-bold shadow transition"
          onClick={() => {
            const redirectPath = `${pathname}${window.location.search || ""}`;
            router.push(
              `/auth?redirect=${encodeURIComponent(
                redirectPath
              )}&pending=comment`
            );
          }}
        >
          ثبت نام / ورود برای ثبت نظر
        </button>
      );
    }
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 mb-8 flex flex-col gap-4"
        id="product-comment-form"
      >
        <div className="flex flex-col sm:flex-row w-full items-center gap-3 mb-2">
          <label className="min-w-[60px] font-bold text-blue-900">
            امتیاز:
          </label>
          <div className="flex flex-row-reverse gap-1 text-xl">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                className={clsx(
                  "transition hover:scale-110",
                  s <= (myComment?.star ?? 5)
                    ? "text-yellow-400"
                    : "text-gray-300"
                )}
                onClick={() =>
                  setMyComment((old) => ({
                    comment: old?.comment ?? "",
                    star: s,
                    id: old?.id,
                  }))
                }
                tabIndex={-1}
              >
                <StarIcon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={myComment?.comment || ""}
          onChange={(e) =>
            setMyComment((old) => ({
              comment: e.target.value,
              star: old?.star ?? 5,
              id: old?.id,
            }))
          }
          minLength={3}
          maxLength={400}
          required
          placeholder="نظر خود را درباره محصول بنویسید (حداقل ۳ کاراکتر)..."
          className="rounded-lg border border-blue-200 bg-white/90 py-3 px-4 w-full resize-none focus:outline-none focus:ring ring-blue-200 transition shadow"
          rows={3}
          disabled={submitting}
        />
        <div className="flex flex-row items-center justify-between gap-2">
          <button
            type="submit"
            className={clsx(
              "flex items-center justify-center gap-1 px-6 py-2 rounded-lg font-extrabold transition w-fit min-w-[110px]",
              success
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            disabled={
              submitting ||
              !(myComment?.comment && myComment.comment.trim().length >= 3) ||
              !!success
            }
          >
            {success ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-white" />
                ثبت شد
              </>
            ) : submitting ? (
              <span className="animate-pulse">در حال ارسال...</span>
            ) : myComment?.id ? (
              "ویرایش نظر"
            ) : (
              "ثبت نظر"
            )}
          </button>
          {myComment?.id && (
            <button
              type="button"
              className="text-rose-600 hover:underline text-base flex items-center gap-1"
              onClick={() => handleDelete(myComment.id!)}
              disabled={submitting}
            >
              <TrashIcon className="w-5 h-5" />
              حذف نظر من
            </button>
          )}
        </div>
        {!user && (
          <span className="block text-blue-400 text-xs mt-1">
            برای ثبت نظر باید وارد حساب خود شوید.
          </span>
        )}
        {error && (
          <span className="block text-rose-500 text-sm font-bold">{error}</span>
        )}
      </form>
    );
  }

  // --- CommentItem ---
  function CommentItem({
    comment,
    depth = 0,
  }: {
    comment: RawComment;
    depth?: number;
  }) {
    const [showReplies, setShowReplies] = React.useState(true);
    const [replying, setReplying] = React.useState(false);
    const [replyText, setReplyText] = React.useState("");
    const [localSubmitting, setLocalSubmitting] = React.useState(false);

    async function handleReply(e: React.FormEvent) {
      e.preventDefault();
      setLocalSubmitting(true);
      try {
        const token = Cookies.get("token");
        const redirectPath = `${window.location.pathname}${
          window.location.search || ""
        }`;
        if (!token) {
          sessionStorage.setItem(
            LOCAL_REPLY_KEY,
            JSON.stringify({
              replyTo: { id: comment.id, userName: comment.userName },
              replyText,
            })
          );
          window.location.href = `/auth?redirect=${encodeURIComponent(
            redirectPath
          )}&pending=reply`;
          return;
        }
        const who = await fetchUser(token);
        if (!who) {
          sessionStorage.setItem(
            LOCAL_REPLY_KEY,
            JSON.stringify({
              replyTo: { id: comment.id, userName: comment.userName },
              replyText,
            })
          );
          window.location.href = `/auth?redirect=${encodeURIComponent(
            redirectPath
          )}&pending=reply`;
          return;
        }
        const resp = await fetch(`${API}/comment/replay`, {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentId: comment.id, comment: replyText }),
        });
        if (!resp.ok) throw new Error("ثبت پاسخ انجام نشد");
        setReplyText("");
        setReplying(false);
        const cs = await fetchComments(productId);
        setComments(cs);
      } catch (e) {
        alert(e instanceof Error ? e.message : "پاسخ ارسال نشد");
      } finally {
        setLocalSubmitting(false);
      }
    }
    return (
      <div
        className={clsx(
          "rounded-xl border bg-white p-4 relative mb-2",
          depth > 0 ? "ml-7 border-blue-100 shadow" : "border-gray-200"
        )}
      >
        <div className="flex flex-row items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-7 h-7 text-gray-300" />
            <div>
              <span className="font-bold text-blue-900 text-[15px]">
                {comment.userName || "کاربر"}
              </span>
              <div className="flex gap-1 items-center">
                {[...Array(comment.star || 0)].map((_, idx) => (
                  <StarIcon
                    key={idx}
                    className="w-4 h-4 inline text-yellow-400"
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="text-gray-400 text-xs">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <div className="text-[15px] text-gray-700 leading-relaxed pr-2 my-1">
          {comment.comment}
        </div>
        <div className="flex flex-row gap-2 items-center mt-2">
          <button
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm py-[2px] px-2 rounded"
            onClick={() => setReplying((prev) => !prev)}
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            پاسخ
          </button>
          {user && comment.userId === user.id && depth === 0 && (
            <span className="flex items-center gap-1 ml-4">
              <button
                className="text-rose-500 flex items-center gap-1 text-xs"
                onClick={() => handleDelete(comment.id)}
              >
                <TrashIcon className="w-4 h-4" />
                حذف
              </button>
            </span>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <button
              className="ml-4 text-xs text-blue-500 flex items-center gap-1"
              onClick={() => setShowReplies((x) => !x)}
            >
              <ChevronDownIcon
                className={clsx(
                  "w-4 h-4 transition-transform",
                  showReplies ? "rotate-180" : ""
                )}
              />
              {showReplies
                ? `مخفی کردن پاسخ‌ها (${comment.replies.length})`
                : `${comment.replies.length} پاسخ`}
            </button>
          )}
        </div>
        {replying && (
          <form
            id={`reply-form-${comment.id}`}
            onSubmit={handleReply}
            className="mt-3 flex flex-col gap-2"
          >
            <textarea
              className="rounded border border-blue-200 p-2 w-full bg-blue-50 focus:bg-white focus:ring-2 transition"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder={"پاسخ به " + comment.userName}
              maxLength={300}
              required
              disabled={localSubmitting}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 text-[14px] rounded-lg font-bold"
                disabled={localSubmitting || !replyText.trim()}
              >
                ارسال پاسخ
              </button>
              <button
                type="button"
                className="text-gray-500 hover:underline text-[13px]"
                onClick={() => setReplying(false)}
              >
                لغو
              </button>
            </div>
            {!user && (
              <span className="block text-blue-400 text-xs mt-1">
                برای پاسخ باید وارد حساب خود شوید.
              </span>
            )}
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && showReplies && (
          <div className="mt-3 border-t border-blue-50 pt-2">
            {comment.replies
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((rep) => (
                <CommentItem key={rep.id} comment={rep} depth={depth + 1} />
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto my-8">
      <h3 className="font-bold mb-4 text-black-700 text-2xl border-b pb-2 border-gray-100">
        نظرات کاربران
      </h3>
      {loading && (
        <div className="text-center text-black-400 py-12 text-lg">
          در حال بارگذاری...
        </div>
      )}
      {myForm()}
      {success && (
        <div className="mt-3 text-center text-sm text-green-600 font-bold">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-3 text-center text-sm text-rose-500 font-bold">
          {error}
        </div>
      )}
      <div className="space-y-3 mt-6">
        {comments.length ? (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        ) : (
          <div className="bg-slate-50 rounded-xl text-gray-400 py-8 text-center">
            <div className="font-bold text-blue-500 text-lg mb-2">
              اولین نفری باشید که درباره این محصول نظر می‌دهد!
            </div>
            <div className="text-sm text-gray-400">
              با ثبت نظر خود به دیگران کمک کنید تا انتخاب بهتری داشته باشند.
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-3 text-center text-sm text-rose-500 font-bold">
          {error}
        </div>
      )}
    </section>
  );
};
