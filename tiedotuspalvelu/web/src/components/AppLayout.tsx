import React from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tp">
      <header className="tp__header">Header placeholder</header>
      <main className="tp__container">{children}</main>
      <footer className="tp__footer">Footer placeholder</footer>
    </div>
  );
}
