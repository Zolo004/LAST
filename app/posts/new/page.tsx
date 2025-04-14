"use client";

import { useSession } from "next-auth/react"; // next-auth ашиглан session авна
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image, Save, X, Tag } from "lucide-react";

const availableTags = ["Tech", "Life", "Education", "Health", "Travel"];

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="text-center py-10">Ачааллаж байна...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // session байгаа эсэхийг шалгах
    if (!session?.user?.id) {
      alert("Хэрэглэгчийн мэдээлэл олдсонгүй. Та нэвтэрч орно уу.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, content, imageUrl, tags: selectedTags }),
      });

      console.log("API хариу:", res); // Хариуны статустай хамт шалгана

      if (res.ok) {
        const data = await res.json();
        console.log('API хариу JSON:', data);
        router.push("/posts");
      } else {
        const errorData = await res.text(); // Хэрэв JSON биш бол текст авах
        console.log("Алдаа:", errorData);
        alert(errorData || "Нийтлэл үүсгэхэд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag)) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="px-6 py-8 sm:px-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Шинэ Нийтлэл Үүсгэх
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Өөрийн бодол, туршлагаа хуваалцана уу
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Гарчиг
              </label>
              <input
                type="text"
                placeholder="Нийтлэлийн гарчиг оруулна уу"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Агуулга
              </label>
              <textarea
                placeholder="Таны бодол, түүх..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Зураг (сонголттой)
              </label>
              <div className="flex">
                <input
                  type="url"
                  placeholder="Зургийн URL оруулна уу"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                  <Image className="text-gray-500" size={20} />
                </span>
              </div>
            </div>

            {/* Таг сонгох хэсэг */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тагууд
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">#{tag}</span>
                  </label>
                ))}
              </div>

              {/* Шинэ таг нэмэх */}
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="Шинэ таг оруулах..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition"
                >
                  <Tag size={20} />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-grow flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                <Save className="mr-2" size={20} />
                {isSubmitting ? "Хадгалж байна..." : "Нийтлэл Үүсгэх"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/posts")}
                className="flex-grow flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              >
                <X className="mr-2" size={20} />
                Цуцлах
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
