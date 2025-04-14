"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  tags?: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/my-posts")
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.posts || []); // Make sure posts exist in the response
          setLoading(false);
        })
        .catch((error) => {
          console.error("Алдаа:", error);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading)
    return <p className="text-center">Түр хүлээнэ үү...</p>;
  if (!session || !session.user)
    return <p className="text-center">Нэвтрээгүй байна.</p>;

  const { user } = session;

  return (
    <div className="max-w-2xl pt-20 mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center space-x-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-xl">
            {user.name?.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{user.name || "Нэргүй"}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-semibold">Миний нийтлэлүүд</h2>

      {posts.length === 0 ? (
        <p className="text-gray-500">Одоогоор нийтлэл байхгүй.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>

              {/* Handle missing imageUrl */}
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="mt-2 w-full h-auto rounded-md"
                />
              ) : (
                <div className="mt-2 w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                  Зураг байхгүй
                </div>
              )}

              <p className="text-gray-800 mt-2">
                {post.content ? post.content.substring(0, 100) : "Агуулга байхгүй"}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
