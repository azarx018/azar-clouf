import React, { createContext, useContext, useEffect, useState } from "react";

const PageTitleContext = createContext(null);

export function PageTitleProvider({ children }) {
  const [title, setTitle] = useState(null);
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

/** Call from a page to set the header's back-button label, e.g. usePageTitle(folder?.name). */
export function usePageTitle(title) {
  const ctx = useContext(PageTitleContext);
  useEffect(() => {
    if (title) ctx.setTitle(title);
    return () => ctx.setTitle(null);
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Used by App.jsx to read the current dynamic title. */
export function usePageTitleValue() {
  const ctx = useContext(PageTitleContext);
  return ctx.title;
}
