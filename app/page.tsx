"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [bearer, setBearer] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  const handleGenerate = async () => {
    if (!url) return;
    const params = new URLSearchParams({ url });
    if (bearer.trim()) params.append("bearer", bearer);

    const res = await fetch(`/api/generate?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      alert("Error: " + err.error);
      return;
    }
    const blob = await res.blob();
    setImageSrc(URL.createObjectURL(blob));
  };

  return (
    <div className="flex flex-col items-center p-8 gap-4">
      <h1 className="text-2xl font-bold">Tweet → Image Generator</h1>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste Tweet URL..."
        className="border p-2 w-96 rounded"
      />

      <input
        type="password"
        value={bearer}
        onChange={(e) => setBearer(e.target.value)}
        placeholder="Enter Bearer token (optional)"
        className="border p-2 w-96 rounded"
      />

      <button
        onClick={handleGenerate}
        disabled={!url.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate
      </button>

      {imageSrc && (
        <div className="mt-4">
          <Image
            src={imageSrc}
            alt="Tweet"
            width={800}
            height={400}
            className="border rounded"
            unoptimized
          />
          <a
            href={imageSrc}
            download="tweet.png"
            className="mt-2 inline-block bg-green-500 text-white px-4 py-2 rounded"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
