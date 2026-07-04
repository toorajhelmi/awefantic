import "./globals.css";

export const metadata = {
  title: "Awfantic | Join the waitlist",
  description:
    "Awfantic is validating a focused early-access workflow for founders and teams who want sharper product signal before they build.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
