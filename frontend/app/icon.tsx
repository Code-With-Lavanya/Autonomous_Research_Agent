import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#2f5cff",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: 5,
            background: "#ffffff",
            opacity: 0.65,
            left: 6,
            top: 19,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: 5,
            background: "#ffffff",
            left: 13,
            top: 11,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: 6,
            background: "#ffffff",
            left: 20,
            top: 6,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
